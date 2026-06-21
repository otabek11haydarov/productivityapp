import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from '../ui/toaster';

export function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-background text-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
