// src/client/src/pages/admin/Account.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import Account from './Account';
jest.setTimeout(10000);

// Mock staff data
const mockStaffData = {
  id: 1,
  user_id: '123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  secondary_phone: '098-765-4321',
  role: 'Veterinarian',
  status: 'Active',
  hire_date: '2024-01-01',
  address: '123 Main St',
  emergency_contact: 'Jane Doe: 555-0123',
  notes: 'Test notes',
  photo_url: 'https://example.com/photo.jpg'
};

// Mock Supabase client with proper function chain
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockStaffData, error: null })
      })
    })
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' }, error: null })
    })
  }
};

// Mock Components
jest.mock('../../components/auth/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>
}));

// Mock Icons
jest.mock('lucide-react', () => ({
  Camera: () => <div>Camera Icon</div>,
  Edit2: () => <div>Edit Icon</div>,
  Save: () => <div>Save Icon</div>,
  X: () => <div>X Icon</div>,
  Phone: () => <div>Phone Icon</div>,
  Mail: () => <div>Mail Icon</div>,
  MapPin: () => <div>Map Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
  User: () => <div>User Icon</div>,
  AlertCircle: () => <div>Alert Icon</div>,
  Building: () => <div>Building Icon</div>
}));

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSession: () => ({
    user: { id: '123' }
  })
}));

describe('Account Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockStaffData, error: null }),
      update: jest.fn().mockReturnThis()
    }));
  });

  test('renders account information', async () => {
    render(<Account />);
    
    await waitFor(() => {
      expect(screen.getByText('My Account')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Veterinarian', { selector: '.acc-role-badge' })).toBeInTheDocument();
    expect(screen.getByText('Active', { selector: '.acc-status-badge' })).toBeInTheDocument();
  });


  test('handles edit mode', async () => {
    render(<Account />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Check edit mode fields
    expect(screen.getByPlaceholderText('First Name')).toHaveValue('John');
    expect(screen.getByPlaceholderText('Last Name')).toHaveValue('Doe');
  });

  test('displays error message when fetch fails', async () => {
    // Mock fetch error
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Fetch failed'))
    }));

    render(<Account />);

    await waitFor(() => {
      expect(screen.getByText(/Error fetching staff data/i)).toBeInTheDocument();
    });
  });

  // Test handleCancel (lines 53-56)
test('handles cancel edit mode', async () => {
    render(<Account />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  
    // Enter edit mode
    fireEvent.click(screen.getByText(/Edit Profile/i));
    
    // Make changes
    const firstNameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
  
    // Cancel changes
    fireEvent.click(screen.getByText(/Cancel/i));
    
    // Check if we're back to view mode with original data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('First Name')).not.toBeInTheDocument();
  });

  
  // Test handleInputChange (lines 96-97)
  test('handles input changes', async () => {
    render(<Account />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  
    // Enter edit mode
    fireEvent.click(screen.getByText(/Edit Profile/i));
  
    // Make changes to various fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { 
      target: { value: 'Jane' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { 
      target: { value: 'Smith' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'jane@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Address'), { 
      target: { value: 'New Address' } 
    });
  
    // Verify the changes
    expect(screen.getByPlaceholderText('First Name')).toHaveValue('Jane');
    expect(screen.getByPlaceholderText('Last Name')).toHaveValue('Smith');
    expect(screen.getByPlaceholderText('Email')).toHaveValue('jane@example.com');
    expect(screen.getByPlaceholderText('Address')).toHaveValue('New Address');
  });
});