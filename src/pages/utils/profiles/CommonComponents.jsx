import { FaUser, FaKey } from "react-icons/fa";

export const ProfileHeader = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => (
    <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
        <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-[#3a5a40] flex items-center justify-center">
                    <FaUser className="h-8 w-8 text-white" />
                </div>
            </div>
            <div>
                <h4 className="text-xl font-semibold text-[#02542d]">{user.displayName || "No Name Set"}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm font-medium text-[#3a5a40]">Role: {userData?.role || "Not Set"}</p>
            </div>
        </div>

        {/* Display Name Update Form */}
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-[#02542d] mb-4">Update Display Name</h4>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                            <FaUser className="h-5 w-5" />
                        </span>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="block w-full p-4 pl-12 text-black placeholder-gray-500 transition-all duration-200 border border-[#C8C0C0] rounded-md bg-[#FEFDF4] focus:outline-none focus:border-[#02542d] focus:bg-[#FEFDF4] caret-[#02542d]"
                            placeholder="Enter your display name"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-[#3a5a40] border border-transparent rounded-md focus:outline-none hover:bg-[#02542d] focus:bg-[#02542d]"
                >
                    Update Profile
                </button>
            </form>
        </div>
    </div>
);

export const PasswordUpdateForm = ({ handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => (
    <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0] mt-6">
        <h4 className="text-lg font-semibold text-[#02542d] mb-4">Change Password</h4>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <FaKey className="h-5 w-5" />
                    </span>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full p-4 pl-12 text-black placeholder-gray-500 transition-all duration-200 border border-[#C8C0C0] rounded-md bg-[#FEFDF4] focus:outline-none focus:border-[#02542d] focus:bg-[#FEFDF4] caret-[#02542d]"
                        placeholder="Enter new password"
                    />
                </div>
            </div>
            <div>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                        <FaKey className="h-5 w-5" />
                    </span>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full p-4 pl-12 text-black placeholder-gray-500 transition-all duration-200 border border-[#C8C0C0] rounded-md bg-[#FEFDF4] focus:outline-none focus:border-[#02542d] focus:bg-[#FEFDF4] caret-[#02542d]"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>
            <button
                type="submit"
                className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-[#3a5a40] border border-transparent rounded-md focus:outline-none hover:bg-[#02542d] focus:bg-[#02542d]"
            >
                Update Password
            </button>
        </form>
    </div>
); 