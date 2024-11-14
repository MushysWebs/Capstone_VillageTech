import React from "react";
import { render, act } from "@testing-library/react";
import { PatientProvider, usePatient } from "./PatientContext";

const MockConsumer = () => {
    const { selectedPatient, setSelectedPatient } = usePatient();

    return (
        <div>
            <p data-testid="patient">{selectedPatient?.name || "No patient selected"}</p>
            <button
                onClick={() => setSelectedPatient({ id: 1, name: "Test Patient" })}
            >
                Set Patient
            </button>
        </div>
    );
};

describe("PatientContext Tests", () => {
    test("renders default context with no patient", () => {
        const { getByTestId } = render(
            <PatientProvider>
                <MockConsumer />
            </PatientProvider>
        );

        expect(getByTestId("patient").textContent).toBe("No patient selected");
    });

    test("updates the selected patient", () => {
        const { getByTestId, getByRole } = render(
            <PatientProvider>
                <MockConsumer />
            </PatientProvider>
        );

        act(() => {
            getByRole("button", { name: /Set Patient/i }).click();
        });

        expect(getByTestId("patient").textContent).toBe("Test Patient");
    });

    test("throws an error if usePatient is used outside PatientProvider", () => {
        expect(() => render(<MockConsumer />)).toThrowError(
            "usePatient must be used within a PatientProvider"
        );
    });
});
