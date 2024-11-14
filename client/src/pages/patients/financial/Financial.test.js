import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Financial from "./Financial";
import React from "react";
import { usePatient } from "../../../context/PatientContext";
import { supabase } from "../../../components/routes/supabaseClient";
import userEvent from "@testing-library/user-event";

// Mock the required modules
jest.mock("../../../context/PatientContext");
jest.mock("../../../components/routes/supabaseClient");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: ({ children }) => <a href="/">{children}</a>
}));

const mockSelectedPatient = {
  id: 1,
  name: "Test Patient"
};

const mockEstimateData = [
  {
    invoice_id: 1,
    invoice_name: "Test Estimate",
    invoice_total: 100,
    invoice_status: "Estimate",
    invoice_date: "2024-01-01",
    patient_id: 1
  }
];

const mockInvoiceData = [
  {
    invoice_id: 2,
    invoice_name: "Test Invoice",
    invoice_total: 200,
    invoice_status: "Pending",
    invoice_date: "2024-01-02",
    patient_id: 1
  }
];

describe("Financial Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    usePatient.mockReturnValue({ selectedPatient: mockSelectedPatient });
    
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null })
    }));
  });

  const renderFinancial = (props = {}) => {
    return render(
      <BrowserRouter>
        <Financial {...props} />
      </BrowserRouter>
    );
  };

  // Test Component Rendering
  test("renders all main sections", () => {
    renderFinancial();
    
    expect(screen.getByText("Estimates")).toBeInTheDocument();
    expect(screen.getByText("Pending Invoices")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  // Test Data Fetching
  test("fetches and displays estimate and invoice data", async () => {
    const mockSupabaseResponse = {
      data: mockEstimateData,
      error: null
    };

    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve(mockSupabaseResponse)
        })
      })
    }));

    renderFinancial();

    await waitFor(() => {
      expect(screen.getByText("Test Estimate")).toBeInTheDocument();
    });
  });

  // Test Search Functionality
  test("filters data based on search term", async () => {
    renderFinancial({ globalSearchTerm: "Test" });
    
    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1); // Header row + at least one data row
    });
  });

  // Test Status Updates
  test("handles invoice status updates", async () => {
    renderFinancial();
    
    const completeButton = screen.getByText("Complete");
    fireEvent.click(completeButton);
    
    await waitFor(() => {
      expect(supabase.from().update).toHaveBeenCalledWith({
        invoice_status: "Completed"
      });
    });
  });

  // Test Modal Operations
  test("opens and closes add estimate modal", async () => {
    renderFinancial();
    
    const addButton = screen.getByText("+");
    fireEvent.click(addButton);
    
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // Test Error Handling
  test("handles Supabase errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    supabase.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: null, error: new Error("Test error") })
        })
      })
    }));

    renderFinancial();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  // Test Currency Formatting
  test("formats currency correctly", () => {
    renderFinancial();
    
    const amount = screen.getByText("$100.00");
    expect(amount).toBeInTheDocument();
  });

  // Test Status Class Assignment
  test("applies correct status classes", () => {
    renderFinancial();
    
    const statusButtons = screen.getAllByText("Pending");
    expect(statusButtons[0]).toHaveClass("status-pending");
  });
});