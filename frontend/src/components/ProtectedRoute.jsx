import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export const AdminRoute = () => {
    const { currentUser, userData, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return userData && (userData.role === 'admin' || userData.role === 'coach') 
        ? <Outlet /> 
        : <Navigate to="/dashboard" />;
};