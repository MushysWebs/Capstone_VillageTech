import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SignoutButton from "./SignoutButton"; // Adjust the path as needed
import { supabase } from "../routes/supabaseClient";
import { useCookies } from "react-cookie";

// Mock the supabase and react-cookie methods
jest.mock("../routes/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

jest.mock("react-cookie", () => ({
  useCookies: jest.fn(),
}));

describe("SignoutButton", () => {
  const mockRemoveCookie = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useCookies.mockReturnValue([{}, jest.fn(), mockRemoveCookie]);
  });

  test("renders the sign-out button", () => {
    render(
      <MemoryRouter>
        <SignoutButton />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });

  test("calls signOut function on button click", async () => {
    const mockSignOut = jest.fn();
    supabase.auth.signOut.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <SignoutButton />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Sign Out/i));

    await screen.findByText(/Signing out/); // Ensure signOut log was printed in console (if you want to check for console, you can spy on console.log)

    // Check if supabase.auth.signOut is called
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);

    // Check if removeCookie is called
    expect(mockRemoveCookie).toHaveBeenCalledWith("authToken", { path: "/" });

    // Check if window location changes to login
    expect(window.location.href).toBe("/login");
  });

  test("handles errors when signOut fails", async () => {
    const errorMessage = "Sign out failed!";
    supabase.auth.signOut.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <MemoryRouter>
        <SignoutButton />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Sign Out/i));

    // Ensure console logs or error handling works correctly if needed
    await screen.findByText(/Signing out/);

    // Check if the error is handled properly (logging to console in case of an error or handling UI changes).
    expect(console.error).toHaveBeenCalledWith(errorMessage);
  });
});
