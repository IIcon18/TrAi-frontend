import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole, UserRole } from '../../utils/auth';

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRoles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRoles }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const role = getUserRole();
    if (!requiredRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
