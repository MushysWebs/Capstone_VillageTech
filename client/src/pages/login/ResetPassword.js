import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import './ResetPassword.css';

const ResetPassword = () => {
  const supabase = useSupabaseClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');
  const [token, setToken] = useState('');


  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromURL = query.get('access_token');
    if (tokenFromURL) {
      setToken(tokenFromURL);
    } else {
      setError('Invalid or missing token. Please request a new password reset.');
    }
  }, [location]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage('Your password has been reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className={`reset-password-container ${theme}-theme`}>
      <div className="reset-password-sidebar">
        <img
          src={theme === 'light' ? "/whitevillagetech.svg" : "/villagetech.svg"}
          alt="Logo"
          className="reset-password-logo"
        />
      </div>
      <div className="reset-password-form-container">
        <img
          src={theme === 'light' ? "/floweronly.svg" : "/whiteflower.svg"}
          alt="Logo"
          className="reset-password-center-logo"
        />
        <h2 className="reset-password-title">Reset Your Password</h2>
        {error && <p className="reset-password-error">{error}</p>}
        {message && <p className="reset-password-success">{message}</p>}
        {!message && (
          <form className="reset-password-form" onSubmit={handlePasswordReset}>
            <div className="reset-password-input-group">
              <label htmlFor="password" className="reset-password-input-label">New Password</label>
              <input
                id="password"
                className="reset-password-input"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="reset-password-input-group">
              <label htmlFor="confirmPassword" className="reset-password-input-label">Confirm Password</label>
              <input
                id="confirmPassword"
                className="reset-password-input"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button className="reset-password-button" type="submit">Reset Password</button>
          </form>
        )}
        <button className="reset-password-theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
