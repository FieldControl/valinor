import { render, cleanup } from "@testing-library/react";
import Paginator from "./Paginator.js";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

afterEach(cleanup);

test("should take a snapshoot", () => {
  const history = createMemoryHistory();

  history.push("/");

  const { asFragment } = render(
    <Router history={history}>
      <Paginator />
    </Router>
  );
  expect(asFragment(<Paginator />)).toMatchSnapshot();
});
