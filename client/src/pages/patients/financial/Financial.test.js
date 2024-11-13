import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Financial from "./Financial";
import { usePatient } from "../../../context/PatientContext";
import { supabase } from "../../../components/routes/supabaseClient";

// Mock the context provider and Supabase client
jest.mock("../../../context/PatientContext", () => ({
  usePatient: jest.fn(),
}));

jest.mock("../../../components/routes/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    })),
  },
}));

describe("Financial Page", () => {
  beforeEach(() => {
    usePatient.mockReturnValue({ selectedPatient: { id: 1, name: "Test Patient" } });
  });

  test("renders Financial page and fetches data", async () => {
    supabase.from().select().eq().eq.mockResolvedValueOnce({ data: [], error: null });

    render(<Financial />);
    expect(screen.getByText("Estimates")).toBeInTheDocument();
    expect(screen.getByText("Pending Invoices")).toBeInTheDocument();

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("estimates");
      expect(supabase.from).toHaveBeenCalledWith("invoices");
    });
  });

  test("opens Add Estimate modal", () => {
    render(<Financial />);

    const addButton = screen.getByRole("button", { name: "+" });
    fireEvent.click(addButton);

    expect(screen.getByText("Add Estimate")).toBeInTheDocument(); // Assuming modal title
  });

  test("handles convertEstimateToInvoice function", async () => {
    supabase.from().insert.mockResolvedValueOnce({ error: null });
    supabase.from().update.mockResolvedValueOnce({ error: null });

    render(<Financial />);

    // Assume an example estimate to be converted
    const exampleEstimate = { estimate_id: 1, estimate_name: "Test Estimate" };
    const convertButton = screen.getByText("Convert to Invoice");
    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
        invoice_name: exampleEstimate.estimate_name,
      }));
      expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
        is_active: false,
      }));
    });
  });
});