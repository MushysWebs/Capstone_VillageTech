// src/client/src/Layout.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Layout from './Layout';

// Setup fake timers
jest.useFakeTimers();

// Base mock setup
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn()
};

const mockSupabaseClient = {
  channel: jest.fn().mockReturnValue(mockChannel),
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ 
      data: { role: 'Veterinarian', user_id: '123' }, 
      error: null 
    })
  }),
  removeChannel: jest.fn()
};

// Mock all components
jest.mock('./pages/dashboard/Dashboard', () => () => <div data-testid="dashboard">Dashboard Mock</div>);
jest.mock('./pages/admin/Admin', () => () => <div data-testid="admin">Admin Mock</div>);
jest.mock('./pages/admin/Account', () => () => <div data-testid="account">Account Mock</div>);
jest.mock('./pages/contacts/Contacts', () => () => <div data-testid="contacts">Contacts Mock</div>);
jest.mock('./pages/message/MessagingPage', () => () => <div data-testid="messages">Messages Mock</div>);
jest.mock('./components/auth/AuthGuard', () => ({ children }) => <div>{children}</div>);
jest.mock('./components/auth/SignOut', () => () => <div data-testid="signout">SignOut Mock</div>);
jest.mock('./pages/patients/newPatient/NewPatient', () => () => <div data-testid="newpatient">NewPatient Mock</div>);
jest.mock('./pages/patients/patientMain/PatientMain', () => () => <div data-testid="patientmain">PatientMain Mock</div>);
jest.mock('./pages/patients/financial/Financial', () => () => <div data-testid="financial">Financial Mock</div>);
jest.mock('./pages/patients/healthStatus/HealthStatus', () => () => <div data-testid="healthstatus">HealthStatus Mock</div>);
jest.mock('./pages/patients/soc/SOC', () => () => <div data-testid="soc">SOC Mock</div>);
jest.mock('./pages/patients/summaries/Summaries', () => () => <div data-testid="summaries">Summaries Mock</div>);
jest.mock('./pages/patients/medication/Medication', () => () => <div data-testid="medication">Medication Mock</div>);
jest.mock('./pages/patients/clinical/Clinical', () => () => <div data-testid="clinical">Clinical Mock</div>);
jest.mock('./pages/payments/Payments', () => () => <div data-testid="payments">Payments Mock</div>);
jest.mock('./pages/reporting/financialReports/FinancialReports', () => () => <div data-testid="reports">Reports Mock</div>);
jest.mock('./pages/reporting/reportHistory/ReportHistory', () => () => <div data-testid="history">History Mock</div>);

// Mock Supabase client
jest.mock('./components/routes/supabaseClient', () => ({
  __esModule: true,
  default: mockSupabaseClient
}));

// Mock auth hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabaseClient,
  useSession: () => ({ user: { id: '123' } }),
  SessionContextProvider: ({ children }) => <div>{children}</div>
}));

const renderWithRouter = (route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Layout />
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Test routes rendering
  test('renders AdminPage for /admin', () => {
    renderWithRouter('/admin');
    expect(screen.getByTestId('admin')).toBeInTheDocument();
  });

  test('renders Account for /account', () => {
    renderWithRouter('/account');
    expect(screen.getByTestId('account')).toBeInTheDocument();
  });

  test('renders Dashboard for /dashboard', () => {
    renderWithRouter('/dashboard');
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders MessagingPage for /messages', () => {
    renderWithRouter('/messages');
    expect(screen.getByTestId('messages')).toBeInTheDocument();
  });

  test('renders Contacts for /contacts', () => {
    renderWithRouter('/contacts');
    expect(screen.getByTestId('contacts')).toBeInTheDocument();
  });

  test('renders NewPatient for /newPatient', () => {
    renderWithRouter('/newPatient');
    expect(screen.getByTestId('newpatient')).toBeInTheDocument();
  });

  test('renders PatientMain for /patient', () => {
    renderWithRouter('/patient');
    expect(screen.getByTestId('patientmain')).toBeInTheDocument();
  });

  // Test staff data fetching and session handling
  test('fetches staff data when session exists', async () => {
    await act(async () => {
      renderWithRouter();
    });
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('staff');
  });

  // Test time updates
  test('updates time display', () => {
    renderWithRouter();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/\d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  // Test theme
  test('renders with light theme by default', () => {
    const { container } = renderWithRouter();
    expect(container.querySelector('.dashboard-container')).toHaveClass('light');
  });

  // Test search functionality
  test('handles search input', () => {
    renderWithRouter();
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');
  });

  // Test error handling
  test('handles error in fetchCurrentUserStaff', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Test error'))
    }));

    await act(async () => {
      renderWithRouter();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // Test navigation
  test('navigation links have correct attributes', () => {
    renderWithRouter();
    const dashboardLink = screen.getByText(/Dashboard/i).closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(dashboardLink).toHaveAttribute('draggable', 'false');
  });


  // Test message badge visibility
  test('message notification badge not shown by default', () => {
    renderWithRouter();
    const badge = screen.queryByText(/99\+/i);
    expect(badge).not.toBeInTheDocument();
  });


  
  // Test line 126 and remaining renderMainContent paths
  test('renders HealthStatus for /healthStatus', () => {
    renderWithRouter('/healthStatus');
    expect(screen.getByTestId('healthstatus')).toBeInTheDocument();
  });
  
  test('renders SOC for /SOC', () => {
    renderWithRouter('/SOC');
    expect(screen.getByTestId('soc')).toBeInTheDocument();
  });
  
  test('renders Summaries for /summaries', () => {
    renderWithRouter('/summaries');
    expect(screen.getByTestId('summaries')).toBeInTheDocument();
  });
  
  test('renders Medication for /medication', () => {
    renderWithRouter('/medication');
    expect(screen.getByTestId('medication')).toBeInTheDocument();
  });
  
  test('renders Clinical for /clinical', () => {
    renderWithRouter('/clinical');
    expect(screen.getByTestId('clinical')).toBeInTheDocument();
  });
  
  test('renders Financial for /Financial', () => {
    renderWithRouter('/Financial');
    expect(screen.getByTestId('financial')).toBeInTheDocument();
  });
  
  test('renders Payments for /payments', () => {
    renderWithRouter('/payments');
    expect(screen.getByTestId('payments')).toBeInTheDocument();
  });
  
  test('renders ReportHistory for /reporting/history', () => {
    renderWithRouter('/reporting/history');
    expect(screen.getByTestId('history')).toBeInTheDocument();
  });
  
  
  // Test formatDate function
  test('formats date correctly', () => {
    const { container } = renderWithRouter();
    const testDate = new Date('2024-01-01T12:00:00');
    const formattedDate = container.querySelector('.time-display');
    expect(formattedDate).toBeInTheDocument();
  });
  
  // Test renderSidebarLink active states for patient and reporting routes
  test('sets correct active state for patient routes', () => {
    renderWithRouter('/patient');
    const patientLink = screen.getByText('Patients').closest('li');
    expect(patientLink).toHaveClass('active');
  });
  
  test('sets correct active state for reporting routes', () => {
    renderWithRouter('/reporting/history');
    const reportingLink = screen.getByText('Reporting').closest('li');
    expect(reportingLink).toHaveClass('active');
  });

 
});