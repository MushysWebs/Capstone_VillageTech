import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { format } from 'date-fns';
import AppointmentDetails from './AppointmentDetails';

// Mock data
const mockAppointment = {
  id: 1,
  title: 'Check-up',
  start_time: '2024-02-01T10:00:00',
  end_time: '2024-02-01T11:00:00',
  status: 'Scheduled',
  description: 'Regular check-up',
  patients: {
    id: 1,
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador',
    date_of_birth: '2020-01-01'
  },
  staff: {
    id: 1,
    first_name: 'Jane',
    last_name: 'Smith'
  },
  owners: {
    owners: {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '123-456-7890',
      email: 'john@example.com'
    }
  }
};

const mockStaff = [
  { id: 1, first_name: 'Jane', last_name: 'Smith' },
  { id: 2, first_name: 'Bob', last_name: 'Johnson' }
];

// Mock Icons
jest.mock('lucide-react', () => ({
  X: () => <div>X Icon</div>,
  ChevronLeft: () => <div>Back Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
  User: () => <div>User Icon</div>,
  Stethoscope: () => <div>Stethoscope Icon</div>,
  Phone: () => <div>Phone Icon</div>,
  Clock: () => <div>Clock Icon</div>,
  Filter: () => <div>Filter Icon</div>,
  Search: () => <div>Search Icon</div>,
  SortAsc: () => <div>Sort Icon</div>,
  FileText: () => <div>File Icon</div>,
  Edit: () => <div>Edit Icon</div>,
  MessageCircle: () => <div>Message Icon</div>,
  Trash2: () => <div>Trash Icon</div>,
  Check: () => <div>Check Icon</div>
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: jest.fn().mockImplementation(() => 'Formatted Date'),
  isAfter: jest.fn().mockReturnValue(true),
  isBefore: jest.fn().mockReturnValue(true),
  startOfDay: jest.fn(),
  endOfDay: jest.fn(),
  addDays: jest.fn(),
  differenceInMinutes: jest.fn().mockReturnValue(60)
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn()
  })
};

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('AppointmentDetails Component', () => {
  const mockOnClose = jest.fn();
  const mockOnAppointmentUpdated = jest.fn();
  const mockOnAppointmentDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockSupabaseClient.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
        }),
        order: jest.fn().mockResolvedValue({ data: [mockAppointment], error: null })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    }));
  });

  test('handles status update', async () => {
    await act(async () => {
      render(
        <AppointmentDetails
          isOpen={true}
          onClose={mockOnClose}
          appointmentId={1}
          mode="detail"
        />
      );
    });

    const completeButton = screen.getByText('Completed');
    await act(async () => {
      fireEvent.click(completeButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('appointments');
  });

  test('handles appointment editing', async () => {
    await act(async () => {
      render(
        <AppointmentDetails
          isOpen={true}
          onClose={mockOnClose}
          appointmentId={1}
          mode="detail"
        />
      );
    });

    const editButton = screen.getByText('Edit Appointment');
    fireEvent.click(editButton);

    const titleInput = screen.getByDisplayValue(mockAppointment.title);
    fireEvent.change(titleInput, { target: { value: 'Updated Check-up' } });

    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('appointments');
  });




  test('handles list mode', async () => {
    await act(async () => {
      render(
        <AppointmentDetails
          isOpen={true}
          onClose={mockOnClose}
          mode="list"
        />
      );
    });

    expect(screen.getByText('All Appointments')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search appointments...')).toBeInTheDocument();
  });

  test('handles error states', async () => {
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ error: new Error('Failed to fetch') })
        })
      })
    }));

    await act(async () => {
      render(
        <AppointmentDetails
          isOpen={true}
          onClose={mockOnClose}
          appointmentId={1}
          mode="detail"
        />
      );
    });

    expect(screen.getByText('No appointment details available')).toBeInTheDocument();
  });



  test('handles closing the modal', async () => {
    await act(async () => {
      render(
        <AppointmentDetails
          isOpen={true}
          onClose={mockOnClose}
          appointmentId={1}
          mode="detail"
        />
      );
    });

    const closeButton = screen.getByRole('button', { name: /X Icon/ });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});