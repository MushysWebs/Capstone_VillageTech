import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddVitalModal from "./AddVitalModal"; // Adjust the path if necessary

describe("AddVitalModal", () => {
  const mockOnAddVital = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when isOpen is false", () => {
    render(<AddVitalModal isOpen={false} onAddVital={mockOnAddVital} onClose={mockOnClose} />);
    const modal = screen.queryByRole("dialog");
    expect(modal).toBeNull();
  });


  test("input fields are initially empty", () => {
    render(<AddVitalModal isOpen={true} onAddVital={mockOnAddVital} onClose={mockOnClose} />);
    expect(screen.getByLabelText(/Date:/i).value).toBe("");
    expect(screen.getByLabelText(/Weight \(lbs\):/i).value).toBe("");
    expect(screen.getByLabelText(/Temperature \(Celsius\):/i).value).toBe("");
    expect(screen.getByLabelText(/Heart Rate:/i).value).toBe("");
  });

  test("inputs accept valid data", () => {
    render(<AddVitalModal isOpen={true} onAddVital={mockOnAddVital} onClose={mockOnClose} />);

    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: "2024-11-15" } });
    fireEvent.change(screen.getByLabelText(/Weight \(lbs\):/i), { target: { value: "150" } });
    fireEvent.change(screen.getByLabelText(/Temperature \(Celsius\):/i), { target: { value: "37.5" } });
    fireEvent.change(screen.getByLabelText(/Heart Rate:/i), { target: { value: "72" } });

    expect(screen.getByLabelText(/Date:/i).value).toBe("2024-11-15");
    expect(screen.getByLabelText(/Weight \(lbs\):/i).value).toBe("150");
    expect(screen.getByLabelText(/Temperature \(Celsius\):/i).value).toBe("37.5");
    expect(screen.getByLabelText(/Heart Rate:/i).value).toBe("72");
  });

  test("closes modal without adding vital when Cancel button is clicked", () => {
    render(<AddVitalModal isOpen={true} onAddVital={mockOnAddVital} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnAddVital).not.toHaveBeenCalled();
  });
});
