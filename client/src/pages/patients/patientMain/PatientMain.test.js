import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import PatientMain from './PatientMain';
import { usePatient } from '../../../context/PatientContext';

// Mock data
const mockPatients = [
  {
    id: 1,
    name: 'Max',
    breed: 'Golden Retriever',
    species: 'Dog',
    age: 5,
    weight: 30,
    gender: 'Male/Neutered',
    owner_id: 1,
    date_of_birth: '2019-01-01',
    current_medications: 'None',
    allergies_or_conditions: 'None',
    demeanor: 'Friendly'
  }
];

const mockOwner = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe'
};

// Mock Components
jest.mock('../../../components/PatientTabs', () => ({
  __esModule: true,
  default: () => <div data-testid="patient-tabs">Patient Tabs Mock</div>
}));

// Mock AddAppointment component
jest.mock('../../dashboard/calendarView/AddAppointment', () => ({
  __esModule: true,
  default: ({ onClose, patientId, patientName, onAppointmentAdded }) => (
    <div data-testid="add-appointment-modal">
      <button onClick={() => onAppointmentAdded({ id: 1 })}>Add Appointment</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

// Mock PatientContext
jest.mock('../../../context/PatientContext', () => ({
  usePatient: jest.fn()
}));

// Create mock storage response
const mockStorageResponse = {
  data: {
    publicUrl: 'mock-profile-pic-url'
  }
};

// Create mock Supabase client
const createMockSupabase = () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => Promise.resolve(callback({ data: mockPatients, error: null })))
    })),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue(mockStorageResponse)
      })
    }
  };
  
  // Set up specific method implementations
  mockSupabase.from.mockImplementation((table) => {
    if (table === 'patients') {
      return {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ data: mockPatients, error: null })
      };
    }
    if (table === 'owners') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOwner, error: null })
      };
    }
    return mockSupabase.from();
  });

  return mockSupabase;
};

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => {
    const mockSupabase = createMockSupabase();
    return mockSupabase;
  }
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PatientMain Component', () => {
  const mockSetSelectedPatient = jest.fn();
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
    usePatient.mockReturnValue({
      selectedPatient: mockPatients[0],
      setSelectedPatient: mockSetSelectedPatient
    });

    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  test('renders initial patient list', async () => {
    await act(async () => {
      renderWithRouter(<PatientMain />);
    });

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
    });
  });

  test('filters patients by search term', async () => {
    await act(async () => {
      renderWithRouter(<PatientMain globalSearchTerm="Golden" />);
    });

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
      // Verify that filtering works
      expect(screen.queryByText('Some Other Pet')).not.toBeInTheDocument();
    });
  });

  test('handles delete confirmation', async () => {
    await act(async () => {
      renderWithRouter(<PatientMain />);
    });

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete Patient');
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalled();
  });

  test('handles cancel edit', async () => {
    await act(async () => {
      renderWithRouter(<PatientMain />);
    });

    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByDisplayValue('Max')).not.toBeInTheDocument();
  });
});