import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const PrivateRoute = () => {
  const [cookies] = useCookies(['authToken']);

  if (!cookies.authToken) {
    // If there's no auth token, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If there is a token, render the child routes
  return <Outlet />;
};

export default PrivateRoute