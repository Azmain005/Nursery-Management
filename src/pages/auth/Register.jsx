import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import leaf from "../../assets/leaf.png";
import { AuthContext } from "../../providers/AuthProvider";
const Register = () => {
    const {user, loading, createUser, signInWithGoogle} = useContext(AuthContext);
    const [error, setError] = useState(null)
    const handleCreateUser = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        console.log(email, password)
        createUser(email, password)
        .then((result) => {
            const user = result.user;
            console.log(user);
        })
        .catch((error) => {
            setError(error);
            console.log(error);
        })

    }
    const handleSigninwithGoogle = () => {
      console.log('button clicked');
      signInWithGoogle()
      .then((result) => {
          const user = result.user;
          console.log(user);
      })
      .catch((error) => {
          console.log(error)
      })
    }
    
    return (
        <section class="bg-[#fefaef]">
              <div class="grid grid-cols-1 lg:grid-cols-2">
                <div class="flex items-center justify-center px-4 py-10 bg-[#fefaef] sm:px-6 lg:px-8 sm:py-16 lg:py-24">
                  <div class="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
                    <h2 class="text-3xl font-bold leading-tight text-[#02542d] sm:text-4xl">
                    Sign up now
                    </h2>
                    <p class="mt-2 text-base text-gray-600">
                      Already have an account?{" "}
                      <a
                        href="#"
                        title=""
                        class="font-medium text-[#3a5a40] transition-all duration-200 hover:text-[#02542d] hover:underline focus:[#02542d]"
                      >
                        Login
                      </a>
                    </p>
        
                    <form  onSubmit={handleCreateUser} class="mt-8">
                      <div class="space-y-5">
                      <div>
                          <label for="" class="text-base font-medium text-gray-900">
                            {" "}
                            Your Name{" "}
                          </label>
                          <div class="mt-2.5">
                            <input
                              type="text"
                              name="name"
                              placeholder="Enter your name"
                              class="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#02542d] focus:bg-white caret-[#02542d]"
                            />
                          </div>
                        </div>
                        <div>
                          <label for="" class="text-base font-medium text-gray-900">
                            {" "}
                            Email address{" "}
                          </label>
                          <div class="mt-2.5">
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter your email"
                              class="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#02542d] focus:bg-white caret-[#02542d]"
                            />
                          </div>
                        </div>
        
                        <div>
                          <div class="flex items-center justify-between">
                            <label for="" class="text-base font-medium text-gray-900">
                              {" "}
                              Password{" "}
                            </label>
        
                            
                          </div>
                          <div class="mt-2.5">
                            <input
                              type="password"
                              name="password"
                              placeholder="Enter your password"
                              class="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#02542d] focus:bg-white caret-[#02542d]"
                            />
                          </div>
                        </div>
        
                        <div>
                          <button
                            type="submit"
                            class="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-[#3a5a40] border border-transparent rounded-md focus:outline-none hover:bg-[#02542d] focus:bg-[#02542d]"
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    </form>
        
                    <div class="mt-3 space-y-3">
                      <button
                      onClick={handleSigninwithGoogle}
                        type="button"
                        class="relative inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-[#02542d]] transition-all duration-200 bg-white border-2 border-gray-200 rounded-md hover:bg-gray-100 focus:bg-gray-100 hover:text-black focus:text-black focus:outline-none"
                      >
                        <div class="absolute inset-y-0 left-0 p-4">
                          <svg
                            class="w-6 h-6 text-[#02542d]"
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
        
                <div class="flex items-center justify-center px-4 py-10 sm:py-16 lg:py-24 bg-[#fefaef] sm:px-6 lg:px-8">
                  <div>
                    <img class="w-[400px] mx-auto" src={leaf} alt="" />
                  </div>
                </div>
              </div>
            </section>
    );
};

export default Register;