import { render, screen, fireEvent } from '@testing-library/react';
import AddNoteModal from './AddNoteModal';  // Adjust the path as needed

describe('AddNoteModal', () => {
  const mockOnClose = jest.fn();
  const mockOnAddNote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal when isOpen is true', () => {
    render(<AddNoteModal isOpen={true} onClose={mockOnClose} onAddNote={mockOnAddNote} />);

    expect(screen.getByText('Add Note')).toBeInTheDocument();
    expect(screen.getByLabelText('Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('Note:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should not render the modal when isOpen is false', () => {
    render(<AddNoteModal isOpen={false} onClose={mockOnClose} onAddNote={mockOnAddNote} />);

    expect(screen.queryByText('Add Note')).not.toBeInTheDocument();
  });

  it('should call onAddNote with the correct data when Add button is clicked', () => {
    render(<AddNoteModal isOpen={true} onClose={mockOnClose} onAddNote={mockOnAddNote} />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2024-11-15' } });
    fireEvent.change(screen.getByLabelText('Note:'), { target: { value: 'Test note' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(mockOnAddNote).toHaveBeenCalledWith({
      date: '2024-11-15',
      note: 'Test note',
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should reset form values after Add button is clicked', () => {
    render(<AddNoteModal isOpen={true} onClose={mockOnClose} onAddNote={mockOnAddNote} />);

    fireEvent.change(screen.getByLabelText('Date:'), { target: { value: '2024-11-15' } });
    fireEvent.change(screen.getByLabelText('Note:'), { target: { value: 'Test note' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByLabelText('Date:').value).toBe('');
    expect(screen.getByLabelText('Note:').value).toBe('');
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<AddNoteModal isOpen={true} onClose={mockOnClose} onAddNote={mockOnAddNote} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
