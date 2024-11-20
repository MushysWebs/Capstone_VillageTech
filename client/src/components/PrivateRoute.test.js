import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import PrivateRoute from './PrivateRoute'; // Adjust the import path if needed

// Mock the useSession hook
jest.mock('@supabase/auth-helpers-react', () => ({
  useSession: jest.fn(),
}));

// Helper function to render the component with a given route
const renderWithRouter = (sessionState) => {
  useSession.mockReturnValue(sessionState); // Mock the session value

  render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route path="/private" element={<PrivateRoute />}>
          <Route path="/private" element={<div>Private Content</div>} />
        </Route>
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('PrivateRoute Component', () => {
  test('shows loading when session is undefined', async () => {
    renderWithRouter(undefined); // Simulate loading state

    // Check if loading message is displayed
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('redirects to "/" when session is null (not logged in)', async () => {
    renderWithRouter(null); // Simulate logged out state

    // Check if the user is redirected to the home page
    await waitFor(() => expect(screen.getByText('Home Page')).toBeInTheDocument());
  });

  test('renders the private content when session exists (logged in)', async () => {
    renderWithRouter({ user: { id: '123', email: 'user@example.com' } }); // Simulate logged in state

    // Check if the private content is rendered
    await waitFor(() => expect(screen.getByText('Private Content')).toBeInTheDocument());
  });
});
