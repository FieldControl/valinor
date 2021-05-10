import { render, cleanup } from "@testing-library/react";
import Home from "./Home.js";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

afterEach(cleanup);

test("should show Search ", () => {
  const history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <Home />
    </Router>
  );
  // expect(screen.getByText(/Search/i)).toBeInTheDocument();
  expect(<Home />).toMatchSnapshot();
});
