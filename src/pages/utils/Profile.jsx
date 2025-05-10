import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import { updatePassword, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Auth/firebase.init";
import { FaUser } from "react-icons/fa";

// Import profile components
import { ProfileHeader } from "./profiles/CommonComponents";
import VendorProfile from "./profiles/VendorProfile";
import NurseryWorkerProfile from "./profiles/NurseryWorkerProfile";
import SupplierProfile from "./profiles/SupplierProfile";

const Profile = () => {
    const { user, getUserData } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    console.log("Fetching user data for:", user.uid);
                    const data = await getUserData(user);
                    console.log("Fetched user data:", data);
                    setUserData(data);
                    setDisplayName(user.displayName || "");
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setError("Failed to load user data: " + error.message);
                    setLoading(false);
                }
            } else {
                console.log("No user found");
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user, getUserData]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await updateProfile(user, {
                displayName: displayName,
            });

            const userRef = doc(db, "user_data", user.uid);
            await updateDoc(userRef, {
                displayName: displayName,
            });

            setSuccess("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile: " + error.message);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            await updatePassword(user, newPassword);
            setSuccess("Password updated successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error updating password:", error);
            setError("Failed to update password: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEFDF4]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a5a40]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEFDF4]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#02542d] mb-4">Please log in to view your profile</h2>
                    <p className="text-gray-600">You need to be logged in to access this page.</p>
                </div>
            </div>
        );
    }

    const renderRoleSpecificProfile = () => {
        console.log("Current userData:", userData);
        console.log("Current role:", userData?.role);

        // Convert role to lowercase for case-insensitive comparison
        const role = userData?.role?.toLowerCase();

        switch (role) {
            case "vendor":
                return (
                    <VendorProfile
                        user={user}
                        userData={userData}
                        handleUpdateProfile={handleUpdateProfile}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        handleUpdatePassword={handleUpdatePassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                    />
                );
            case "admin":
                return (
                    <div className="space-y-6">
                        <ProfileHeader 
                            user={user} 
                            userData={userData} 
                            handleUpdateProfile={handleUpdateProfile}
                            displayName={displayName}
                            setDisplayName={setDisplayName}
                            handleUpdatePassword={handleUpdatePassword}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                        />
                    </div>
                );
            case "nurseryworker":
                return (
                    <NurseryWorkerProfile
                        user={user}
                        userData={userData}
                        handleUpdateProfile={handleUpdateProfile}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        handleUpdatePassword={handleUpdatePassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                    />
                );
            case "supplier":
                return (
                    <SupplierProfile
                        user={user}
                        userData={userData}
                        handleUpdateProfile={handleUpdateProfile}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        handleUpdatePassword={handleUpdatePassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                    />
                );
            default:
                return (
                    <div className="space-y-6">
                        <ProfileHeader 
                            user={user} 
                            userData={userData} 
                            handleUpdateProfile={handleUpdateProfile}
                            displayName={displayName}
                            setDisplayName={setDisplayName}
                            handleUpdatePassword={handleUpdatePassword}
                            newPassword={newPassword}
                            setNewPassword={setNewPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                        />
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Your role ({userData?.role || 'Not set'}) is not properly configured. Please contact an administrator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#FEFDF4] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#FEFDF4] shadow-lg rounded-lg border border-[#C8C0C0]">
                    <div className="px-6 py-5 border-b border-[#C8C0C0]">
                        <h3 className="text-2xl font-bold text-[#02542d]">Profile Settings</h3>
                        <p className="mt-1 text-base text-gray-600">Manage your account settings and preferences</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-400">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-400">
                            <p className="text-sm font-medium text-green-700">{success}</p>
                        </div>
                    )}

                    <div className="px-6 py-5">
                        {renderRoleSpecificProfile()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;