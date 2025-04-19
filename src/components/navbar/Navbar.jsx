import { AiOutlineHome } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
const Navbar = () => {

    const links = <>
          <li><NavLink to='/'><AiOutlineHome className="text-2xl"/></NavLink></li>
    </>
  return (
    <div>
        <div className="navbar bg-green-200">
  <div className="navbar-start">
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
        {links}
      </ul>
    </div>
    <NavLink to='/' className="normal-case text-xl hover:bg-green-400">
        <img src={logo} alt="" className="w-12 h-12" /> </NavLink>
  </div>
  <div className="navbar-center hidden lg:flex">
    <ul className="menu menu-horizontal px-1">
      {links}
    </ul>
  </div>
  <div className="navbar-end gap-3">
    <NavLink to='/login' className='btn'>Login</NavLink>
    <span>Or</span>
    <NavLink to='/register' className='btn'>Register</NavLink>
  </div>
  
</div>
    </div>
  );
};

export default Navbar;
