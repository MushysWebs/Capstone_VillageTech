import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PatientMain from "./PatientMain";
import { PatientProvider } from "../../../context/PatientContext";
import { supabase } from "../../../components/routes/supabaseClient";

jest.mock("../../../components/routes/supabaseClient");

describe("PatientMain Component", () => {
    const mockPatients = [
        { id: 1, name: "Buddy", breed: "Golden Retriever", owner_id: 101 },
        { id: 2, name: "Mittens", breed: "Tabby Cat", owner_id: 102 },
    ];

    beforeEach(() => {
        supabase.from.mockReturnValue({
            select: jest.fn()
                .mockResolvedValueOnce({ data: mockPatients, error: null }),
        });
    });

    test("renders patient list and updates selected patient on click", async () => {
        render(
            <PatientProvider>
                <PatientMain />
            </PatientProvider>
        );

        const buddy = await screen.findByText("Buddy");
        const mittens = screen.getByText("Mittens");

        expect(buddy).toBeInTheDocument();
        expect(mittens).toBeInTheDocument();

        fireEvent.click(buddy);
        expect(await screen.findByText("Buddy")).toBeInTheDocument();
    });
});
