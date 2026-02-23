import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={48} className="text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[250px]">
        You don't have permission to access the admin dashboard.
      </p>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-medium shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
};

export default UnauthorizedScreen;
