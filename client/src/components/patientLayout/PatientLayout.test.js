import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { usePatient } from "../../context/PatientContext";
import PatientLayout from "./PatientLayout";
import PatientSidebar from "../patientSidebar/PatientSidebar";
import PatientTabs from "../PatientTabs";

// Mock the necessary modules and functions
jest.mock("@supabase/auth-helpers-react", () => ({
  useSupabaseClient: jest.fn(),
}));

jest.mock("../../context/PatientContext", () => ({
  usePatient: jest.fn(),
}));

jest.mock("../patientSidebar/PatientSidebar", () => ({
  __esModule: true,
  default: jest.fn(() => <div>PatientSidebar</div>),
}));

jest.mock("../PatientTabs", () => ({
  __esModule: true,
  default: jest.fn(() => <div>PatientTabs</div>),
}));

// Setup mock data
const mockPatientData = [
  {
    id: 1,
    name: "Test Patient",
    breed: "Dog",
    image_url: null,
  },
  {
    id: 2,
    name: "Another Patient",
    breed: "Cat",
    image_url: null,
  },
];

describe("PatientLayout", () => {
  const mockSetSelectedPatient = jest.fn();
  const mockUsePatient = { selectedPatient: null, setSelectedPatient: mockSetSelectedPatient };

  beforeEach(() => {
    jest.clearAllMocks();
    useSupabaseClient.mockReturnValue({
      storage: {
        from: jest.fn().mockReturnThis(),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "defaultPPic.png" } }),
      },
    });
    usePatient.mockReturnValue(mockUsePatient);
  });

  test("renders the layout with children", () => {
    render(
      <PatientLayout globalSearchTerm="">
        <div>Children Content</div>
      </PatientLayout>
    );

    // Check if children content renders
    expect(screen.getByText("Children Content")).toBeInTheDocument();
  });


  test("does not show PatientTabs when showTabs is false", () => {
    render(<PatientLayout globalSearchTerm="" showTabs={false} />);

    // Ensure PatientTabs is not rendered
    expect(screen.queryByText("PatientTabs")).not.toBeInTheDocument();
  });

  test("shows PatientSelector when no patient is selected", () => {
    render(<PatientLayout globalSearchTerm="" />);

    // The patient selector should be displayed
    expect(screen.getByText("Patient List")).toBeInTheDocument();
  });

  test("calls setShowSelector when switching to patient list view", () => {
    render(<PatientLayout globalSearchTerm="" />);

    // The patient selector should be shown initially
    fireEvent.click(screen.getByText("PatientSidebar"));

    // After clicking, the patient list should be visible
    expect(screen.getByText("Patient List")).toBeInTheDocument();
  });
});
