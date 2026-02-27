import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRoles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();

  // Ждём завершения гидратации из localStorage —
  // без этого пользователь получит ложный редирект на /login при перезагрузке
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
