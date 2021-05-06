import { render, cleanup } from "@testing-library/react";
import IssueCard from "./IssueCard.js";

afterEach(cleanup);

test("should take a snapshoot", () => {
  const { asFragment } = render(<IssueCard />);
  expect(asFragment(<IssueCard />)).toMatchSnapshot();
});
