import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { FaUser, FaMapMarkerAlt } from "react-icons/fa";
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
    const [originalAddress, setOriginalAddress] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orders = [];
                
                // Fetch all user data for names
                const userDataRef = collection(db, "user_data");
                const userDataSnapshot = await getDocs(userDataRef);
                const userDataMap = {};
                userDataSnapshot.forEach(doc => {
                    userDataMap[doc.id] = doc.data();
                });
                console.log("SHow data", userDataMap);


                // Fetch from confirmed collection
                const confirmedRef = collection(db, "confirmed");
                const confirmedSnapshot = await getDocs(confirmedRef);
                
                confirmedSnapshot.forEach(doc => {
                    const confirmedData = doc.data();
                    if (confirmedData.userId === user.uid) {
                        const buyerData = userDataMap[confirmedData.userId];
                        
                        orders.push({ 
                            id: doc.id, 
                            ...confirmedData,
                            date: confirmedData.confirmedAt?.toDate() || confirmedData.timestamp?.toDate() || new Date(),
                            buyerName: confirmedData.customerName || buyerData?.displayName || 'Unknown User',
                            status: 'Confirmed'
                        });
                    }
                });

                // Fetch from ordered collection
                const orderedRef = collection(db, "ordered");
                const orderedSnapshot = await getDocs(orderedRef);
                
                orderedSnapshot.forEach(doc => {
                    const orderedData = doc.data();
                    if (orderedData.userId === user.uid) {
                        const buyerData = userDataMap[orderedData.userId];
                        const address = `${buyerData.address.street}, ${buyerData.address.city}, ${buyerData.address.state}, ${buyerData.address.country}, ${buyerData.address.zipCode}`;
                

                        
                        orders.push({ 
                            id: doc.id, 
                            ...orderedData, address,
                            date: orderedData.timestamp?.toDate() || new Date(),
                            buyerName: orderedData.customerName || buyerData?.displayName || 'Unknown User',
                            status: 'Pending'
                        });
                    }
                });
                // Sort orders by date, most recent first
                orders.sort((a, b) => b.date - a.date);
                setOrderHistory(orders);

                // Fetch address if it exists
                if (userData?.address) {
                    setAddress(userData.address);
                    setOriginalAddress(userData.address);
                }
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
            setOriginalAddress(address);
            setIsEditingAddress(false);
        } catch (error) {
            console.error("Error updating address:", error);
        }
    };

    const handleCancelEdit = () => {
        setAddress(originalAddress);
        setIsEditingAddress(false);
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
                        onClick={() => isEditingAddress ? handleCancelEdit() : setIsEditingAddress(true)}
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
{/* Order History */}
            <div className="bg-[#FAF6E9] p-6 rounded-lg border border-[#C8C0C0]">
                <h4 className="text-xl font-semibold text-[#02542d] mb-4">Order History</h4>
                {orderHistory.length > 0 ? (
                    <div className="space-y-4">
                        {orderHistory.map(order => (
                            console.log("order show",order),
                            <div key={order.id} className="border-b border-[#C8C0C0] pb-4 last:border-b-0">
                                <div className="space-y-2">
                                    <p className="font-medium text-[#02542d]">Order #{order.id}</p>
                                    <p className="text-sm text-gray-600">Date: {order.date.toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-600">Status: {order.status}</p>
                                    <p className="text-sm text-gray-600">Buyer: {order.buyerName}</p>
                                    <p className="text-sm text-gray-600">Address: {order.address}</p>
                                    
                                    {/* Items list */}
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700">Items:</p>
                                        {order.items?.map((item, index) => {
                                            const unitPrice = Number(item.unitPrice) || 0;
                                            const quantity = Number(item.quantity) || 0;
                                            const itemTotal = unitPrice * quantity;
                                            
                                            return (
                                                <div key={index} className="flex items-start mt-2">
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name} 
                                                        className="w-12 h-12 object-cover rounded mr-3"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-800">{item.name}</p>
                                                        <p className="text-xs text-gray-600">
                                                            {quantity} × ${unitPrice.toFixed(2)} = ${itemTotal.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <p className="text-sm font-medium text-gray-700 mt-2">
                                        Total Amount: ${order.totalAmount 
                                            ? Number(order.totalAmount).toFixed(2) 
                                            : (order.items?.reduce((sum, item) => {
                                                const price = Number(item.unitPrice) || 0;
                                                const qty = Number(item.quantity) || 0;
                                                return sum + (price * qty);
                                            }, 0).toFixed(2))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No orders yet</p>
                )}
            </div>
        </div>
    );
};

export default VendorProfile;