import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SupplierAside from "./supplier-comps/SupplierAside";
import Footer from "../../components/footer/Footer";
import { Outlet } from "react-router-dom";

const Supplier = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the pending orders page on landing
    navigate("/supplier/pending-orders");
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <SupplierAside />
        <div className="flex-1 p-10 bg-[#fefaef]">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Supplier;
