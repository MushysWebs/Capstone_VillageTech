import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePatient } from "../../context/PatientContext";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PatientSidebar from "./PatientSidebar";

// Mock the necessary hooks and components
jest.mock("../../context/PatientContext", () => ({
  usePatient: jest.fn(),
}));

jest.mock("@supabase/auth-helpers-react", () => ({
  useSupabaseClient: jest.fn(),
}));

// Mock supabaseClient functions
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

describe("PatientSidebar Component", () => {
  let mockPatientData;
  let mockAppointments;
  let mockStaffData;
  let mockOwnerData;

  beforeEach(() => {
    mockPatientData = {
      id: "123",
      name: "John Doe",
      date_of_birth: "2015-06-15",
      breed: "Labrador",
      weight: "25",
      demeanor: "Friendly",
      image_url: "http://example.com/image.jpg",
      preferred_doctor: "Dr. Smith",
    };

    mockAppointments = [
      {
        title: "Annual Checkup",
        start_time: "2024-12-01T10:00:00Z",
        end_time: "2024-12-01T11:00:00Z",
        status: "Scheduled",
        staff_id: "1",
      },
    ];

    mockStaffData = [
      { id: "1", name: "Dr. Smith" },
    ];

    mockOwnerData = {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane.doe@example.com",
      phone_number: "555-555-5555",
    };

    usePatient.mockReturnValue({
      selectedPatient: mockPatientData,
    });

    useSupabaseClient.mockReturnValue(mockSupabaseClient);

    // Mock the supabase API calls
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "appointments") {
        return { select: jest.fn().mockResolvedValue({ data: mockAppointments }) };
      } else if (table === "staff") {
        return { select: jest.fn().mockResolvedValue({ data: mockStaffData }) };
      } else if (table === "patients") {
        return { select: jest.fn().mockResolvedValue({ data: [mockPatientData] }) };
      } else if (table === "owners") {
        return { select: jest.fn().mockResolvedValue({ data: [mockOwnerData] }) };
      }
      return { select: jest.fn() };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handles no patient selected", () => {
    usePatient.mockReturnValue({
      selectedPatient: null,
    });

    render(<PatientSidebar onSwitchToList={jest.fn()} />);

    // Check if "No patient selected" is displayed
    expect(screen.getByText(/No patient selected/)).toBeInTheDocument();
  });

  test("switches to list view when button is clicked", () => {
    const onSwitchToListMock = jest.fn();

    render(<PatientSidebar onSwitchToList={onSwitchToListMock} />);

    // Simulate a click on the switch list button
    fireEvent.click(screen.getByText(/Reselect/));

    // Check if the mock function is called
    expect(onSwitchToListMock).toHaveBeenCalled();
  });

  test("displays no appointments when no appointments exist", async () => {
    mockAppointments = [];

    render(<PatientSidebar onSwitchToList={jest.fn()} />);

    // Wait for the sidebar to render appointments section
    await waitFor(() => {
      expect(screen.getByText(/No appointments available/)).toBeInTheDocument();
    });
  });
});
