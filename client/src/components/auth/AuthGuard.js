import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const [cookies] = useCookies(['authToken']);

  useEffect(() => {
    if (!cookies.authToken) {
      // Redirect to login page if no token is found
      navigate('/', { replace: true });
    }
  }, [cookies, navigate]);

  return cookies.authToken ? children : null;
};

export default AuthGuard;
