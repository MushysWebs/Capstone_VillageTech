// src/client/src/PatientTabs.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientTabs from './PatientTabs';

// Helper function to render the component with a given route
const renderWithRouter = (route) => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <PatientTabs />
    </MemoryRouter>
  );
};

describe('PatientTabs Component', () => {
  test('renders all tabs', () => {
    renderWithRouter('/clinical'); // Use any route as the initial one

    // Check if all tabs are rendered
    expect(screen.getByText(/Clinical/i)).toBeInTheDocument();
    expect(screen.getByText(/S.O.C./i)).toBeInTheDocument();
    expect(screen.getByText(/Financial/i)).toBeInTheDocument();
    expect(screen.getByText(/Summaries/i)).toBeInTheDocument();
    expect(screen.getByText(/Health Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Medication/i)).toBeInTheDocument();
    expect(screen.getByText(/New Patient/i)).toBeInTheDocument();
  });

  test('highlights the active tab based on the route', () => {
    renderWithRouter('/clinical'); // Initial route to check

    // Check if the "Clinical" tab is active
    expect(screen.getByText(/Clinical/i).closest('a')).toHaveClass('active');
    expect(screen.getByText(/S.O.C./i).closest('a')).not.toHaveClass('active');
    expect(screen.getByText(/Financial/i).closest('a')).not.toHaveClass('active');
    expect(screen.getByText(/Summaries/i).closest('a')).not.toHaveClass('active');
    expect(screen.getByText(/Health Status/i).closest('a')).not.toHaveClass('active');
    expect(screen.getByText(/Medication/i).closest('a')).not.toHaveClass('active');
    expect(screen.getByText(/New Patient/i).closest('a')).not.toHaveClass('active');
  });

  test('navigates to the correct path when a tab is clicked', () => {
    renderWithRouter('/clinical'); // Initial route

    // Simulate clicking the 'Financial' tab
    const financialTab = screen.getByText(/Financial/i).closest('a');
    fireEvent.click(financialTab);

    // After clicking, check if the location has changed to '/Financial'
    expect(window.location.pathname).toBe('/Financial');
  });

  test('renders the correct content based on the active tab', () => {
    // Here you can test content rendering for each path if needed
    renderWithRouter('/clinical');

    // Mock the content for each route (if necessary)
    expect(screen.getByText(/Clinical/i)).toBeInTheDocument();
    // Similar for other routes
  });
});
