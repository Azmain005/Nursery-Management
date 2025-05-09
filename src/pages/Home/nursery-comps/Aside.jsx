import { NavLink } from "react-router-dom";
import "./aside.css";
const Aside = () => {
  return (
    <div className="w-48 h-[315px] border bg-[#faf6e9] rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-gray-200">
        <NavLink
          to="/nurseryWorker"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Inventory
        </NavLink>
        <div className=""></div>

        <NavLink
          to="/nurseryWorker/monitoring"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Monitoring
        </NavLink>

        <NavLink
          to="/nurseryWorker/order-raw-material"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Order Raw Material
        </NavLink>

        <NavLink
          to="/nurseryWorker/marketPlace"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Marketplace
        </NavLink>

        <NavLink
          to="/nurseryWorker/rawMaterial"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Raw Material
        </NavLink>
        <NavLink
          to="/nurseryWorker/addPlant"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Add Plant
        </NavLink>
      </div>
    </div>
  );
};

export default Aside;

{
  /* <NavLink to='/nurseryWorker'>Inventory</NavLink>
<NavLink to='/nurseryWorker/monitoring'>Monitoring</NavLink> */
}
