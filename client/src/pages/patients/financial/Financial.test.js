import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Financial from "./Financial";
import { PatientProvider } from "../../../context/PatientContext";

describe("Financial Component Tests", () => {
    const renderWithProvider = (ui) =>
        render(<PatientProvider>{ui}</PatientProvider>);

    test("renders Financial component correctly", () => {
        renderWithProvider(<Financial />);

        expect(screen.getByText("Estimates")).toBeInTheDocument();
        expect(screen.getByText("Invoices")).toBeInTheDocument();
    });

    test("displays 'No Estimates Found' when no estimates are available", () => {
        renderWithProvider(<Financial />);

        expect(screen.getByText("No Estimates Found")).toBeInTheDocument();
    });

    test("handles Convert to Invoice button click", () => {
        renderWithProvider(<Financial />);

        fireEvent.click(screen.getByText("Convert to Invoice"));

        expect(screen.getByText("Invoice created successfully!")).toBeInTheDocument();
    });
});
