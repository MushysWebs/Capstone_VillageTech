import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import EndOfDayWizard from './EndOfDayWizard';

// Mock data
const mockReportData = {
  appointment_stats: {
    totalScheduled: 10,
    completed: 7,
    cancelled: 2,
    inProgress: 1,
    walkIns: 2,
    uniquePatients: 8,
    completionRate: 70,
    cancellationRate: 20,
  },
  patient_stats: [
    { name: 'New Patients', value: 3 },
    { name: 'Returning', value: 5 }
  ],
  financial_summary: {
    invoicesCreated: 15,
    invoicesPaid: 12,
    paymentsReceived: 1500,
    paymentsRefunded: 100
  },
  profit_breakdown: [
    { name: 'Medicine', value: 450 },
    { name: 'Staff Pay', value: 600 },
    { name: 'Utilities', value: 150 },
    { name: 'Other Expenses', value: 150 },
    { name: 'Invoice Revenue', value: 1500 }
  ],
  comment: 'Test comment'
};

// Mock Supabase responses
const mockSupabaseResponse = {
  data: [
    {
      id: 1,
      patient_id: 1,
      status: 'Completed',
      start_time: '2024-01-01T10:00:00',
      title: 'Check-up',
      description: 'Regular check-up'
    }
  ],
  error: null
};

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(mockSupabaseResponse)
  })
};

// Mock hooks and components
jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => mockSupabase
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />
}));

describe('EndOfDayWizard Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in edit mode without report data', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue(mockSupabaseResponse)
    }));

    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('End of Day Wizard')).toBeInTheDocument();
      expect(screen.getByText('Submit Report')).toBeInTheDocument();
    });
  });

  test('handles comment changes', async () => {
    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose}
      />
    );

    const commentInput = screen.getByLabelText('End of Day Comments');
    fireEvent.change(commentInput, { target: { value: 'New comment' } });

    expect(commentInput.value).toBe('New comment');
  });

  test('displays financial summary correctly', async () => {
    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose} 
        reportData={mockReportData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Financial Summary')).toBeInTheDocument();
      expect(screen.getByText('$1500')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });
  });

  test('displays appointment statistics correctly', async () => {
    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose} 
        reportData={mockReportData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Appointment Statistics')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Scheduled
      expect(screen.getByText('7')).toBeInTheDocument(); // Completed
    });
  });

  test('displays patient statistics correctly', async () => {
    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose} 
        reportData={mockReportData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Patient Statistics')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // New Patients
      expect(screen.getByText('5')).toBeInTheDocument(); // Returning
    });
  });


  test('closes dialog when readOnly and submit clicked', async () => {
    render(
      <EndOfDayWizard 
        open={true} 
        onClose={mockOnClose} 
        readOnly={true}
        reportData={mockReportData}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});