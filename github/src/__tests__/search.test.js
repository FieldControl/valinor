import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "../App";

describe("input component", () => {
  test("renders input", () => {
    render(<App />);

    expect(screen.getByPlaceholderText("Search Repository")).toBeTruthy();
  });
});

describe("button component", () => {
  test("renders button search", () => {
    render(<App />);

    expect(screen.getByRole("button")).toBeTruthy();
  });
});

describe("integration test", () => {
  test("Search repository render", async () => {
    render(<App />);

    const inputElement = screen.getByPlaceholderText("Search Repository");
    const buttonElement = screen.getByRole("button");

    fireEvent.change(inputElement, { target: { value: "miguelleite21" } });
    fireEvent.click(buttonElement);

    const repository = await screen.findByText("miguelleite21/miguelleite21");

    expect(repository).toBeInTheDocument();
  });
});
