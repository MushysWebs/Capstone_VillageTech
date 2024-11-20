import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthGuard from "./AuthGuard"; // Adjust the path as needed
import { supabase } from "../routes/supabaseClient";

// Mock the supabase methods
jest.mock("../routes/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe("AuthGuard", () => {
  const mockChildren = <div>Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });
});
