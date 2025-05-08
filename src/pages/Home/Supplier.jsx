import SupplierAside from "./supplier-comps/SupplierAside";
import Footer from "../../components/footer/Footer";
import { Outlet } from "react-router-dom";

const Supplier = () => {
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
