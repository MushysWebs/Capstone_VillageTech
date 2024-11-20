import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import AddAppointment from './AddAppointment';

// Mock data
const mockOwner = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '123-456-7890'
};

const mockPet = {
  id: 1,
  name: 'Max',
  owner_id: 1,
  image_url: 'https://example.com/pet.jpg'
};

const mockStaff = {
  id: 1,
  first_name: 'Jane',
  last_name: 'Smith',
  role: 'Veterinarian',
  status: 'Active'
};

// Mock Icons
jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  User: () => <div>User Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
  Clock: () => <div>Clock Icon</div>,
  FileText: () => <div>File Icon</div>,
  Stethoscope: () => <div>Stethoscope Icon</div>,
  X: () => <div>X Icon</div>
}));

const createMockSupabaseMethods = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null })
});

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
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

describe('AddAppointment Component', () => {
  const mockOnClose = jest.fn();
  const mockOnAppointmentAdded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock responses
    const methods = createMockSupabaseMethods();

    mockSupabaseClient.from.mockImplementation((table) => {
      switch (table) {
        case 'owners':
          return {
            ...methods,
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockOwner, error: null })
              }),
              order: jest.fn().mockResolvedValue({ data: [mockOwner], error: null })
            })
          };
        case 'patients':
          return {
            ...methods,
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [mockPet], error: null })
            })
          };
        case 'staff':
          return {
            ...methods,
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({ data: [mockStaff], error: null })
                })
              })
            })
          };
        case 'appointments':
          return {
            ...methods,
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [{ id: 1, patient_name: mockPet.name }],
                error: null
              })
            })
          };
        default:
          return methods;
      }
    });
  });

  test('loads owner details when ownerId is provided', async () => {
    await act(async () => {
      render(
        <AddAppointment
          onClose={mockOnClose}
          onAppointmentAdded={mockOnAppointmentAdded}
          ownerId={1}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue(`${mockOwner.first_name} ${mockOwner.last_name} - ${mockOwner.phone_number}`)).toBeInTheDocument();
    });
  });

  test('loads patient details when patientId and patientName are provided', async () => {
    await act(async () => {
      render(
        <AddAppointment
          onClose={mockOnClose}
          onAppointmentAdded={mockOnAppointmentAdded}
          patientId={1}
          patientName="Max"
        />
      );
    });

    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const patientSelect = selects.find(select => select.name === 'patient_id');
      expect(patientSelect).toBeDisabled();
    });
  });
});