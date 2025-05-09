import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { FaUser, FaStore, FaShoppingCart } from "react-icons/fa";
import { ProfileHeader } from "./CommonComponents";

const AdminProfile = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => {
    const [systemStats, setSystemStats] = useState({
        totalUsers: 0,
        totalVendors: 0,
        totalOrders: 0
    });

    useEffect(() => {
        const fetchSystemStats = async () => {
            const usersRef = collection(db, "user_data");
            const ordersRef = collection(db, "orders");
            
            const [usersSnapshot, ordersSnapshot] = await Promise.all([
                getDocs(usersRef),
                getDocs(ordersRef)
            ]);
            
            const stats = {
                totalUsers: 0,
                totalVendors: 0,
                totalOrders: ordersSnapshot.size
            };
            
            usersSnapshot.forEach(doc => {
                stats.totalUsers++;
                if (doc.data().role === "Vendor") {
                    stats.totalVendors++;
                }
            });
            
            setSystemStats(stats);
        };
        
        fetchSystemStats();
    }, []);

    return (
        <div className="space-y-6 bg-[#FEFDF4] min-h-screen w-full">
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
            
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaUser className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{systemStats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaStore className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{systemStats.totalVendors}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaShoppingCart className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{systemStats.totalOrders}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile; 