import { useState, useEffect, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { FaUser, FaLeaf, FaShoppingCart, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { ProfileHeader } from "./CommonComponents";
import { AuthContext } from "../../../providers/AuthProvider";

const NurseryWorkerProfile = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => {
    const { getPlantsFromInventory } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalPlants: 0,
        lowStock: 0,
        outOfStock: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const querySnapshot = await getPlantsFromInventory();
                const inventoryPlants = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log("Inventory plants:", inventoryPlants);
                
                const stats = {
                    totalPlants: inventoryPlants.length,
                    lowStock: 0,
                    outOfStock: 0
                };
                
                inventoryPlants.forEach(plant => {
                    if (plant.stock < 5) {
                        stats.lowStock++;
                    }
                    if (plant.stock === 0) {
                        stats.outOfStock++;
                    }
                });
                
                console.log("Final stats:", stats);
                setStats(stats);
            } catch (error) {
                console.error("Error fetching plant stats:", error);
            }
        };
        
        fetchStats();
    }, [getPlantsFromInventory]);

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
                            <p className="text-sm font-medium text-gray-600">Total Plants in Inventory</p>
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