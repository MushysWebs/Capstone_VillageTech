import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';

const PrivateRoute = () => {
  const session = useSession();

  if (session === undefined) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;