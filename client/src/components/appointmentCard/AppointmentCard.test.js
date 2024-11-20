import { render, screen } from "@testing-library/react";
import AppointmentCard from "./AppointmentCard"; // Adjust the path if necessary

describe("AppointmentCard", () => {
  const props = {
    title: "Routine Checkup",
    time: "2024-11-15 10:00 AM",
    patient: "John Doe",
    doctor: "Dr. Smith",
  };

  test("renders appointment card with correct information", () => {
    render(<AppointmentCard {...props} />);

    expect(screen.getByRole("heading", { name: /Routine Checkup/i })).toBeInTheDocument();
    expect(screen.getByText(/2024-11-15 10:00 AM/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient: John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor: Dr. Smith/i)).toBeInTheDocument();
  });

  test("renders the correct title", () => {
    render(<AppointmentCard {...props} />);
    expect(screen.getByText(/Routine Checkup/i)).toBeInTheDocument();
  });

  test("renders the correct time", () => {
    render(<AppointmentCard {...props} />);
    expect(screen.getByText(/2024-11-15 10:00 AM/i)).toBeInTheDocument();
  });

  test("renders the correct patient name", () => {
    render(<AppointmentCard {...props} />);
    expect(screen.getByText(/Patient: John Doe/i)).toBeInTheDocument();
  });

  test("renders the correct doctor name", () => {
    render(<AppointmentCard {...props} />);
    expect(screen.getByText(/Doctor: Dr. Smith/i)).toBeInTheDocument();
  });
});
