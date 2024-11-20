import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import VaccineModal from './VaccineModal';

// Mock data
const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  patientId: 1,
  onAddVaccine: jest.fn()
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis()
  })
};

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

describe('VaccineModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful response
    mockSupabaseClient.from.mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue({ error: null })
    }));
  });

  test('renders nothing when not open', () => {
    render(
      <VaccineModal
        {...mockProps}
        isOpen={false}
      />
    );
    expect(screen.queryByText('Add Vaccine')).not.toBeInTheDocument();
  });

  test('renders form elements when open', () => {
    render(<VaccineModal {...mockProps} />);
    
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dosage:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Frequency:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Given:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Next Due:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Doctor:/i)).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(<VaccineModal {...mockProps} />);
    
    const nameInput = screen.getByLabelText(/Name:/i);
    const dosageInput = screen.getByLabelText(/Dosage:/i);
    const frequencyInput = screen.getByLabelText(/Frequency:/i);
    const dateGivenInput = screen.getByLabelText(/Date Given:/i);
    const nextDueInput = screen.getByLabelText(/Next Due:/i);
    const doctorInput = screen.getByLabelText(/Doctor:/i);

    fireEvent.change(nameInput, { target: { value: 'Rabies' } });
    fireEvent.change(dosageInput, { target: { value: '1ml' } });
    fireEvent.change(frequencyInput, { target: { value: 'Yearly' } });
    fireEvent.change(dateGivenInput, { target: { value: '2024-01-01' } });
    fireEvent.change(nextDueInput, { target: { value: '2025-01-01' } });
    fireEvent.change(doctorInput, { target: { value: 'Dr. Smith' } });

    expect(nameInput.value).toBe('Rabies');
    expect(dosageInput.value).toBe('1ml');
    expect(frequencyInput.value).toBe('Yearly');
    expect(dateGivenInput.value).toBe('2024-01-01');
    expect(nextDueInput.value).toBe('2025-01-01');
    expect(doctorInput.value).toBe('Dr. Smith');
  });

  test('handles form cancellation', () => {
    render(<VaccineModal {...mockProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});