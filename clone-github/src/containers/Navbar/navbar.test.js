import { render, cleanup } from "@testing-library/react";
import Navbar from "./Navbar.js";

afterEach(cleanup);

test("should take a snapshoot", () => {
  const { asFragment } = render(<Navbar />);
  expect(asFragment(<Navbar />)).toMatchSnapshot();
});
