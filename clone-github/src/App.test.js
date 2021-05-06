import { render, screen, cleanup } from "@testing-library/react";
import App from "./App.js";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

afterEach(cleanup);

test("should show Github Clone", () => {
  const history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <App />
    </Router>
  );
  expect(screen.getByText(/Github Clone/i)).toBeInTheDocument();
});
