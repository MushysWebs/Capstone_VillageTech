import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Dashboard from './Dashboard';

// Mock data
const mockUser = {
  id: 'user123',
  first_name: 'John'
};

// Mock session
const mockSession = {
  user: {
    id: 'user123'
  }
};

// Mock CalendarView component
jest.mock('./calendarView/CalendarView', () => ({
  __esModule: true,
  default: ({ firstName, searchTerm }) => (
    <div data-testid="calendar-view">
      Calendar View (First Name: {firstName}, Search Term: {searchTerm || 'none'})
    </div>
  )
}));

// Mock AuthGuard component
jest.mock('../../components/auth/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="auth-guard">{children}</div>
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  })
};

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSession: () => mockSession
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful response
    mockSupabaseClient.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
    }));
  });

  test('renders dashboard with auth guard', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  test('fetches and displays user first name', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(/First Name: John/)).toBeInTheDocument();
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });

  test('handles empty search term', async () => {
    await act(async () => {
      render(<Dashboard globalSearchTerm="" />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Search Term: none/)).toBeInTheDocument();
    });
  });

  test('passes search term to calendar view', async () => {
    await act(async () => {
      render(<Dashboard globalSearchTerm="test search" />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Search Term: test search/)).toBeInTheDocument();
    });
  });

  test('handles error fetching user name', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Failed to fetch') 
      })
    }));

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching user name:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test('handles missing session', async () => {
    // Temporarily override useSession to return null
    jest.spyOn(require('@supabase/auth-helpers-react'), 'useSession')
      .mockReturnValue(null);

    await act(async () => {
      render(<Dashboard />);
    });

    // Should render but not make any Supabase calls
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  test('handles missing user id in session', async () => {
    // Temporarily override useSession to return session without user id
    jest.spyOn(require('@supabase/auth-helpers-react'), 'useSession')
      .mockReturnValue({ user: {} });

    await act(async () => {
      render(<Dashboard />);
    });

    // Should render but not make any Supabase calls
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });
});