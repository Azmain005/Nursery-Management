import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { FaUser, FaLeaf, FaShoppingCart, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { ProfileHeader } from "./CommonComponents";

const NurseryWorkerProfile = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => {
    const [stats, setStats] = useState({
        totalPlants: 0,
        lowStock: 0,
        outOfStock: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const plantsRef = collection(db, "plants");
            const plantsSnapshot = await getDocs(plantsRef);
            
            const stats = {
                totalPlants: 0,
                lowStock: 0,
                outOfStock: 0
            };
            
            plantsSnapshot.forEach(doc => {
                const plant = doc.data();
                stats.totalPlants++;
                if (plant.stock < 5) {
                    stats.lowStock++;
                }
                if (plant.stock === 0) {
                    stats.outOfStock++;
                }
            });
            
            setStats(stats);
        };
        
        fetchStats();
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
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaLeaf className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Plants</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{stats.totalPlants}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaTimes className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{stats.outOfStock}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NurseryWorkerProfile; 