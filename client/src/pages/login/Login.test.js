import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Supabase client
const mockSupabaseAuth = {
  getSession: jest.fn(),
  signInWithPassword: jest.fn(),
  resetPasswordForEmail: jest.fn()
};

const mockSupabaseClient = {
  auth: mockSupabaseAuth
};

jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation - no active session
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null } });
  });


  test('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ 
      error: new Error(errorMessage) 
    });
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText('Employee Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await act(async () => {
      userEvent.type(emailInput, 'test@example.com');
      userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText('Incorrect username or password')).toBeInTheDocument();
  });

  test('handles password visibility toggle', () => {
    render(<Login />);
    
    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('redirects to dashboard if session exists', async () => {
    mockSupabaseAuth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'test-user' } } }
    });

    await act(async () => {
      render(<Login />);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('switches to forgot password form', async () => {
    render(<Login />);
    
    const forgotPasswordLink = screen.getByText('Forgot password?');
    fireEvent.click(forgotPasswordLink);

    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter Your Email')).toBeInTheDocument();
  });
  

  test('validates email field in password reset form', async () => {
    render(<Login />);
    
    fireEvent.click(screen.getByText('Forgot password?'));
    
    const submitButton = screen.getByText('Send Reset Email');

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Please enter your email to reset your password.')).toBeInTheDocument();
  });

  test('returns to login form from password reset form', () => {
    render(<Login />);
    
    fireEvent.click(screen.getByText('Forgot password?'));
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Back to Login'));
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('handles network errors during login', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseAuth.signInWithPassword.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText('Employee Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');

    await act(async () => {
      userEvent.type(emailInput, 'test@example.com');
      userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText('Incorrect username or password')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Error during login:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});