import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { FaUser, FaMapMarkerAlt, FaClipboardList, FaBox, FaTruck } from "react-icons/fa";
import { ProfileHeader } from "./CommonComponents";

const VendorProfile = ({ user, userData, handleUpdateProfile, displayName, setDisplayName, handleUpdatePassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword }) => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [address, setAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [stats, setStats] = useState({
        totalMaterials: 0,
        lowStock: 0,
        outOfStock: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch order history
                const ordersRef = collection(db, "orders");
                const ordersSnapshot = await getDocs(ordersRef);
                const orders = [];
                ordersSnapshot.forEach(doc => {
                    if (doc.data().userId === user.uid) {
                        orders.push({ id: doc.id, ...doc.data() });
                    }
                });
                setOrderHistory(orders);

                // Fetch address if it exists
                if (userData?.address) {
                    setAddress(userData.address);
                }

                // Fetch stats
                const statsRef = collection(db, "stats");
                const statsSnapshot = await getDocs(statsRef);
                const statsData = statsSnapshot.docs[0].data();
                setStats(statsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        
        fetchData();
    }, [user.uid, userData]);

    const handleAddressUpdate = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, "user_data", user.uid);
            await updateDoc(userRef, {
                address: address
            });
            setIsEditingAddress(false);
        } catch (error) {
            console.error("Error updating address:", error);
        }
    };

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
            
            {/* Address Section */}
            <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-[#02542d]">Address Details</h4>
                    <button
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[#3a5a40] hover:text-[#02542d] font-medium"
                    >
                        {isEditingAddress ? "Cancel" : "Edit Address"}
                    </button>
                </div>

                {isEditingAddress ? (
                    <form onSubmit={handleAddressUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Street Address</label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => setAddress({...address, street: e.target.value})}
                                    className="mt-1 block w-full p-2 border border-[#C8C0C0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] bg-[#FEFDF4]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) => setAddress({...address, city: e.target.value})}
                                    className="mt-1 block w-full p-2 border border-[#C8C0C0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] bg-[#FEFDF4]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    value={address.state}
                                    onChange={(e) => setAddress({...address, state: e.target.value})}
                                    className="mt-1 block w-full p-2 border border-[#C8C0C0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] bg-[#FEFDF4]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                                <input
                                    type="text"
                                    value={address.zipCode}
                                    onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                                    className="mt-1 block w-full p-2 border border-[#C8C0C0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] bg-[#FEFDF4]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    value={address.country}
                                    onChange={(e) => setAddress({...address, country: e.target.value})}
                                    className="mt-1 block w-full p-2 border border-[#C8C0C0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#3a5a40] focus:border-[#3a5a40] bg-[#FEFDF4]"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full md:w-auto px-4 py-2 bg-[#3a5a40] text-white rounded-md hover:bg-[#02542d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40]"
                        >
                            Save Address
                        </button>
                    </form>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-start">
                            <FaMapMarkerAlt className="h-5 w-5 text-[#3a5a40] mt-1 mr-2" />
                            <div>
                                <p className="text-gray-900">{address.street}</p>
                                <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                                <p className="text-gray-600">{address.country}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Order History */}
            <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                <h4 className="text-xl font-semibold text-[#02542d] mb-4">Order History</h4>
                {orderHistory.length > 0 ? (
                    <div className="space-y-4">
                        {orderHistory.map(order => (
                            <div key={order.id} className="border-b border-[#C8C0C0] pb-4 last:border-b-0">
                                <p className="font-medium text-[#02542d]">Order #{order.id}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">Status: {order.status}</p>
                                {order.items && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-600">Items:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                            {order.items.map((item, index) => (
                                                <li key={index}>{item.name} - Quantity: {item.quantity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No orders yet</p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaBox className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Materials</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{stats.totalMaterials}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaBox className="h-8 w-8 text-[#3a5a40]" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-semibold text-[#02542d]">{stats.lowStock}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                    <div className="flex items-center">
                        <FaTruck className="h-8 w-8 text-[#3a5a40]" />
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

export default VendorProfile; 