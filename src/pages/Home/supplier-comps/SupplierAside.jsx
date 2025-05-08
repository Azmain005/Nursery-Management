import { NavLink } from "react-router-dom";
import "../nursery-comps/aside.css";

const SupplierAside = () => {
  return (
    <div
      className="w-48 border bg-[#faf6e9] rounded-xl overflow-hidden shadow-sm mt-10 ml-5"
      style={{ height: "fit-content" }}
    >
      <div className="divide-y divide-gray-200">
        <NavLink
          to="/supplier/pending-orders"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Pending Orders
        </NavLink>

        <NavLink
          to="/supplier/add-material"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Add Material
        </NavLink>
      </div>
    </div>
  );
};

export default SupplierAside;
