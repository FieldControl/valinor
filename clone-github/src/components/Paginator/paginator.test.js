import { render, cleanup } from "@testing-library/react";
import Paginator from "./Paginator.js";

afterEach(cleanup);

test("should take a snapshoot", () => {
  const { asFragment } = render(<Paginator />);
  expect(asFragment(<Paginator />)).toMatchSnapshot();
});
