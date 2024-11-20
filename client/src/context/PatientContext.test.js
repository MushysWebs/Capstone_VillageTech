import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientProvider, usePatient } from './PatientContext';

// A simple test component to use the `usePatient` hook
const TestComponent = () => {
  const { selectedPatient, setSelectedPatient } = usePatient();

  return (
    <div>
      <div data-testid="patient">{selectedPatient ? selectedPatient.name : 'No patient selected'}</div>
      <button onClick={() => setSelectedPatient({ name: 'John Doe' })}>Select Patient</button>
    </div>
  );
};

describe('PatientContext', () => {
  test('should provide the context value correctly', () => {
    render(
      <PatientProvider>
        <TestComponent />
      </PatientProvider>
    );

    // Initially, no patient is selected
    expect(screen.getByTestId('patient')).toHaveTextContent('No patient selected');

    // Simulate selecting a patient
    fireEvent.click(screen.getByText('Select Patient'));

    // After selecting a patient, the selected patient should be shown
    expect(screen.getByTestId('patient')).toHaveTextContent('John Doe');
  });

  test('should throw error if usePatient is used outside of PatientProvider', () => {
    const TestComponentWithoutProvider = () => {
      const { selectedPatient } = usePatient(); // This should throw an error
      return <div>{selectedPatient ? selectedPatient.name : 'No patient selected'}</div>;
    };

    expect(() =>
      render(<TestComponentWithoutProvider />)
    ).toThrowError('usePatient must be used within a PatientProvider');
  });
});
