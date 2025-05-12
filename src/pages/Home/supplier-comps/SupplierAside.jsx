import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import "../nursery-comps/aside.css";

const SupplierAside = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50 && !sidebarOpen) {
      // Swipe left to open
      setSidebarOpen(true);
    } else if (touchEndX.current - touchStartX.current > 50 && sidebarOpen) {
      // Swipe right to close
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-20 left-2 top-15 p-2 bg-[#faf6e9] rounded-md shadow-md md:hidden"
        >
          ☰
        </button>
      )}

      <div
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed md:static z-10 w-48 border bg-[#faf6e9] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
        style={{ height: "fit-content", marginTop: "2.5rem", marginLeft: "1.25rem" }}
      >
        <div className="divide-y divide-gray-200">
          <NavLink
            to="/supplier/pending-orders"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            Pending Orders
          </NavLink>

          <NavLink
            to="/supplier/add-material"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            Add Material
          </NavLink>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default SupplierAside;