import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckCircle2, Calendar, User, Plus } from 'lucide-react';

interface BottomNavProps {
  onAddClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onAddClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: CheckCircle2, label: 'Tasks', path: '/tasks' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full z-40">
      <div className="bg-[#101622]/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex justify-between items-center relative">
        
        {/* Left Items */}
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.label}
            id={`nav-${item.label.toLowerCase()}`}
            title={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        {/* Floating Action Button (Spacer) */}
        <div className="w-12"></div>

        {/* Right Items */}
        {navItems.slice(2, 4).map((item) => (
          <button
            key={item.label}
            id={`nav-${item.label.toLowerCase()}`}
            title={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname === item.path ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon size={24} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}

        {/* Actual FAB positioned absolutely */}
        <button 
          onClick={onAddClick}
          title="Add Task"
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_30px_rgb(37,106,244,0.4)] flex items-center justify-center hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 z-50 group border-4 border-[#101622]"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;