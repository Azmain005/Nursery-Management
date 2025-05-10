import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home/Home";
import AddPlant from "./pages/Home/nursery-comps/AddPlant";
import Inventory from "./pages/Home/nursery-comps/Inventory";
import Maintenance from "./pages/Home/nursery-comps/Maintenance";
import MarketPlace from "./pages/Home/nursery-comps/MarketPlace";
import Monitoring from "./pages/Home/nursery-comps/Monitoring";
import RawMaterial from "./pages/Home/nursery-comps/RawMaterial";
import Supplier from "./pages/Home/Supplier";
import Vendor from "./pages/Home/Vendor";
import Worker from "./pages/Home/Worker";
import Root from "./pages/root/Root";
import Cart from "./pages/utils/Cart";
import Checkout from "./pages/utils/Checkout";
import Profile from "./pages/utils/profile";
import Settings from "./pages/utils/settings";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import AuthProvider from "./providers/AuthProvider";

import AddMaterial from "./pages/Home/supplier-comps/AddMaterial";
import PendingOrder from "./pages/Home/supplier-comps/pendingOrder";

import NurseryCart from "./pages/Home/nursery-comps/NurseryCart";
import { CartProvider } from "./providers/CartProvider";
import NurseryCheckout from "./pages/Home/nursery-comps/NurseryCheckout";
import { NurseryCartProvider } from "./pages/Home/nursery-comps/NurseryCartProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
      {
        path: "/cart",
        element: (
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        ),
      },
      {
        path: "/nurserycart",
        element: (
          <PrivateRoute>
            <NurseryCartProvider>
              <NurseryCart />
            </NurseryCartProvider>
          </PrivateRoute>
        ),
      },
      {
        path: "/nurserycheckout",
        element: (
          <PrivateRoute>
            <NurseryCartProvider>
              <NurseryCheckout />
            </NurseryCartProvider>
          </PrivateRoute>
        ),
      },
      {
        path: "/checkout",
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        ),
      },
      {
        path: "/supplier",
        element: (
          <PrivateRoute>
            <Supplier />
          </PrivateRoute>
        ),
        children: [
          {
            path: "/supplier/pending-orders",
            element: <PendingOrder />,
          },
          {
            path: "/supplier/add-material",
            element: <AddMaterial />,
          },
        ],
      },
      {
        path: "/nurseryWorker",
        element: (
          <PrivateRoute>
            <NurseryCartProvider>
              <Worker />
            </NurseryCartProvider>
          </PrivateRoute>
        ),
        children: [
          {
            path: "", // default child (for /nurseryWorker)
            element: <Inventory />,
          },
          {
            path: "/nurseryWorker/monitoring", // nested under /nurseryWorker
            element: <Monitoring />,
          },
          {
            path: "/nurseryWorker/order-raw-material", // nested under /nurseryWorker
            element: <Maintenance />,
          },
          {
            path: "/nurseryWorker/marketPlace", // nested under /nurseryWorker
            element: <MarketPlace />,
          },
          {
            path: "/nurseryWorker/rawMaterial", // nested under /nurseryWorker
            element: <RawMaterial />,
          },
          {
            path: "/nurseryWorker/addPlant", // nested under /nurseryWorker
            element: <AddPlant />,
          },
        ],
      },
      {
        path: "/vendor",
        element: (
          <PrivateRoute>
            <Vendor />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
