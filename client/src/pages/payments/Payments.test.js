import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Payments from './Payments';
import { usePatient } from '../../context/PatientContext';

// Mock data
const mockPatient = {
  id: 1,
  name: 'Max',
  owner_id: 1
};

const mockInvoices = [
  {
    invoice_id: 1,
    invoice_name: 'Check-up',
    invoice_total: 100.00,
    invoice_date: '2024-01-01',
    invoice_status: 'Pending'
  }
];

const mockOwner = {
  id: 1,
  email: 'owner@example.com'
};

// Mock components
jest.mock('../../components/patientLayout/PatientLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="patient-layout">{children}</div>
}));

// Mock CreateInvoiceModal
jest.mock('./CreateInvoiceModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onInvoiceCreated }) => 
    isOpen ? (
      <div data-testid="create-invoice-modal">
        <button onClick={() => onInvoiceCreated({
          invoice_id: 2,
          invoice_name: 'New Invoice',
          invoice_total: 200.00
        })}>Create Invoice</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

// Mock Stripe components
jest.mock('@stripe/react-stripe-js', () => ({
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({
    confirmCardPayment: jest.fn().mockResolvedValue({ 
      paymentIntent: { status: 'succeeded' } 
    })
  }),
  useElements: () => ({
    getElement: jest.fn()
  })
}));

// Mock PDF generation
jest.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }) => <div>{children}</div>,
  pdf: jest.fn().mockResolvedValue({
    toBlob: jest.fn().mockResolvedValue(new Blob())
  })
}));

// Mock Receipt component
jest.mock('./Receipt', () => ({
  __esModule: true,
  default: () => <div data-testid="receipt">Mock Receipt</div>
}));

// Mock PatientContext
jest.mock('../../context/PatientContext', () => ({
  usePatient: jest.fn()
}));

// Create Supabase response handler
const createSupabaseResponse = (table) => {
  switch(table) {
    case 'invoices':
      return Promise.resolve({ data: mockInvoices, error: null });
    case 'owners':
      return Promise.resolve({ data: mockOwner, error: null });
    default:
      return Promise.resolve({ data: [], error: null });
  }
};

// Update Supabase mock to handle promises correctly
const mockSupabase = {
    from: jest.fn((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(createSupabaseResponse(table)),
      then: jest.fn().mockResolvedValue(createSupabaseResponse(table))
    })),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' }, error: null })
      })
    }
  };

// Mock Supabase hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabase
}));

// Mock fetch for payment intent
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ client_secret: 'test_secret' }),
    ok: true
  })
);

describe('Payments Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePatient.mockReturnValue({ selectedPatient: mockPatient });

    // Setup mock responses
    mockSupabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(createSupabaseResponse(table)),
      then: jest.fn().mockResolvedValue({ data: mockInvoices, error: null })
    }));
  });

  test('handles empty invoice data', async () => {
    mockSupabase.from.mockImplementationOnce((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    await act(async () => {
      render(<Payments />);
    });

    // Verify that the table is rendered but empty
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Select' })).not.toBeInTheDocument();
  });
});