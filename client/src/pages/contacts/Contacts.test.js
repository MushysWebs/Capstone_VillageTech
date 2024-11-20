import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import Contacts from './Contacts';

// Mock data
const mockContact = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone_number: '123-456-7890',
  secondary_phone_number: '098-765-4321',
  address: '123 Main St',
  notes: 'Test notes',
  profile_picture_url: 'https://example.com/photo.jpg'
};

const mockPatient = {
  id: 1,
  name: 'Max',
  owner_id: 1,
  date_of_birth: '2020-01-01',
  species: 'Dog',
  breed: 'Labrador',
  weight: 25,
  image_url: 'https://example.com/pet.jpg'
};

const mockInvoice = {
  invoice_id: 1,
  invoice_name: 'Check-up',
  patient_id: 1,
  invoice_total: 100.00,
  invoice_date: '2024-01-01',
  invoice_status: 'Pending',
  last_update: '2024-01-01'
};

// Mock Components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('../../context/PatientContext', () => ({
  usePatient: () => ({
    setSelectedPatient: jest.fn()
  })
}));

jest.mock('../dashboard/calendarView/AddAppointment', () => ({
  __esModule: true,
  default: ({ onClose, onAppointmentAdded }) => (
    <div data-testid="add-appointment-modal">
      <button onClick={() => onAppointmentAdded({ id: 1 })}>Add Appointment</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

jest.mock('./CreateContactModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onCreateContact }) => 
    isOpen ? (
      <div data-testid="create-contact-modal">
        <button onClick={() => onCreateContact(mockContact)}>Create Contact</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

jest.mock('lucide-react', () => ({
  Edit2: () => <div>Edit Icon</div>,
  X: () => <div>X Icon</div>,
  Save: () => <div>Save Icon</div>,
  Clock: () => <div>Clock Icon</div>,
  Calendar: () => <div>Calendar Icon</div>,
  Send: () => <div>Send Icon</div>,
  Camera: () => <div>Camera Icon</div>,
  Trash2: () => <div>Trash Icon</div>
}));

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://example.com/${path}` }
      }))
    }))
  }
};

// Mock Supabase hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Contacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock implementation for storage
    const mockStorageFrom = jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: jest.fn((path) => ({
        data: { publicUrl: `https://example.com/${path}` }
      }))
    });

    mockSupabaseClient.storage.from = mockStorageFrom;
    
    // Setup mock implementation for database queries
    mockSupabaseClient.from.mockImplementation((table) => {
      const methods = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn()
      };

      // Different responses based on the table being queried
      switch (table) {
        case 'owners':
          methods.select.mockImplementation(() => ({
            order: jest.fn().mockResolvedValue({ 
              data: [mockContact], 
              error: null 
            })
          }));
          methods.single.mockResolvedValue({ data: mockContact, error: null });
          methods.update.mockImplementation(() => ({
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockContact, error: null })
          }));
          methods.delete.mockImplementation(() => ({
            eq: jest.fn().mockResolvedValue({ error: null })
          }));
          break;
        case 'patients':
          methods.select.mockImplementation(() => ({
            eq: jest.fn().mockResolvedValue({ 
              data: [mockPatient], 
              error: null 
            })
          }));
          break;
        case 'invoices':
          methods.select.mockImplementation(() => ({
            in: jest.fn().mockResolvedValue({ 
              data: [mockInvoice], 
              error: null 
            })
          }));
          break;
        default:
          break;
      }

      return methods;
    });
  });

  test('handles error fetching contacts', async () => {
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Failed to fetch') 
        })
      })
    }));

    await act(async () => {
      renderWithRouter(<Contacts />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch contacts/)).toBeInTheDocument();
    });
  });


});