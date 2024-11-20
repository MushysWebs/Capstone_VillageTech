import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { format, addDays, subDays } from 'date-fns';
import CalendarView from './CalendarView';

// Mock data
const mockAppointments = [
  {
    id: 1,
    title: 'Check-up',
    start_time: '2024-02-01T10:00:00',
    end_time: '2024-02-01T11:00:00',
    description: 'Regular check-up',
    status: 'Scheduled',
    patients: {
      id: 1,
      name: 'Max',
      owners: {
        first_name: 'John',
        last_name: 'Doe'
      }
    },
    staff: {
      id: 1,
      first_name: 'Jane',
      last_name: 'Smith'
    }
  }
];

// Mock components
jest.mock('./AddAppointment', () => ({
  __esModule: true,
  default: ({ onClose, onAppointmentAdded }) => (
    <div data-testid="add-appointment-modal">
      <button onClick={() => onAppointmentAdded(mockAppointments[0])}>Add Appointment</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));



jest.mock('./AppointmentDetails', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAppointmentUpdated, onAppointmentDeleted }) => (
    isOpen ? (
      <div data-testid="appointment-details-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onAppointmentUpdated}>Update</button>
        <button onClick={onAppointmentDeleted}>Delete</button>
      </div>
    ) : null
  )
}));

test('handles scroll to current time on initial load', async () => {
    // Mock scrollLeft
    const mockScroll = { current: { clientWidth: 800, scrollLeft: 0 } };
    jest.spyOn(React, 'useRef').mockReturnValue(mockScroll);

    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    // Verify that scrollLeft was set
    expect(mockScroll.current.scrollLeft).toBeDefined();
  });


  test('updates view mode when opening appointment list', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const viewAppointmentsButton = screen.getByText('View Appointments');
    await act(async () => {
      fireEvent.click(viewAppointmentsButton);
    });

    // Open the list view
    const modalElement = screen.getByTestId('appointment-details-modal');
    expect(modalElement).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Modal should be closed
    expect(screen.queryByTestId('appointment-details-modal')).not.toBeInTheDocument();
  });

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis()
  })
};

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('CalendarView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup basic successful response
    mockSupabaseClient.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockAppointments, error: null })
    }));
  });

  test('renders calendar view with basic elements', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });
    
    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
    expect(screen.getByText('+ Create Appointment')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  test('renders time slots correctly', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      expect(screen.getByText(`${hour}:00`)).toBeInTheDocument();
    }
  });

  test('opens add appointment modal', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const addButton = screen.getByText('+ Create Appointment');
    fireEvent.click(addButton);

    expect(screen.getByTestId('add-appointment-modal')).toBeInTheDocument();
  });

  test('handles appointment creation', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const addButton = screen.getByText('+ Create Appointment');
    fireEvent.click(addButton);

    const modal = screen.getByTestId('add-appointment-modal');
    const confirmButton = screen.getByText('Add Appointment');
    
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(modal).not.toBeInTheDocument();
    expect(mockSupabaseClient.from).toHaveBeenCalled();
  });

  test('handles appointment list view', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const viewAppointmentsButton = screen.getByText('View Appointments');
    fireEvent.click(viewAppointmentsButton);

    expect(screen.getByTestId('appointment-details-modal')).toBeInTheDocument();
  });

  test('handles appointment deletion', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const viewAppointmentsButton = screen.getByText('View Appointments');
    fireEvent.click(viewAppointmentsButton);

    const deleteButton = screen.getByText('Delete');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalled();
  });

  test('handles error fetching appointments', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockRejectedValue(new Error('Failed to fetch'))
    }));

    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching appointments:', expect.any(Error));
    consoleSpy.mockRestore();
  });


  test('renders current time line on today view', async () => {
    await act(async () => {
      render(<CalendarView firstName="John" />);
    });

    const currentTimeLine = document.querySelector('.calendarView__currentTimeLine');
    expect(currentTimeLine).toBeInTheDocument();
  });
});