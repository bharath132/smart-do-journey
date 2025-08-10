import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Allow access if user is authenticated or in guest mode
  if (user || isGuest) {
    return <>{children}</>;
  }

  // This should not happen as the App component handles routing
  return null;
};

export default ProtectedRoute; 