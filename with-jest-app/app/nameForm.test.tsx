/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import NameForm from "./nameForm";

test("It displays the greeting when the user types their name and clicks.", () => {
  render(<NameForm />);

  const input = screen.getByPlaceholderText("Enter your name");
  fireEvent.change(input, { target: { value: "Ana" } });

  const button = screen.getByRole("button", { name: "Greet me" });
  fireEvent.click(button);

  expect(screen.getByText("Hello, Ana!")).toBeInTheDocument();
});
