import React from "react";
import { render, screen, act } from "@testing-library/react";
import PatientSidebar from "./PatientSidebar";
import { PatientProvider } from "../../context/PatientContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

jest.mock("@supabase/auth-helpers-react", () => ({
    useSupabaseClient: jest.fn(),
}));

const mockSupabase = {
    from: jest.fn(() => ({
        select: jest.fn(),
    })),
};

describe("PatientSidebar Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSupabaseClient.mockReturnValue(mockSupabase);
    });

    const renderWithProvider = (ui, selectedPatient = null) =>
        render(
            <PatientProvider value={{ selectedPatient }}>
                {ui}
            </PatientProvider>
        );

    test("renders 'No patient selected' when no patient is set", () => {
        renderWithProvider(<PatientSidebar />);
        expect(screen.getByText("No patient selected")).toBeInTheDocument();
    });

    test("renders patient data when a patient is selected", async () => {
        const mockPatient = {
            id: 1,
            name: "Test Patient",
            date_of_birth: "2024-01-01",
            breed: "Golden Retriever",
            weight: "30",
            demeanor: "Calm",
        };

        mockSupabase.from().select.mockResolvedValueOnce({
            data: [{ start_time: "2024-01-15T10:00:00Z", title: "Test Appointment" }],
            error: null,
        });

        renderWithProvider(<PatientSidebar />, mockPatient);

        await act(async () => {});

        expect(screen.getByText("Test Patient")).toBeInTheDocument();
        expect(screen.getByText("Golden Retriever")).toBeInTheDocument();
        expect(screen.getByText("Calm")).toBeInTheDocument();
    });

    test("handles API error gracefully", async () => {
        mockSupabase.from().select.mockResolvedValueOnce({
            data: null,
            error: "Test error",
        });

        renderWithProvider(<PatientSidebar />, { id: 1 });

        await act(async () => {});

        expect(screen.getByText("No appointments available")).toBeInTheDocument();
    });
});
