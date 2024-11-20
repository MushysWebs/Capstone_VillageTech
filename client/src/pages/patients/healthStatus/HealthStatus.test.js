import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import HealthStatus from './HealthStatus';

// Mock data
const mockPatient = {
  id: 1,
  name: 'Max',
  breed: 'Golden Retriever',
  gender: 'Male',
  color: 'Golden',
  weight: '30',
  notes: 'Test health notes'
};

const mockVitals = [
  {
    id: 1,
    date: '2024-01-01',
    weight: '65',
    temperature: '101.5',
    heart_rate: '80',
    patient_id: 1
  }
];

const mockAllergies = [
  {
    id: 1,
    name: 'Chicken',
    reaction: 'Skin irritation',
    patient_id: 1
  }
];

// Mock Components
jest.mock('../../../components/patientLayout/PatientLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="patient-layout">{children}</div>
}));

jest.mock('../../../components/PatientTabs', () => ({
  __esModule: true,
  default: () => <div data-testid="patient-tabs">Patient Tabs Mock</div>
}));

jest.mock('../../../components/patientSidebar/PatientSidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="patient-sidebar">Patient Sidebar Mock</div>
}));

jest.mock('../../../components/addVitalModal/AddVitalModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAddVital }) => 
    isOpen ? (
      <div data-testid="vital-modal">
        <button onClick={() => onAddVital({ 
          date: '2024-01-02',
          weight: '66',
          temperature: '101.8',
          heart_rate: '82'
        })}>Add Vital</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

jest.mock('../../../components/addAllergyModal/AddAllergyModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAddAllergy }) => 
    isOpen ? (
      <div data-testid="allergy-modal">
        <button onClick={() => onAddAllergy({
          name: 'Beef',
          reaction: 'Digestive issues'
        })}>Add Allergy</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

// Mock Context
jest.mock('../../../context/PatientContext', () => ({
  usePatient: () => ({
    selectedPatient: mockPatient
  })
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis()
  })
};

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('HealthStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful responses
    mockSupabaseClient.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ 
        data: [{ id: 2 }], 
        error: null 
      }),
      update: jest.fn().mockResolvedValue({ error: null }),
      then: jest.fn().mockImplementation((callback) => {
        if (table === 'patient_vitals') {
          return Promise.resolve(callback({ data: mockVitals, error: null }));
        } else if (table === 'patient_allergies') {
          return Promise.resolve(callback({ data: mockAllergies, error: null }));
        }
      })
    }));
  });

  test('renders patient information correctly', async () => {
    await act(async () => {
      render(<HealthStatus />);
    });

    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Golden')).toBeInTheDocument();
  });

  test('displays vitals data correctly', async () => {
    await act(async () => {
      render(<HealthStatus />);
    });

    await waitFor(() => {
      expect(screen.getByText('65 lb')).toBeInTheDocument();
      expect(screen.getByText('101.5 °F')).toBeInTheDocument();
      expect(screen.getByText('80 BPM')).toBeInTheDocument();
    });
  });

  test('displays allergies data correctly', async () => {
    await act(async () => {
      render(<HealthStatus />);
    });

    await waitFor(() => {
      expect(screen.getByText('Chicken')).toBeInTheDocument();
      expect(screen.getByText('Skin irritation')).toBeInTheDocument();
    });
  });

  test('handles editing and saving health notes', async () => {
    await act(async () => {
      render(<HealthStatus />);
    });

    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));

    // Change notes
    const notesTextarea = screen.getByPlaceholderText('Enter health notes...');
    fireEvent.change(notesTextarea, { 
      target: { value: 'Updated health notes' } 
    });

    // Save changes
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
  });


  test('handles error saving health notes', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      update: jest.fn().mockResolvedValue({ error: new Error('Failed to save') }),
      eq: jest.fn().mockReturnThis()
    }));

    await act(async () => {
      render(<HealthStatus />);
    });

    fireEvent.click(screen.getByText('Edit'));
    
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });

    expect(screen.getByText(/Failed to save health notes/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('formats date correctly', async () => {
    await act(async () => {
      render(<HealthStatus />);
    });

    await waitFor(() => {
      const formattedDate = new Date('2024-01-01').toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  test('handles no vitals data', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => 
        Promise.resolve({ data: [], error: null })
      )
    }));

    await act(async () => {
      render(<HealthStatus />);
    });

    await waitFor(() => {
      expect(screen.getByText('No vitals available')).toBeInTheDocument();
    });
  });

  test('handles no allergies data', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => 
        Promise.resolve({ data: [], error: null })
      )
    }));

    await act(async () => {
      render(<HealthStatus />);
    });

    await waitFor(() => {
      expect(screen.getByText('No allergies available')).toBeInTheDocument();
    });
  });
});