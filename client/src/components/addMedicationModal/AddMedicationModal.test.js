import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddMedicationModal from './AddMedicationModal';

// Mock the onAddMedication and onClose callbacks
const mockOnAddMedication = jest.fn();
const mockOnClose = jest.fn();

describe('AddMedicationModal', () => {
  // Test: Ensure modal doesn't render when isOpen is false
  test('does not render when isOpen is false', () => {
    render(
      <AddMedicationModal
        isOpen={false}
        onClose={mockOnClose}
        onAddMedication={mockOnAddMedication}
      />
    );
    expect(screen.queryByText('Add Medication')).not.toBeInTheDocument();
  });

  // Test: Ensure modal renders when isOpen is true
  test('renders when isOpen is true', () => {
    render(
      <AddMedicationModal
        isOpen={true}
        onClose={mockOnClose}
        onAddMedication={mockOnAddMedication}
      />
    );
    expect(screen.getByText('Add Medication')).toBeInTheDocument();
  });

  // Test: Ensure form fields work and onAddMedication is called
  test('submits the form and calls onAddMedication with correct data', async () => {
    render(
      <AddMedicationModal
        isOpen={true}
        onClose={mockOnClose}
        onAddMedication={mockOnAddMedication}
      />
    );

    // Fill out the form fields
    fireEvent.change(screen.getByLabelText(/Medication/), { target: { value: 'Aspirin' } });
    fireEvent.change(screen.getByLabelText(/Dosage/), { target: { value: '500mg' } });
    fireEvent.change(screen.getByLabelText(/Frequency/), { target: { value: 'Once a day' } });
    fireEvent.change(screen.getByLabelText(/Date Prescribed/), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: 'Pain relief' } });
    fireEvent.change(screen.getByLabelText(/Prescribing Doctor/), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/Instructions/), { target: { value: 'Take with food' } });
    fireEvent.change(screen.getByLabelText(/Refills/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: 'Ongoing' } });

    // Submit the form
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockOnAddMedication).toHaveBeenCalledWith({
        name: 'Aspirin',
        dosage: '500mg',
        frequency: 'Once a day',
        date_prescribed: '2024-01-01',
        end_date: '2024-06-01',
        reason: 'Pain relief',
        doctor: 'Dr. Smith',
        instructions: 'Take with food',
        refills: 2,
        status: 'Ongoing',
      });
    });

    // Ensure the modal is closed after submission
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test: Ensure form resets after submission
  test('resets form fields after submitting', async () => {
    render(
      <AddMedicationModal
        isOpen={true}
        onClose={mockOnClose}
        onAddMedication={mockOnAddMedication}
      />
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Medication/), { target: { value: 'Aspirin' } });
    fireEvent.change(screen.getByLabelText(/Dosage/), { target: { value: '500mg' } });
    fireEvent.change(screen.getByLabelText(/Frequency/), { target: { value: 'Once a day' } });
    fireEvent.change(screen.getByLabelText(/Date Prescribed/), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/), { target: { value: '2024-06-01' } });
    fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: 'Pain relief' } });
    fireEvent.change(screen.getByLabelText(/Prescribing Doctor/), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/Instructions/), { target: { value: 'Take with food' } });
    fireEvent.change(screen.getByLabelText(/Refills/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: 'Ongoing' } });

    // Submit the form
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockOnAddMedication).toHaveBeenCalled();
    });

    // Check if form fields are reset after submission
    expect(screen.getByLabelText(/Medication/).value).toBe('');
    expect(screen.getByLabelText(/Dosage/).value).toBe('');
    expect(screen.getByLabelText(/Frequency/).value).toBe('');
    expect(screen.getByLabelText(/Date Prescribed/).value).toBe('');
    expect(screen.getByLabelText(/End Date/).value).toBe('');
    expect(screen.getByLabelText(/Reason/).value).toBe('');
    expect(screen.getByLabelText(/Prescribing Doctor/).value).toBe('');
    expect(screen.getByLabelText(/Instructions/).value).toBe('');
    expect(screen.getByLabelText(/Refills/).value).toBe('');
    expect(screen.getByLabelText(/Status/).value).toBe('Ongoing');
  });

  // Test: Ensure Cancel button triggers onClose without submitting the form
  test('calls onClose when Cancel button is clicked', () => {
    render(
      <AddMedicationModal
        isOpen={true}
        onClose={mockOnClose}
        onAddMedication={mockOnAddMedication}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnAddMedication).not.toHaveBeenCalled();
  });
});
