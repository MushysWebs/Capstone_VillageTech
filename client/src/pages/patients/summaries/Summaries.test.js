import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Summaries from './Summaries';
import { usePatient } from '../../../context/PatientContext';

// Mock data
const mockPatient = {
  id: 1,
  owner_id: 1,
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 5,
  date_of_birth: '2019-01-01',
  gender: 'Male',
  microchip_number: '123456789',
  weight: 30,
  rabies_number: 'RAB123',
  color: 'Golden',
  notes: 'Test notes'
};

const mockOwner = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  address: '123 Main St',
  notes: 'Owner notes'
};

const mockInvoices = [
  {
    invoice_id: 1,
    invoice_name: 'Check-up',
    invoice_total: 100.00,
    invoice_status: 'Pending',
    invoice_date: '2024-01-01'
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

// Mock PatientContext
jest.mock('../../../context/PatientContext', () => ({
  usePatient: jest.fn()
}));

// Create mock response handler
const createSupabaseResponse = (table) => {
  switch(table) {
    case 'owners':
      return Promise.resolve({ data: [mockOwner], error: null });
    case 'patients':
      return Promise.resolve({ data: [mockPatient], error: null });
    case 'invoices':
      return Promise.resolve({ data: mockInvoices, error: null });
    default:
      return Promise.resolve({ data: [], error: null });
  }
};

// Mock Supabase client
jest.mock('../../../components/routes/supabaseClient', () => ({
  supabase: {
    from: jest.fn((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => createSupabaseResponse(table))
    }))
  }
}));

// Get reference to mocked supabase client
const { supabase } = require('../../../components/routes/supabaseClient');

describe('Summaries Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePatient.mockReturnValue({ selectedPatient: mockPatient });

    // Reset supabase mock implementation
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => createSupabaseResponse(table))
    }));
  });

  test('renders all sections', async () => {
    await act(async () => {
      render(<Summaries />);
    });

    await waitFor(() => {
      expect(screen.getByText('Owner Details')).toBeInTheDocument();
      expect(screen.getByText('Patient Details')).toBeInTheDocument();
      expect(screen.getByText('Outstanding Invoices')).toBeInTheDocument();
      expect(screen.getByText('Summary Notes')).toBeInTheDocument();
    });
  });


  test('handles empty data', async () => {
    // Mock empty responses
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    await act(async () => {
      render(<Summaries />);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/N\/A/i).length).toBeGreaterThan(0);
      expect(screen.getByText('No summary notes available')).toBeInTheDocument();
    });
  });

  test('handles null values in patient data', async () => {
    const nullPatient = { ...mockPatient };
    Object.keys(nullPatient).forEach(key => {
      if (key !== 'id' && key !== 'owner_id') nullPatient[key] = null;
    });

    supabase.from.mockImplementationOnce((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [nullPatient], error: null })
    }));

    await act(async () => {
      render(<Summaries />);
    });

    await waitFor(() => {
      const naElements = screen.getAllByText(/N\/A/i);
      expect(naElements.length).toBeGreaterThan(0);
    });
  });
});