
import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialReportCard from './FinancialReportCard';

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container" style={{ width: '100%', height: 100 }}>
      {children}
    </div>
  )
}));

// Mock Material-UI components (optional, as they typically work fine with JSDOM)
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Card: ({ children, className }) => <div data-testid="mui-card" className={className}>{children}</div>,
  Box: ({ children, className }) => <div data-testid="mui-box" className={className}>{children}</div>,
  Typography: ({ children, variant, component, className }) => (
    <div data-testid={`mui-typography-${variant}`} className={className}>
      {children}
    </div>
  )
}));

describe('FinancialReportCard Component', () => {
  const mockProps = {
    data: [
      { name: 'Day 1', users: 100 },
      { name: 'Day 2', users: 150 },
      { name: 'Day 3', users: 120 },
      { name: 'Day 4', users: 200 },
      { name: 'Day 5', users: 180 }
    ],
    title: 'Test Report',
    count: '500',
    percentage: '+25%'
  };

  test('renders with all required props', () => {
    render(<FinancialReportCard {...mockProps} />);

    // Check if all main components are rendered
    expect(screen.getByTestId('mui-card')).toHaveClass('financial-report-card');
    expect(screen.getByText('Test Report')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  test('renders chart components correctly', () => {
    render(<FinancialReportCard {...mockProps} />);

    // Check if all chart components are present
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  test('applies correct typography variants', () => {
    render(<FinancialReportCard {...mockProps} />);

    // Check if typography variants are correctly applied
    expect(screen.getByTestId('mui-typography-subtitle2')).toBeInTheDocument();
    expect(screen.getByTestId('mui-typography-h4')).toBeInTheDocument();
    expect(screen.getByTestId('mui-typography-body2')).toBeInTheDocument();
  });

  test('renders with empty data', () => {
    const propsWithEmptyData = {
      ...mockProps,
      data: []
    };

    render(<FinancialReportCard {...propsWithEmptyData} />);

    // Should still render without crashing
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('renders with null values', () => {
    const propsWithNullValues = {
      ...mockProps,
      count: null,
      percentage: null
    };

    render(<FinancialReportCard {...propsWithNullValues} />);

    // Should render without crashing and display empty or default values
    expect(screen.getByTestId('mui-typography-h4')).toBeInTheDocument();
  });

  test('renders with special characters in text', () => {
    const propsWithSpecialChars = {
      ...mockProps,
      title: 'Test & Report <script>',
      percentage: '&25% ><'
    };

    render(<FinancialReportCard {...propsWithSpecialChars} />);

    // Should properly escape and render special characters
    expect(screen.getByText('Test & Report <script>')).toBeInTheDocument();
    expect(screen.getByText('&25% ><')).toBeInTheDocument();
  });

  test('renders with long text values', () => {
    const propsWithLongText = {
      ...mockProps,
      title: 'Very Long Report Title That Should Still Display Properly',
      count: '1000000000',
      percentage: '+999.99%'
    };

    render(<FinancialReportCard {...propsWithLongText} />);

    // Should handle long text without breaking layout
    expect(screen.getByText('Very Long Report Title That Should Still Display Properly')).toBeInTheDocument();
    expect(screen.getByText('1000000000')).toBeInTheDocument();
    expect(screen.getByText('+999.99%')).toBeInTheDocument();
  });

  test('renders with custom class names', () => {
    render(<FinancialReportCard {...mockProps} />);

    // Check if custom classes are applied
    expect(screen.getByTestId('mui-card')).toHaveClass('financial-report-card');
    expect(screen.getByText('Test Report')).toHaveClass('users-title');
    expect(screen.getByText('500')).toHaveClass('users-count');
    expect(screen.getByText('Last 7 days')).toHaveClass('last-30-days');
    expect(screen.getByText('+25%')).toHaveClass('percentage-text');
  });

  test('maintains responsive container dimensions', () => {
    render(<FinancialReportCard {...mockProps} />);

    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveStyle({ width: '100%', height: 100 });
  });

  test('renders line chart with correct props', () => {
    render(<FinancialReportCard {...mockProps} />);

    const lineChart = screen.getByTestId('line-chart');
    expect(lineChart).toBeInTheDocument();
    
    // Verify line properties
    const line = screen.getByTestId('line');
    expect(line).toBeInTheDocument();
  });

  test('renders with missing optional props', () => {
    const minimalProps = {
      data: mockProps.data,
      title: 'Minimal Test'
    };

    render(<FinancialReportCard {...minimalProps} />);

    // Should render with just required props
    expect(screen.getByText('Minimal Test')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
