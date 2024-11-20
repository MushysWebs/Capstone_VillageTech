import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import MedicationHistory from './Medication';

// Mock data
const mockPatient = {
  id: 1,
  name: 'Max'
};

const mockMedications = [
  {
    id: 1,
    name: 'Amoxicillin',
    dosage: '500mg',
    frequency: 'Twice daily',
    date_prescribed: '2024-01-01',
    end_date: '2024-01-14',
    reason: 'Infection',
    doctor: 'Dr. Smith',
    instructions: 'Take with food',
    refills: '2',
    status: 'Active'
  }
];

const mockVaccines = [
  {
    id: 1,
    name: 'Rabies',
    date_given: '2024-01-01',
    next_due: '2025-01-01',
    dosage: '1ml',
    frequency: 'Yearly',
    doctor: 'Dr. Smith'
  }
];

const mockNotes = [
  {
    id: 1,
    date: '2024-01-01',
    note: 'Patient responded well to treatment'
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

jest.mock('../../../components/addMedicationModal/AddMedicationModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAddMedication }) => 
    isOpen ? (
      <div data-testid="medication-modal">
        <button onClick={() => onAddMedication({
          name: 'New Medication',
          dosage: '100mg',
          frequency: 'Daily'
        })}>Add Medication</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

jest.mock('./VaccineModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAddVaccine }) => 
    isOpen ? (
      <div data-testid="vaccine-modal">
        <button onClick={onAddVaccine}>Add Vaccine</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

jest.mock('../../../components/addNoteModal/AddNoteModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onAddNote }) => 
    isOpen ? (
      <div data-testid="note-modal">
        <button onClick={() => onAddNote({
          date: '2024-01-02',
          note: 'New note'
        })}>Add Note</button>
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
    insert: jest.fn().mockReturnThis()
  })
};

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('MedicationHistory Component', () => {
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
        then: jest.fn().mockImplementation(() => {
          if (table === 'medications') {
            return Promise.resolve({ data: mockMedications, error: null });
          } else if (table === 'vaccinations') {
            return Promise.resolve({ data: mockVaccines, error: null });
          } else if (table === 'patient_notes') {
            return Promise.resolve({ data: mockNotes, error: null });
          }
        })
      }));
    });
  
    // [Previous working tests remain the same until the failing tests...]
  
    test('handles error adding vaccine', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: jest.fn().mockResolvedValue({ error: new Error('Failed to add') })
      }));
  
      await act(async () => {
        render(<MedicationHistory />);
      });
  
      // Use the className to be more specific
      const addVaccineButton = screen.getByRole('button', { 
        name: 'Add Vaccine',
        className: 'medication-buttons'
      });
      fireEvent.click(addVaccineButton);
      
      await waitFor(() => {
        const modalButton = screen.getByTestId('vaccine-modal').querySelector('button');
        fireEvent.click(modalButton);
      });
  
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

  
    // Add new test to verify modal closing
    test('closes modals correctly', async () => {
      await act(async () => {
        render(<MedicationHistory />);
      });
  
      // Test vaccine modal
      const addVaccineButton = screen.getByRole('button', {
        name: 'Add Vaccine',
        className: 'medication-buttons'
      });
      fireEvent.click(addVaccineButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('vaccine-modal')).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('Close'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('vaccine-modal')).not.toBeInTheDocument();
      });
  
      // Test note modal
      const addNoteButton = screen.getByRole('button', {
        name: 'Add Note',
        className: 'medication-buttons'
      });
      fireEvent.click(addNoteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('note-modal')).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('Close'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('note-modal')).not.toBeInTheDocument();
      });
    });
  });