import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', gradient = false }) => {
  const baseStyle = "backdrop-blur-xl border shadow-lg transition-all duration-300";
  
  // Adaptive colors for light/dark mode
  const bgStyle = gradient 
    ? "bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5" 
    : "bg-white/70 dark:bg-[#1e293b]/40";
    
  const borderStyle = "border-white/40 dark:border-white/10";

  return (
    <div className={`${baseStyle} ${bgStyle} ${borderStyle} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;