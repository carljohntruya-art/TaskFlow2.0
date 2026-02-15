import emailjs from '@emailjs/browser';
import { User } from '../types';
import { rateLimitService } from './rateLimitService';

// Using local storage to simulate a database for this demo
const USERS_KEY = 'taskflow_users';
const LOCKOUT_THRESHOLD = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  requiresVerification?: boolean;
}

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
  isVerified: boolean;
  verificationCode?: string;
  failedAttempts: number;
  lockUntil?: number; // Timestamp
}

const getStoredUsers = (): StoredUser[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Simple hashing simulation using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const algorithm = { name: "PBKDF2", hash: "SHA-256", iterations: 1000, salt: enc.encode(salt) };
  const key = await window.crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  const derivedBits = await window.crypto.subtle.deriveBits(algorithm, key, 256);
  return Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const generateSalt = () => Math.random().toString(36).substring(2, 15);
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const authService = {
  
  getAllUsers(): User[] {
      const users = getStoredUsers();
      // Return safe user objects
      return users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          role: u.role
      }));
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    // 1. Check Global Rate Limit (Register Abuse)
    const limitCheck = rateLimitService.checkAndConsume('auth:register');
    if (!limitCheck.allowed) {
        return { 
            success: false, 
            message: `Too many registration attempts. Please wait ${Math.ceil(limitCheck.waitTime! / 60)} minutes.` 
        };
    }

    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists.' };
    }

    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    const verificationCode = generateVerificationCode();

    // First registered user becomes Admin
    const role: 'admin' | 'user' = users.length === 0 ? 'admin' : 'user';

    const newUser: StoredUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
      role,
      passwordHash: hash,
      salt,
      isVerified: false,
      verificationCode,
      failedAttempts: 0
    };

    users.push(newUser);
    saveUsers(users);

    // Integrate with EmailJS here
    this.sendVerificationEmail(email, name, verificationCode);

    return { success: true, message: 'Registration successful. Please verify your email.', requiresVerification: true };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    // 1. Check Rate Limit (Brute Force Protection at Request Level)
    const limitCheck = rateLimitService.checkAndConsume('auth:login');
    if (!limitCheck.allowed) {
        return { 
            success: false, 
            message: `Too many login attempts. Please wait ${limitCheck.waitTime} seconds.` 
        };
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      rateLimitService.logSecurityEvent('failed_login', `Login failed for unknown user: ${email}`);
      return { success: false, message: 'Invalid email or password.' }; // Generic message for security
    }

    const user = users[userIndex];

    // Check Account-Specific Lockout
    if (user.lockUntil && Date.now() < user.lockUntil) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return { success: false, message: `Account locked. Try again in ${remaining} minutes.` };
    }

    // Check Password
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      
      rateLimitService.logSecurityEvent('failed_login', `Login failed for user: ${email}`);

      if (user.failedAttempts >= LOCKOUT_THRESHOLD) {
        user.lockUntil = Date.now() + LOCKOUT_DURATION;
        saveUsers(users);
        rateLimitService.logSecurityEvent('suspicious_activity', `Account locked due to attempts: ${email}`);
        return { success: false, message: 'Account locked due to too many failed attempts.' };
      }

      saveUsers(users);
      return { success: false, message: 'Invalid email or password.' };
    }

    // Reset failed attempts on success
    if (user.failedAttempts > 0 || user.lockUntil) {
      user.failedAttempts = 0;
      user.lockUntil = undefined;
      saveUsers(users);
    }

    if (!user.isVerified) {
       return { success: false, requiresVerification: true, message: 'Account not verified.' };
    }

    return { success: true, user: { ...user } };
  },

  verifyEmail(email: string, code: string): AuthResponse {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) return { success: false, message: 'User not found' };

    const user = users[userIndex];
    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = undefined;
      saveUsers(users);
      return { success: true, message: 'Email verified successfully!', user: { ...user } };
    }

    return { success: false, message: 'Invalid verification code.' };
  },

  async sendVerificationEmail(email: string, name: string, code: string) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('[EmailJS] Configuration missing. Falling back to mock.');
      console.log(`[EmailJS Mock] Sending to ${email}: Your verification code is ${code}`);
      return;
    }

    try {
      const templateParams = {
        to_email: email,
        to_name: name,
        verification_code: code,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log(`[EmailJS] Verification email sent to ${email}`);
    } catch (error) {
      console.error('[EmailJS] Failed to send email:', error);
      // Fallback to mock for local testing if EmailJS fails (e.g. quota)
      console.log(`[EmailJS Mock Fallback] Verification code for ${email} is ${code}`);
    }
  }
};
