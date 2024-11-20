import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Clinical from './Clinical';
jest.setTimeout(10000);

// Mock data
const mockPatient = {
  id: 1,
  name: 'Max',
  species: 'Dog',
  breed: 'Labrador',
  gender: 'Male',
  owner_id: 1
};

const mockClinicalData = {
  id: 1,
  patient_id: 1,
  abnormalities: 'None',
  diet: 'Regular',
  xray_file: 'https://example.com/xray.jpg'
};

const mockMedications = [
  {
    id: 1,
    patient_id: 1,
    name: 'Medicine A',
    dosage: '10mg',
    frequency: 'Daily',
    date_prescribed: '2024-01-01'
  }
];

const mockTreatments = [
  {
    id: 1,
    patient_id: 1,
    event_name: 'Checkup',
    fulfilled_at: '2024-01-01'
  }
];

const mockOwner = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  address: '123 Main St',
  phone_number: '123-456-7890'
};

// Mock components
jest.mock('../../../components/PatientTabs', () => () => <div>PatientTabs Mock</div>);
jest.mock('../../../components/patientSidebar/PatientSidebar', () => () => <div>PatientSidebar Mock</div>);
jest.mock('../../../components/patientLayout/PatientLayout', () => ({ children }) => <div>{children}</div>);

// Mock PatientContext
jest.mock('../../../context/PatientContext', () => ({
  usePatient: () => ({
    selectedPatient: mockPatient,
    setSelectedPatient: jest.fn()
  })
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Edit2: () => <div>Edit Icon</div>,
  Save: () => <div>Save Icon</div>
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockClinicalData, error: null })
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' }, error: null })
    })
  }
};

// Mock auth hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('Clinical Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.from.mockImplementation((table) => {
      const responses = {
        clinical_records: { data: mockClinicalData, error: null },
        medications: { data: mockMedications, error: null },
        soc: { data: mockTreatments, error: null },
        owners: { data: mockOwner, error: null }
      };

      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(responses[table])
      };
    });
  });

  test('renders clinical page', async () => {
    await act(async () => {
      render(<Clinical />);
    });

    expect(screen.getByText('Clinical Record')).toBeInTheDocument();
  });

  test('displays patient information', async () => {
    await act(async () => {
      render(<Clinical />);
    });

    await waitFor(() => {
      expect(screen.getByText('Max')).toBeInTheDocument();
      expect(screen.getByText('Labrador')).toBeInTheDocument();
    });
  });


  test('handles error fetching clinical data', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ error: new Error('Failed to fetch') })
    }));

    await act(async () => {
      render(<Clinical />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch clinical data/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });



  test('displays owner information', async () => {
    await act(async () => {
      render(<Clinical />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    });
  });


});