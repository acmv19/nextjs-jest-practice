/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import Button from "./Button";

test("calls the onClick handler when clicked", () => {
  // Mock function to track clicks
  const mockOnClick = jest.fn();

  // Render the Button component
  render(<Button onClick={mockOnClick}>Click Me</Button>);

  // Click the button
  const button = screen.getByRole("button", { name: "Click Me" });
  fireEvent.click(button);

  // Verify the mock function was called
  expect(mockOnClick).toHaveBeenCalled();

  // Verify the mock function was called once
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

test("calls onClick multiple times", () => {
  const mockOnClick = jest.fn();

  render(<Button onClick={mockOnClick}>Press Here</Button>);

  const button = screen.getByRole("button", { name: "Press Here" });

  // Click 3 times
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(button);

  // Verify it was called 3 times
  expect(mockOnClick).toHaveBeenCalledTimes(3);
});
