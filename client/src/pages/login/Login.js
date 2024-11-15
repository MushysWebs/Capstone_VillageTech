import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import './Login.css';

const Login = () => {
  const [theme, setTheme] = useState('light');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkSession();
  }, [navigate, supabase.auth]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: employeeId,
        password: password,
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      setError('Incorrect username or password');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    if (!resetEmail) {
      setError('Please enter your email to reset your password.');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      setError('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className={`login-container ${theme}-theme nunito-light`}>
      <div className="sidebar">
        <img
          src={theme === 'light' ? "/whitevillagetech.svg" : "/villagetech.svg"}
          alt="Logo"
          className="logo"
        />
      </div>
      <div className="login-form-container">
        <img
          src={theme === 'light' ? "/floweronly.svg" : "/whiteflower.svg"}
          alt="Logo"
          className="center-logo"
        />
        <h2 className="welcome-text">Welcome back!</h2>

        {!forgotPassword ? (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="employeeId" className="input-label">Employee Email</label>
              <input
                id="employeeId"
                className="input nunito-light"
                type="text"
                placeholder="Email"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                className="input password-input nunito-light"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
              </button>
            </div>
            <a
              href="#"
              className="forgot-password nunito-bold"
              onClick={() => setForgotPassword(true)}
            >
              Forgot password?
            </a>
            {error && <p className="error">{error}</p>}
            <button className="button nunito-light" type="submit">Sign In</button>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleForgotPassword}>
            <h2 className="forgot-password-title">Reset Your Password</h2>
            <div className="input-group">
              <label htmlFor="resetEmail" className="input-label">Enter Your Email</label>
              <input
                id="resetEmail"
                className="input nunito-light"
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            {error && <p className="error">{error}</p>}
            {resetMessage && <p className="success">{resetMessage}</p>}
            <button className="button nunito-light" type="submit">Send Reset Email</button>
            <button
              className="button secondary-button"
              onClick={() => setForgotPassword(false)}
              type="button"
            >
              Back to Login
            </button>
          </form>
        )}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default Login;
