import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SOC from './SOC';
import { usePatient } from '../../../context/PatientContext';

// Mock data
const mockPatient = {
  id: 1,
  name: 'Max'
};

const mockSocEvents = [
  {
    id: 1,
    patient_id: 1,
    event_name: 'Dental Cleaning',
    type: 'Treatment',
    importance: 'Core',
    fulfilled_at: '2024-01-01',
    next_due: '2024-07-01'
  }
];

const mockVaccinations = [
  {
    id: 1,
    patient_id: 1,
    name: 'Rabies',
    date_given: '2024-01-01',
    next_due: '2025-01-01',
    importance: 'Core'
  }
];

const mockComments = [
  {
    id: 1,
    patient_id: 1,
    comment: 'Test comment',
    created_at: '2024-01-01'
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

// Create mock Supabase response handler
const createSupabaseResponse = (table) => {
  switch(table) {
    case 'soc':
      return Promise.resolve({ data: mockSocEvents, error: null });
    case 'vaccinations':
      return Promise.resolve({ data: mockVaccinations, error: null });
    case 'soc_comments':
      return Promise.resolve({ data: mockComments, error: null });
    default:
      return Promise.resolve({ data: [], error: null });
  }
};

// Mock Supabase client
jest.mock('../../../components/routes/supabaseClient', () => {
  return {
    supabase: {
      from: jest.fn((table) => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(() => createSupabaseResponse(table))
      }))
    }
  };
});

// Get a reference to the mocked supabase client
const { supabase } = require('../../../components/routes/supabaseClient');

describe('SOC Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePatient.mockReturnValue({ selectedPatient: mockPatient });
    window.alert = jest.fn();

    // Reset supabase mock implementation
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      update: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => createSupabaseResponse(table))
    }));
  });


  test('handles adding new SOC event', async () => {
    await act(async () => {
      render(<SOC />);
    });

    // Open modal
    const addButton = screen.getByText('+ Add SOC Event');
    fireEvent.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/Event Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Treatment' } });

    const typeSelect = screen.getByLabelText(/Type/i);
    fireEvent.change(typeSelect, { target: { value: 'Treatment' } });

    // Submit form
    const submitButton = screen.getByText('Add SOC Event');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(supabase.from).toHaveBeenCalledWith('soc');
    expect(window.alert).toHaveBeenCalledWith('Event added successfully.');
  });

  // [Previous tests remain the same, but using supabase instead of mockSupabase...]

  test('handles no comments', async () => {
    // Mock empty comments response
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(() => {
        if (table === 'soc_comments') {
          return Promise.resolve({ data: [], error: null });
        }
        return createSupabaseResponse(table);
      })
    }));

    await act(async () => {
      render(<SOC />);
    });

    await waitFor(() => {
      expect(screen.getByText('No comments yet.')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    await act(async () => {
      render(<SOC />);
    });

    // Try to add event without name
    const addButton = screen.getByText('+ Add SOC Event');
    fireEvent.click(addButton);

    const submitButton = screen.getByText('Add SOC Event');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Event name is required.')).toBeInTheDocument();
  });
});