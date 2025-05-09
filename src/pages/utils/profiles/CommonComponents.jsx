import { FaUser, FaKey } from "react-icons/fa";
import { useState } from "react";

export const ProfileHeader = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    return (
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

            <div className="flex space-x-4">
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#02542d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40]"
                >
                    <FaUser className="h-4 w-4 mr-2" />
                    Update Profile
                </button>
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#02542d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40]"
                >
                    <FaKey className="h-4 w-4 mr-2" />
                    Change Password
                </button>
            </div>

            {/* Profile Update Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#FAF6E9] rounded-lg border border-[#C8C0C0] p-6 max-w-md w-full mx-4 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-[#02542d]">Update Profile</h3>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-gray-500 hover:text-[#02542d] transition-colors duration-200"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            handleUpdateProfile(e);
                            setShowProfileModal(false);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#02542d] mb-2">Display Name</label>
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
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-[#02542d] bg-[#FEFDF4] border border-[#C8C0C0] rounded-md hover:bg-[#FAF6E9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40] transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#02542d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40] transition-colors duration-200"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Update Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#FAF6E9] rounded-lg border border-[#C8C0C0] p-6 max-w-md w-full mx-4 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-[#02542d]">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-500 hover:text-[#02542d] transition-colors duration-200"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            handleUpdatePassword(e);
                            setShowPasswordModal(false);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#02542d] mb-2">New Password</label>
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
                                <label className="block text-sm font-medium text-[#02542d] mb-2">Confirm Password</label>
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
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-[#02542d] bg-[#FEFDF4] border border-[#C8C0C0] rounded-md hover:bg-[#FAF6E9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40] transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#02542d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40] transition-colors duration-200"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}; 