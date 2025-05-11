import { useContext, useEffect, useState } from "react";
import { IoMdContact, IoMdSettings } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import { useCart } from "../../providers/CartProvider";
// Import logo with a more reliable approach
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { user, signOutUser, getRoleFromDatabase } = useContext(AuthContext);
  const { cartItems } = useCart(); // Get live cart
  const [userData, setUserData] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Fallback logo URL
  const fallbackLogo = "https://via.placeholder.com/30x30?text=PLANTy";

  // Default user avatar
  // const defaultAvatar = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";
  const defaultAvatar =
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp";

  useEffect(() => {
    // Preload the logo image to ensure it's ready
    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => setLogoLoaded(true);
    logoImg.onerror = () => setLogoError(true);

    if (user) {
      getRoleFromDatabase(user)
        .then((user) => {
          setUserData(user);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [user, getRoleFromDatabase]);

  const handleSignout = () => {
    signOutUser()
      .then(() => {
        // Sign-out successful.
        console.log("Sign out successful");
      })
      .catch((error) => {
        // An error happened.
        console.error("Sign out error", error);
      });
  };

  // Check if user is a supplier
  const isSupplier = userData === "Supplier";

  // Calculate cart total once
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <div className="navbar bg-[#faf6e9] border-b-2 border-[#3e5931]">
        <div className="flex-1">
          <NavLink to="/">
            <div className="flex gap-1 hover:bg-[#9bab9a] w-[105px] p-2">
              {logoError ? (
                // Use fallback if logo fails to load
                <img
                  src={fallbackLogo}
                  className="w-[30px]"
                  alt="PLANTy Logo"
                />
              ) : (
                <img
                  src={logo}
                  className="w-[30px]"
                  alt="PLANTy Logo"
                  onError={(e) => {
                    setLogoError(true);
                    e.target.src = fallbackLogo;
                  }}
                />
              )}
              <p className="font-semibold text-[#02542d]">PLANTy</p>
            </div>
          </NavLink>
        </div>
        {user ? (
          <div className="flex-none mr-5">
            {/* Only show cart if user is NOT a supplier */}
            {!isSupplier && (
              <div className="dropdown dropdown-end bg-[#02542d] text-white rounded-full mr-3">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle"
                >
                  <div className="indicator">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="badge badge-xs indicator-item">
                      {cartItems.length}
                    </span>
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="card card-compact dropdown-content bg-base-100 z-50 mt-5 w-52 shadow"
                >
                  <div className="card-body bg-[#9bab9a] text-white">
                    <span className="text-lg font-bold">
                      {cartItems.length} Item{cartItems.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-info text-white">
                      Subtotal: $ {cartTotal}
                    </span>

                    <div className="card-actions">
                      <NavLink
                        to={
                          userData === "NurseryWorker"
                            ? "/nurserycart"
                            : "/cart"
                        }
                        className="btn btn-primary bg-[#02542d] border-none shadow-none btn-block"
                      >
                        View cart
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      alt="User avatar"
                      src={user.photoURL}
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = defaultAvatar;
                      }}
                    />
                  ) : (
                    <img alt="Default avatar" src={defaultAvatar} />
                  )}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-[#9bab9a] rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <p className="text-sm text-center text-emerald-900">
                  Welcome,
                  <br /> {user.displayName || "User"}
                </p>
                <div className="divider my-0"></div>
                <li>
                  <NavLink
                    to="/profile"
                    className="justify-between text-white text-sm hover:text-black"
                  >
                    <div className="flex justify-center items-center gap-1">
                      <IoMdContact className="text-xl" />
                      <p className="text-sm">Profile</p>
                    </div>
                  </NavLink>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <NavLink
                    to="settings"
                    className="text-white text-sm hover:text-black"
                  >
                    <div className="flex justify-center items-center gap-1">
                      <IoMdSettings className="text-xl" />
                      <p className="text-sm">Settings</p>
                    </div>
                  </NavLink>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <button
                    onClick={handleSignout}
                    className="btn bg-red-400 text-sm hover:bg-red-500 border-none shadow-none mt-2"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <NavLink
              to="/login"
              className="btn bg-[#3a5a40] text-white text-sm hover:translate-y-1 hover:text-black"
            >
              Login
            </NavLink>
            <p className="text-2xl font-semi-bold">Or</p>
            <NavLink
              to="/register"
              className="btn bg-[#3a5a40] text-white text-sm hover:translate-y-1 hover:text-black"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
