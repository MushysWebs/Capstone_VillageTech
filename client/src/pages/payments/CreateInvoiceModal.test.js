import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import CreateInvoiceModal from './CreateInvoiceModal';

// Mock data
const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  selectedPatientId: 1,
  onInvoiceCreated: jest.fn()
};

const mockNewInvoice = {
  id: 1,
  invoice_name: 'Test Invoice',
  invoice_total: 100.00,
  invoice_status: 'Pending'
};

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockNewInvoice, error: null })
  })
};

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabase
}));

describe('CreateInvoiceModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when not open', () => {
    render(
      <CreateInvoiceModal 
        {...mockProps} 
        isOpen={false}
      />
    );
    
    expect(screen.queryByText('Create New Invoice')).not.toBeInTheDocument();
  });



  test('validates required fields', async () => {
    render(<CreateInvoiceModal {...mockProps} />);
    
    const submitButton = screen.getByText('Create Invoice');

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  test('handles modal close', () => {
    render(<CreateInvoiceModal {...mockProps} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('handles cancel button', () => {
    render(<CreateInvoiceModal {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });


});