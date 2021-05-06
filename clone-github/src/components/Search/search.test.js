import { render, fireEvent, cleanup } from "@testing-library/react";
import Search from "./Search";

describe("Search snapshoot", () => {
  afterEach(cleanup);
  test("should take a snapshoot", () => {
    const { asFragment } = render(<Search />);
    expect(asFragment(<Search />)).toMatchSnapshot();
  });
  test("It should change the input", () => {
    const setup = () => {
      const utils = render(<Search />);
      const input = utils.getByTestId("input");
      return {
        input,
        ...utils,
      };
    };
    const { input } = setup();
    fireEvent.change(input, { target: { value: "node" } });
    expect(input.value).toBe("node");
  });

  test("select element  not appear", () => {
    const { getByTestId } = render(<Search />);
    expect(getByTestId("+")).toHaveTextContent("+");
  });
});
