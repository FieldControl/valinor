import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import Characters from './Pages/Characters';
import Comics from './Pages/Comics';
import Series from './Pages/Series';
import ErrorPage from './Pages/Error/Error';

const rounter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "/",
        element: <Characters />,
      },
      {
        path: "comics",
        element: <Comics />,
      },
      {
        path: "series",
        element: <Series />,
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={rounter}/>
  </React.StrictMode>
)
