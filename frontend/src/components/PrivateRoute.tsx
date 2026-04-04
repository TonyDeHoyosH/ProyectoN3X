import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasToken = document.cookie
    .split(';')
    .some((c) => c.trim().startsWith('access_token='));

  return hasToken ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
