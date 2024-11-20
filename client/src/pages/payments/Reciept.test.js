import React from 'react';
import { render } from '@testing-library/react';
import Receipt from './Receipt';

// Mock @react-pdf/renderer components
jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children, style }) => <div data-testid="pdf-page" style={style}>{children}</div>,
  Text: ({ children, style }) => <span data-testid="pdf-text" style={style}>{children}</span>,
  View: ({ children, style }) => <div data-testid="pdf-view" style={style}>{children}</div>,
  Image: ({ src, style }) => <img data-testid="pdf-image" src={src} style={style} alt="logo" />,
  StyleSheet: {
    create: styles => styles
  }
}));

// Mock data
const mockInvoice = {
  invoice_id: 'INV-001',
  invoice_date: '2024-01-01',
  invoice_name: 'Check-up',
  invoice_total: 100.00
};

const mockPatient = {
  name: 'Max',
  species: 'Dog',
  owner_name: 'John Doe',
  owner_address: '123 Main St',
  owner_city: 'Calgary',
  owner_province: 'AB',
  owner_postal_code: 'T2M 3N5'
};

describe('Receipt Component', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with complete data', () => {
    const { getByTestId, getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    // Check main structure
    expect(getByTestId('pdf-document')).toBeInTheDocument();
    expect(getByTestId('pdf-page')).toBeInTheDocument();

    // Check clinic details
    const textElements = getAllByTestId('pdf-text');
    expect(textElements.find(el => el.textContent.includes('Village Vet Animal Clinic'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('2102 14 St NW'))).toBeTruthy();

    // Check logo
    const logo = getByTestId('pdf-image');
    expect(logo).toHaveAttribute('src', '/VillageVetLogo.png');
  });

  test('displays invoice details correctly', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    
    // Check invoice details
    expect(textElements.find(el => el.textContent.includes('INV-001'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('Check-up'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('$100.00'))).toBeTruthy();
  });

  test('displays patient and owner details correctly', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    
    // Check patient/owner details
    expect(textElements.find(el => el.textContent.includes('Max'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('Dog'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('John Doe'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('123 Main St'))).toBeTruthy();
  });

  test('formats date correctly', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    const formattedDate = new Date('2024-01-01').toLocaleDateString();
    expect(textElements.find(el => el.textContent.includes(formattedDate))).toBeTruthy();
  });

  test('formats currency correctly', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    const formattedAmount = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(100);
    
    expect(textElements.find(el => el.textContent.includes(formattedAmount))).toBeTruthy();
  });

  test('handles missing invoice data', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    const { container } = render(
      <Receipt patient={mockPatient} />
    );

    expect(consoleSpy).toHaveBeenCalledWith('Missing invoice or patient data');
    expect(container.firstChild).toBeNull();
  });

  test('handles missing patient data', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    const { container } = render(
      <Receipt invoice={mockInvoice} />
    );

    expect(consoleSpy).toHaveBeenCalledWith('Missing invoice or patient data');
    expect(container.firstChild).toBeNull();
  });

  test('handles missing owner details', () => {
    const patientWithoutOwner = {
      ...mockPatient,
      owner_name: undefined,
      owner_address: undefined
    };

    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={patientWithoutOwner} />
    );

    const textElements = getAllByTestId('pdf-text');
    expect(textElements.find(el => el.textContent.includes('Owner name not available'))).toBeTruthy();
    expect(textElements.find(el => el.textContent.includes('Address not available'))).toBeTruthy();
  });

  test('includes table headers', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    expect(textElements.find(el => el.textContent === 'Description')).toBeTruthy();
    expect(textElements.find(el => el.textContent === 'Quantity')).toBeTruthy();
    expect(textElements.find(el => el.textContent === 'Total')).toBeTruthy();
  });

  test('includes footer text', () => {
    const { getAllByTestId } = render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    const textElements = getAllByTestId('pdf-text');
    expect(textElements.find(el => el.textContent === 'Thank you for your business!')).toBeTruthy();
  });

  test('logs rendering data', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(
      <Receipt invoice={mockInvoice} patient={mockPatient} />
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Rendering Receipt with data:',
      mockInvoice,
      mockPatient
    );
  });
});