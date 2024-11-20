import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReportingTabs from './ReportingTabs'; // Adjust the import path if needed
import EndOfDayWizard from '../pages/reporting/endOfDayWizard/EndOfDayWizard';

// Helper function to render the component with a given route
const renderWithRouter = (route = '/reporting') => {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/reporting" element={<ReportingTabs />} />
        <Route path="/reporting/history" element={<div>End of Day History</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ReportingTabs Component', () => {
  test('renders the ReportingTabs with the correct tabs', () => {
    renderWithRouter();

    // Check if both tabs are rendered
    expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    expect(screen.getByText('End of Day Reports')).toBeInTheDocument();
  });

});
