import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TasksScreen from './screens/TasksScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import CalendarScreen from './screens/CalendarScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProjectSettingsScreen from './screens/ProjectSettingsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import BottomNav from './components/BottomNav';
import NewTaskModal from './components/NewTaskModal';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedScreen from './screens/UnauthorizedScreen.tsx';
import { useAuthStore } from './store/authStore';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const { user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-slate-50 dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Determine if we should hide bottom nav
  const authRoutes = ['/', '/register', '/unauthorized'];
  const fullScreenRoutes = ['/settings', '/admin'];
  const hideBottomNav = authRoutes.includes(location.pathname) || fullScreenRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-slate-50 dark:bg-background-dark overflow-hidden shadow-2xl flex flex-col transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <main className="flex-1 relative z-10 overflow-y-auto hide-scrollbar pb-24">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            user ? <Navigate to="/home" replace /> : <LoginScreen />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/home" replace /> : <RegisterScreen />
          } />
          <Route path="/unauthorized" element={<UnauthorizedScreen />} />

          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomeScreen />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <TasksScreen />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsScreen />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarScreen />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileScreen />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <ProjectSettingsScreen />
            </ProtectedRoute>
          } />

          {/* Admin Only Route */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboardScreen />
            </ProtectedRoute>
          } />

          {/* Catch all - redirect to home or login */}
          <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
        </Routes>
      </main>

      {!hideBottomNav && user && (
        <>
          <BottomNav onAddClick={() => setIsModalOpen(true)} />
          {isModalOpen && <NewTaskModal onClose={() => setIsModalOpen(false)} />}
        </>
      )}
    </div>
  );
};

export default App;