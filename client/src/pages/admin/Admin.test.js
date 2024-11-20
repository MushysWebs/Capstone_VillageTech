// src/client/src/pages/admin/Admin.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import Admin from './Admin';
jest.setTimeout(10000);

// Mock staff data
const mockStaffData = {
  id: 1,
  user_id: '123',
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
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

// Mock Components
jest.mock('../../components/auth/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>
}));

jest.mock('../../components/addStaffModal/AddStaffModal', () => ({
    __esModule: true,
    default: ({ isOpen, onClose, onAddStaff }) => 
      isOpen ? (
        <div data-testid="add-staff-modal">
          <button onClick={onAddStaff} data-testid="modal-add-button">Add New Staff</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null
  }));

// Mock Icons
jest.mock('lucide-react', () => ({
  Edit2: () => <div>Edit Icon</div>,
  X: () => <div>X Icon</div>,
  Save: () => <div>Save Icon</div>,
  Trash2: () => <div>Trash Icon</div>,
  Phone: () => <div>Phone Icon</div>,
  Mail: () => <div>Mail Icon</div>,
  MapPin: () => <div>Map Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
  User: () => <div>User Icon</div>,
  AlertCircle: () => <div>Alert Icon</div>,
  Camera: () => <div>Camera Icon</div>
}));

// Mock supabase module with a getter
jest.mock('../../components/routes/supabaseClient', () => {
  let mockSupabase = null;
  return {
    get supabase() {
      if (!mockSupabase) {
        mockSupabase = {
          from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: [mockStaffData], error: null })
              })
            }),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis()
          }),
          storage: {
            from: jest.fn().mockReturnValue({
              upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
              getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' }, error: null })
            })
          }
        };
      }
      return mockSupabase;
    }
  };
});

// Get a reference to the mock supabase instance
const mockSupabaseClient = require('../../components/routes/supabaseClient').supabase;

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSession: () => ({
    user: { id: '123' }
  })
}));

describe('Admin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.from.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ data: [mockStaffData], error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValue({ error: null }),
      eq: jest.fn().mockReturnThis()
    }));
  });

  test('renders staff list', async () => {
    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('handles role filter', async () => {
    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      const roleSelect = screen.getByRole('combobox');
      fireEvent.change(roleSelect, { target: { value: 'Vet Tech' } });
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });

  test('opens staff modal', async () => {
    render(<Admin globalSearchTerm="" />);
    
    const addButton = screen.getByText('Add Staff');
    fireEvent.click(addButton);
    
    expect(screen.getByTestId('add-staff-modal')).toBeInTheDocument();
  });

  test('handles staff editing', async () => {
    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

    const saveButton = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });

  test('handles staff deletion', async () => {
    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });

    const deleteButton = screen.getByText('Delete Staff Member');
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText('Delete Permanently');
    await act(async () => {
      fireEvent.click(confirmDeleteButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });


  // Test global search filtering (lines 66-67)
  test('filters staff by global search term', async () => {
    render(<Admin globalSearchTerm="doe" />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Render with email search
    render(<Admin globalSearchTerm="john@example" />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Render with phone search
    render(<Admin globalSearchTerm="123-456" />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });


  // Test profilePicture update workflow (lines 122-149)
  test('updates profile picture with URL after upload', async () => {
    const mockPublicUrl = 'https://example.com/newphoto.jpg';
    mockSupabaseClient.storage.from.mockImplementation(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl }, error: null })
    }));

    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByDisplayValue('').closest('input[type="file"]');

    await act(async () => {
      userEvent.upload(fileInput, file);
    });

    const saveButton = screen.getByText('Save');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });


  // Test modal operations
  test('closes modal and refreshes staff list', async () => {
    render(<Admin globalSearchTerm="" />);
    
    const addButton = screen.getByText('Add Staff');
    fireEvent.click(addButton);
    
    const modalAddButton = screen.getByTestId('modal-add-button');
    await act(async () => {
      fireEvent.click(modalAddButton);
    });
  
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });

  test('handles error fetching staff', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({ error: new Error('Failed to fetch') })
    }));

    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test('handles file upload error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.storage.from.mockImplementationOnce(() => ({
      upload: jest.fn().mockResolvedValue({ error: new Error('Upload failed') }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' }, error: null })
    }));
  
    render(<Admin globalSearchTerm="" />);
    
    await waitFor(() => {
      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);
    });
  
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
  
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByDisplayValue('').closest('input[type="file"]');
  
    await act(async () => {
      userEvent.upload(fileInput, file);
      // Wait for the error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
    });
  
    consoleSpy.mockRestore();
  });
});