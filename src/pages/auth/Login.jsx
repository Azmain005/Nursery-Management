import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import leaf from "../../assets/leaf.png";
import { AuthContext } from "../../providers/AuthProvider";

const Login = () => {
  const navigate = useNavigate();

  const {
    signInUser,
    signInWithGoogle,
    signOutUser,
    loading,
    addUserToDatabase,
  } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [googleerror, googlesetError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;
    signInUser(email, password)
      .then((result) => {
        const user = result.user;
        console.log("succesfully logged in");
        navigate("/");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleSigninwithGoogle = () => {
    setError("");
    console.log("button clicked");
    signInWithGoogle()
      .then((result) => {
        const user = result.user;
        console.log(user);
        // addUserToDatabase(user);
        navigate("/");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="bg-[#fefaef]">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Form Section */}
        <div className="flex items-center justify-center px-4 py-10 bg-[#fefaef] sm:px-6 lg:px-8 sm:py-16 lg:py-24">
          <div className="w-full max-w-md mx-auto md:max-w-lg lg:max-w-md xl:max-w-lg">
            <h2 className="text-2xl font-bold leading-tight text-[#02542d] sm:text-3xl md:text-4xl">
              Sign in to Explore PLANTy
            </h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Don't have an account?{" "}
              <NavLink
                to="/register"
                className="font-medium text-[#3a5a40] transition-all duration-200 hover:text-[#02542d] hover:underline focus:[#02542d]"
              >
                Create a free account
              </NavLink>
            </p>

            <form onSubmit={handleLogin} className="mt-6 md:mt-8">
              <div className="space-y-4 md:space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-900 md:text-base"
                  >
                    {" "}
                    Email address{" "}
                  </label>
                  <div className="mt-1 md:mt-2.5">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Enter email to get started"
                      className="block w-full p-3 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#02542d] focus:bg-white caret-[#02542d] md:p-4"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-900 md:text-base"
                    >
                      {" "}
                      Password{" "}
                    </label>

                    <a
                      href="#"
                      title=""
                      className="text-xs font-medium text-[#3a5a40] hover:underline hover:text-[#02542d] focus:text-[#02542d] md:text-sm"
                    >
                      {" "}
                      Forgot password?{" "}
                    </a>
                  </div>
                  <div className="mt-1 mb-2 relative md:mt-2.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      className="block w-full p-3 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#02542d] focus:bg-white caret-[#02542d] md:p-4"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 md:px-4"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {error && (
                    <div role="alert" className="alert alert-error">
                      <span className="text-sm font-semi-bold">{error}</span>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white transition-all duration-200 bg-[#3a5a40] border border-transparent rounded-md focus:outline-none hover:bg-[#02542d] focus:bg-[#02542d] md:text-base md:py-4"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3 space-y-3">
              <button
                onClick={handleSigninwithGoogle}
                type="button"
                className="relative inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-[#02542d] transition-all duration-200 bg-white border-2 border-gray-200 rounded-md hover:bg-gray-100 focus:bg-gray-100 hover:text-black focus:text-black focus:outline-none md:text-base md:py-4"
              >
                <div className="absolute inset-y-0 left-0 p-3 md:p-4">
                  <svg
                    className="w-5 h-5 text-[#02542d] md:w-6 md:h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                  </svg>
                </div>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex items-center justify-center px-4 py-10 sm:py-16 lg:py-24 bg-[#fefaef] sm:px-6 lg:px-8">
          <div>
            <img className="w-full max-w-xs mx-auto md:max-w-sm lg:max-w-md" src={leaf} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;