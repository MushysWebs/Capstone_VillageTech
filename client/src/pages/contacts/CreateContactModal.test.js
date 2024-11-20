import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import CreateContactModal from './CreateContactModal';

// Mock data
const mockFormData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '123-456-7890',
  secondary_phone_number: '098-765-4321',
  address: '123 Main St',
  notes: 'Test notes',
  profile_picture_url: 'https://example.com/photo.jpg'
};

// Mock Icons
jest.mock('lucide-react', () => ({
  X: () => <div>X Icon</div>,
  Camera: () => <div>Camera Icon</div>,
  User: () => <div>User Icon</div>,
  Phone: () => <div>Phone Icon</div>,
  Mail: () => <div>Mail Icon</div>,
  MapPin: () => <div>Map Icon</div>,
  FileText: () => <div>File Icon</div>
}));

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://example.com/${path}` }
      }))
    }))
  }
};

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('CreateContactModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateContact = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    render(
      <CreateContactModal
        isOpen={false}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    expect(screen.queryByText('Create New Contact')).not.toBeInTheDocument();
  });

  test('renders modal content when isOpen is true', () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    expect(screen.getByText('Create New Contact')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email *')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    const firstNameInput = screen.getByPlaceholderText('First Name *');
    const lastNameInput = screen.getByPlaceholderText('Last Name *');
    const emailInput = screen.getByPlaceholderText('Email *');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  test('validates required fields on submit', async () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    const submitButton = screen.getByText('Create');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name, last name, and email are required.')).toBeInTheDocument();
    });

    expect(mockOnCreateContact).not.toHaveBeenCalled();
  });

  test('handles successful contact creation', async () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    const firstNameInput = screen.getByPlaceholderText('First Name *');
    const lastNameInput = screen.getByPlaceholderText('Last Name *');
    const emailInput = screen.getByPlaceholderText('Email *');
    const phoneInput = screen.getByPlaceholderText('Primary Phone');
    const addressInput = screen.getByPlaceholderText('Address');
    
    fireEvent.change(firstNameInput, { target: { value: mockFormData.first_name } });
    fireEvent.change(lastNameInput, { target: { value: mockFormData.last_name } });
    fireEvent.change(emailInput, { target: { value: mockFormData.email } });
    fireEvent.change(phoneInput, { target: { value: mockFormData.phone_number } });
    fireEvent.change(addressInput, { target: { value: mockFormData.address } });

    mockOnCreateContact.mockResolvedValueOnce(mockFormData);

    const submitButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockOnCreateContact).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles contact creation error', async () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    const firstNameInput = screen.getByPlaceholderText('First Name *');
    const lastNameInput = screen.getByPlaceholderText('Last Name *');
    const emailInput = screen.getByPlaceholderText('Email *');
    
    fireEvent.change(firstNameInput, { target: { value: mockFormData.first_name } });
    fireEvent.change(lastNameInput, { target: { value: mockFormData.last_name } });
    fireEvent.change(emailInput, { target: { value: mockFormData.email } });

    mockOnCreateContact.mockRejectedValueOnce(new Error('Failed to create'));

    const submitButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to create contact. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles modal close', () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles optional fields', async () => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={mockOnClose}
        onCreateContact={mockOnCreateContact}
      />
    );
    
    // Fill only required fields
    const firstNameInput = screen.getByPlaceholderText('First Name *');
    const lastNameInput = screen.getByPlaceholderText('Last Name *');
    const emailInput = screen.getByPlaceholderText('Email *');
    
    fireEvent.change(firstNameInput, { target: { value: mockFormData.first_name } });
    fireEvent.change(lastNameInput, { target: { value: mockFormData.last_name } });
    fireEvent.change(emailInput, { target: { value: mockFormData.email } });

    mockOnCreateContact.mockResolvedValueOnce(mockFormData);

    const submitButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockOnCreateContact).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});