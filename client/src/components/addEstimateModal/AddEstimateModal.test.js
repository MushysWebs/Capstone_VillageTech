import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddEstimateModal from "./AddEstimateModal";

jest.mock("../../../components/routes/supabaseClient");

describe("AddEstimateModal Tests", () => {
    const mockOnAddEstimate = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders Add Estimate modal with default values", () => {
        render(
            <AddEstimateModal
                isOpen={true}
                selectedPatientId={123}
                onClose={mockOnClose}
                onAddEstimate={mockOnAddEstimate}
            />
        );

        expect(screen.getByText("Add Estimate")).toBeInTheDocument();
        expect(screen.getByLabelText("Invoice Name*")).toHaveValue("");
        expect(screen.getByLabelText("Patient ID*")).toHaveValue("123");
        expect(screen.getByLabelText("Invoice Total*")).toHaveValue("0");
        expect(screen.getByLabelText("Status*")).toHaveValue("Estimate");
    });

    test("submits form with valid data", async () => {
        render(
            <AddEstimateModal
                isOpen={true}
                selectedPatientId={123}
                onClose={mockOnClose}
                onAddEstimate={mockOnAddEstimate}
            />
        );

        fireEvent.change(screen.getByLabelText("Invoice Name*"), { target: { value: "Test Invoice" } });
        fireEvent.change(screen.getByLabelText("Invoice Total*"), { target: { value: "200" } });
        fireEvent.change(screen.getByLabelText("Date*"), { target: { value: "2024-01-15" } });

        fireEvent.click(screen.getByRole("button", { name: "Add Estimate" }));

        expect(mockOnAddEstimate).toHaveBeenCalledWith({
            invoice_id: "", // Default value for new estimates
            invoice_name: "Test Invoice",
            patient_id: 123,
            invoice_total: 200,
            invoice_paid: 0,
            invoice_date: "2024-01-15",
            invoice_status: "Estimate",
            last_update: expect.any(String),
        });
    });

    test("displays error for invalid Invoice Total", () => {
        render(
            <AddEstimateModal
                isOpen={true}
                selectedPatientId={123}
                onClose={mockOnClose}
                onAddEstimate={mockOnAddEstimate}
            />
        );

        fireEvent.change(screen.getByLabelText("Invoice Total*"), { target: { value: "Invalid" } });
        fireEvent.click(screen.getByRole("button", { name: "Add Estimate" }));

        expect(screen.getByText("Invoice total must be a valid number.")).toBeInTheDocument();
        expect(mockOnAddEstimate).not.toHaveBeenCalled();
    });

    test("closes the modal on Cancel button click", () => {
        render(
            <AddEstimateModal
                isOpen={true}
                selectedPatientId={123}
                onClose={mockOnClose}
                onAddEstimate={mockOnAddEstimate}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders Edit Estimate when estimateToEdit is provided", () => {
        const estimateToEdit = {
            invoice_id: "456",
            invoice_name: "Existing Estimate",
            invoice_total: "300",
            invoice_paid: "50",
            invoice_date: "2024-01-10",
            invoice_status: "Estimate",
        };

        render(
            <AddEstimateModal
                isOpen={true}
                selectedPatientId={123}
                onClose={mockOnClose}
                onAddEstimate={mockOnAddEstimate}
                estimateToEdit={estimateToEdit}
            />
        );

        expect(screen.getByText("Edit Estimate")).toBeInTheDocument();
        expect(screen.getByLabelText("Invoice Name*")).toHaveValue("Existing Estimate");
        expect(screen.getByLabelText("Invoice Total*")).toHaveValue("300");
    });
});
