import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home/Home";
import Root from "./pages/root/Root";
import Profile from "./pages/utils/profile";
import Settings from "./pages/utils/settings";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import AuthProvider from "./providers/AuthProvider";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>, //will make it private later
    children: [
      {
        path: "/",
        element: <PrivateRoute><Home></Home></PrivateRoute>,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
      {
        path: "/profile",
        element: <Profile></Profile> //protected korte hobe
      },
      {
        path: "/settings",
        element: <PrivateRoute><Settings></Settings></PrivateRoute> //protected korte hobe
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
