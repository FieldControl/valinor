import { render, cleanup } from "@testing-library/react";
import RepoCard from "./RepoCard.js";

afterEach(cleanup);

test("should take a snapshoot", () => {
  const { asFragment } = render(<RepoCard />);
  expect(asFragment(<RepoCard />)).toMatchSnapshot();
});
