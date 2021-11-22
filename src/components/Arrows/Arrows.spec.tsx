import { render, screen } from "@testing-library/react";
import { Arrows } from ".";

describe("Arrows Component", () => {
  it("Arrows button should be disabled if 'isFetching' = true", () => {
    render(<Arrows isFetching={true} />);
    expect(screen.getByTitle("Avançar")).toHaveAttribute("disabled", "");
  });

  it("Arrows render correctly", () => {
    render(<Arrows isFetching={true} />);
    expect(screen.getByTitle("Avançar")).toBeTruthy();
  });
});
