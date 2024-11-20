
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import ResetPassword from './ResetPassword';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Supabase client
const mockSupabaseAuth = {
  updateUser: jest.fn()
};

const mockSupabaseClient = {
  auth: mockSupabaseAuth
};

jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

// Mock setTimeout
jest.useFakeTimers();

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseAuth.updateUser.mockReset();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });


  test('handles successful password reset', async () => {
    mockSupabaseAuth.updateUser.mockResolvedValueOnce({ error: null });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await act(async () => {
      userEvent.type(newPasswordInput, 'newpassword123');
      userEvent.type(confirmPasswordInput, 'newpassword123');
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Your password has been reset successfully. Redirecting to login...')).toBeInTheDocument();
    
    // Verify form is hidden after success
    expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();

    // Fast-forward timers and verify navigation
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles password reset error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseAuth.updateUser.mockRejectedValueOnce(new Error('Update failed'));
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await act(async () => {
      userEvent.type(newPasswordInput, 'newpassword123');
      userEvent.type(confirmPasswordInput, 'newpassword123');
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Failed to reset password. Please try again.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('handles Supabase error response', async () => {
    mockSupabaseAuth.updateUser.mockResolvedValueOnce({ 
      error: new Error('Invalid password format') 
    });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await act(async () => {
      userEvent.type(newPasswordInput, 'newpassword123');
      userEvent.type(confirmPasswordInput, 'newpassword123');
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Failed to reset password. Please try again.')).toBeInTheDocument();
  });


  test('prevents form submission after successful reset', async () => {
    mockSupabaseAuth.updateUser.mockResolvedValueOnce({ error: null });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });

    await act(async () => {
      userEvent.type(newPasswordInput, 'newpassword123');
      userEvent.type(confirmPasswordInput, 'newpassword123');
      fireEvent.click(submitButton);
    });

    // Verify form is no longer visible
    expect(screen.queryByRole('button', { name: 'Reset Password' })).not.toBeInTheDocument();
  });


  test('updates password state on input change', () => {
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');

    fireEvent.change(newPasswordInput, { target: { value: 'test123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'test123' } });

    expect(newPasswordInput.value).toBe('test123');
    expect(confirmPasswordInput.value).toBe('test123');
  });
});