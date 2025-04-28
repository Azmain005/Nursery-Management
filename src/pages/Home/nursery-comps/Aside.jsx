import { NavLink } from "react-router-dom";
import './aside.css';
const Aside = () => {
    return (
        <div className="w-48 bg-[#faf6e9] rounded-xl overflow-hidden shadow-sm">
          <NavLink
            to="/nurseryWorker"
            end
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            Inventory
          </NavLink>
    
          <div className="divide-y divide-gray-200">
            <NavLink
              to="/nurseryWorker/monitoring"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Monitoring
            </NavLink>
    
            <NavLink
              to="/nurseryWorker/maintenance"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Maintainace
            </NavLink>
    
            <NavLink
              to="/nurseryWorker/marketPlace"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Marketplace
            </NavLink>
    
            <NavLink
              to="/nurseryWorker/rawMaterial"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              Raw Material
            </NavLink>
          </div>
        </div>
      );
    };
    

export default Aside;

{/* <NavLink to='/nurseryWorker'>Inventory</NavLink>
<NavLink to='/nurseryWorker/monitoring'>Monitoring</NavLink> */}