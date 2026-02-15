
// Rate Limit Configurations
const LIMITS = {
  'auth:login': { max: 5, window: 60 * 1000 }, // 5 attempts per minute
  'auth:register': { max: 2, window: 60 * 60 * 1000 }, // 2 registrations per hour
  'api:general': { max: 100, window: 60 * 1000 }, // 100 requests per minute
};

const STORAGE_KEY = 'taskflow_rate_limits';
const SECURITY_LOG_KEY = 'taskflow_security_logs';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'rate_limit' | 'failed_login' | 'suspicious_activity';
  message: string;
  details?: string;
}

const getStorage = (): Record<string, RateLimitEntry> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const saveStorage = (data: Record<string, RateLimitEntry>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getLogs = (): SecurityLog[] => {
  const data = localStorage.getItem(SECURITY_LOG_KEY);
  return data ? JSON.parse(data) : [];
};

const addLog = (type: SecurityLog['type'], message: string, details?: string) => {
  const logs = getLogs();
  const newLog: SecurityLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    type,
    message,
    details
  };
  // Keep last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem(SECURITY_LOG_KEY, JSON.stringify(updatedLogs));
};

export const rateLimitService = {
  /**
   * Checks if a specific action is within limits.
   * Returns true if allowed, false if blocked.
   */
  checkAndConsume(action: keyof typeof LIMITS, ipMock: string = '127.0.0.1'): { allowed: boolean; waitTime?: number } {
    const limits = LIMITS[action];
    const key = `${action}:${ipMock}`;
    const store = getStorage();
    const now = Date.now();
    
    let entry = store[key];

    // Initialize or Reset Window
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + limits.window
      };
    }

    if (entry.count >= limits.max) {
      const waitTime = Math.ceil((entry.resetTime - now) / 1000);
      addLog('rate_limit', `Rate limit exceeded for ${action}`, `IP: ${ipMock}`);
      return { allowed: false, waitTime };
    }

    // Increment
    entry.count++;
    store[key] = entry;
    saveStorage(store);

    return { allowed: true };
  },

  getStats() {
    const store = getStorage();
    let totalBlocked = getLogs().filter(l => l.type === 'rate_limit').length;
    let activeWindows = Object.keys(store).length;
    
    return {
      totalBlocked,
      activeWindows,
      logs: getLogs()
    };
  },
  
  logSecurityEvent(type: SecurityLog['type'], message: string) {
      addLog(type, message);
  }
};
