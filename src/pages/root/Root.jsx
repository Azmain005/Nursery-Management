import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/navbar/Navbar";
const Root = () => {
    return (
        <div className="max-w-screen-2xl mx-auto">
           <Navbar></Navbar>
           <Outlet></Outlet>
           <Footer></Footer>
        </div>
    );
};

export default Root;