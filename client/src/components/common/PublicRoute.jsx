import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PublicRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    // If the user is logged in, redirect them to their dashboard
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicRoute;
