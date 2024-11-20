import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddAllergyModal from './AddAllergyModal'; // Adjust the import path if needed

describe('AddAllergyModal Component', () => {
  const mockOnAddAllergy = jest.fn();
  const mockOnClose = jest.fn();

  test('renders the modal when isOpen is true', () => {
    render(<AddAllergyModal isOpen={true} onAddAllergy={mockOnAddAllergy} onClose={mockOnClose} />);

    // Check if the modal is rendered
    expect(screen.getByText('Add Allergy')).toBeInTheDocument();
    expect(screen.getByLabelText(/Allergy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reaction/i)).toBeInTheDocument();
  });

  test('does not render the modal when isOpen is false', () => {
    render(<AddAllergyModal isOpen={false} onAddAllergy={mockOnAddAllergy} onClose={mockOnClose} />);

    // Modal should not be in the document
    expect(screen.queryByText('Add Allergy')).not.toBeInTheDocument();
  });

  test('calls onAddAllergy with correct values when Add button is clicked', async () => {
    render(<AddAllergyModal isOpen={true} onAddAllergy={mockOnAddAllergy} onClose={mockOnClose} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Allergy/i), { target: { value: 'Peanuts' } });
    fireEvent.change(screen.getByLabelText(/Reaction/i), { target: { value: 'Anaphylaxis' } });

    // Click the "Add" button
    fireEvent.click(screen.getByText('Add'));

    // Check if onAddAllergy was called with the correct arguments
    expect(mockOnAddAllergy).toHaveBeenCalledWith({
      name: 'Peanuts',
      reaction: 'Anaphylaxis',
    });

    // Ensure the modal is closed after adding the allergy
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('resets the form after adding an allergy', async () => {
    render(<AddAllergyModal isOpen={true} onAddAllergy={mockOnAddAllergy} onClose={mockOnClose} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Allergy/i), { target: { value: 'Peanuts' } });
    fireEvent.change(screen.getByLabelText(/Reaction/i), { target: { value: 'Anaphylaxis' } });

    // Click the "Add" button
    fireEvent.click(screen.getByText('Add'));

    // After the form is submitted, check if the input fields are cleared
    await waitFor(() => {
      expect(screen.getByLabelText(/Allergy/i).value).toBe('');
      expect(screen.getByLabelText(/Reaction/i).value).toBe('');
    });
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(<AddAllergyModal isOpen={true} onAddAllergy={mockOnAddAllergy} onClose={mockOnClose} />);

    // Click the "Cancel" button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
