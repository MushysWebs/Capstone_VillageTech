// AuthGuard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      // Redirect to login page if no token is found
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return localStorage.getItem('authToken') ? children : null;
};

export default AuthGuard;
