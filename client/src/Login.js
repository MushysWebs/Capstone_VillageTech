import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './Login.css';


const Login = () => {
  const [theme, setTheme] = useState('light');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const session = useSession();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { employeeId, password });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${employeeId}@yourdomain.com`, // Adjust this based on your Supabase setup
        password: password,
      });

      if (error) throw error;

      if (data.session) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className={`container ${theme}-theme nunito-light`}>
      <div className="sidebar">
        <img
          src={theme === 'light' ? "/whitevillagetech.svg" : "/villagetech.svg"}
          alt="Logo"
          className="logo"
        />
      </div>
      <div className="form-container">
        <img
          src={theme === 'light' ? "/floweronly.svg" : "/whiteflower.svg"}
          alt="Logo"
          className="center-logo"
        />
        <h2 className="welcome-text">Welcome back!</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="employeeId" className="input-label">Employee ID</label>
            <input
              id="employeeId"
              className="input nunito-light"
              type="text"
              placeholder="ID"
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
              placeholder="password"
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
          <a href="#" className="forgot-password nunito-bold">Forgot password?</a>
          {error && <p className="error">{error}</p>} {/* Display error message */}
          <button className="button nunito-light" type="submit">Sign In</button>
        </form>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
};

export default Login;
