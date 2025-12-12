/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Greeting from "./Greeting";

test("displays the greeting with the name", () => {
  render(<Greeting name="Anamaria" />);
  expect(screen.getByRole("heading")).toHaveTextContent("Hello, Anamaria!");
  // ↑ Busca el <h1> y verifica que diga "Hello, Anamaria!"
});

test("It shows the greeting with a different name.", () => {
  render(<Greeting name="Tom" />);
  expect(screen.getByRole("heading")).toHaveTextContent("Hello, Tom!");
});
