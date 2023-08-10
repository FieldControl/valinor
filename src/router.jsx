import { createBrowserRouter } from "react-router-dom";
import Header from "./pages/MainPage/Header";
import Main from "./pages/MainPage/Main";
import Projects from "./pages/MainPage/Projects";
import RootLayout from "./pages/RootLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Header />,
      },
      {
        path: "/",
        element: <Main />,
      },
      {
        path: "/",
        element: <Projects />,
      },
    ],
  },
]);

export default router;
