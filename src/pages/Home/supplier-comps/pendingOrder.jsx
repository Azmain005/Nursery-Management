import { useState, useEffect, useContext } from "react";
import { IoIosSearch } from "react-icons/io";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import Loader from "../../../components/Loader/Loader";
import { AuthContext } from "../../../providers/AuthProvider";
import { Check, DollarSign, MapPin, Package, User, X } from "lucide-react";

const PendingOrder = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [totalOrderValue, setTotalOrderValue] = useState(0);
  const [workerNames, setWorkerNames] = useState({});
  const ordersPerPage = 6; // 2 rows * 3 cards per row

  // Colors from the requirements (matching MarketPlace)
  const colors = {
    background: "#faf6e9",
    primary: "#3e5931",
    text: "#02542d",
    accent: "#6a994e",
    lightAccent: "#a7c957",
  };

  useEffect(() => {
    if (!user || !user.uid) return;
    
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Get all nursery_orders documents
        const nurseryOrdersRef = collection(db, "nursery_orders");
        const ordersSnapshot = await getDocs(nurseryOrdersRef);
        
        if (ordersSnapshot.empty) {
          setOrders([]);
          setTotalOrderValue(0);
          setIsLoading(false);
          return;
        }

        const processedOrders = [];
        let totalValue = 0;

        // Process each document in nursery_orders
        for (const orderDoc of ordersSnapshot.docs) {
          const orderData = orderDoc.data();
          
          // Each document contains an 'items' array with ordered materials
          const items = orderData.items || [];
          
          // Process each item in the items array
          for (const item of items) {
            // Only process items where supplierId matches current logged-in user
            if (item.supplierId === user.uid) {
              try {
                // Fetch worker data
                let workerName = "Unknown Worker";
                let workerAddress = "Address not available";
                let workerData = null;
                
                if (orderData.workerId) {
                  const workerDocRef = doc(db, "user_data", orderData.workerId);
                  const workerDoc = await getDoc(workerDocRef);
                  
                  if (workerDoc.exists()) {
                    workerData = workerDoc.data();
                    workerName = workerData.displayName || workerData.firstName || "Unknown Worker";
                    
                    // Format address if available
                    const address = workerData.address || {};
                    workerAddress = address 
                      ? `${address.street || ""}, ${address.city || ""}, ${address.state || ""}`
                      : "Address not available";
                      
                    // Save in state for future reference
                    setWorkerNames(prev => ({
                      ...prev,
                      [orderData.workerId]: workerName
                    }));
                  }
                }
                
                // Get worker info from nested worker object if available
                if (orderData.worker) {
                  const worker = orderData.worker;
                  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`;
                  workerName = fullName.trim() || worker.email || workerName;
                  workerAddress = worker.address || workerAddress;
                }

                // Calculate item total
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                totalValue += itemTotal;
                
                // Create processed order object
                processedOrders.push({
                  id: orderDoc.id,
                  itemId: item.id,
                  name: item.name || "Unknown Material",
                  price: item.price || 0,
                  quantity: item.quantity || 0,
                  image: item.image || "https://via.placeholder.com/150",
                  description: item.description || "",
                  workerId: orderData.workerId,
                  workerName,
                  workerAddress,
                  supplierId: item.supplierId,
                  supplierName: item.supplierName || "Unknown Supplier",
                  subtotal: itemTotal,
                  total: itemTotal,
                  addedAt: item.addedAt || orderData.createdAt || "Unknown date"
                });
              } catch (error) {
                console.error("Error processing order item:", error);
              }
            }
          }
        }
        
        setOrders(processedOrders);
        setTotalOrderValue(totalValue);
        
        // Fetch completed orders count from supplier_confirmed_orders collection
        const confirmedOrdersRef = collection(db, "supplier_confirmed_orders");
        const supplierQuery = query(confirmedOrdersRef, 
          where("supplierInfo.supplierId", "==", user.uid)
        );
        const confirmedOrdersSnapshot = await getDocs(supplierQuery);
        setCompletedOrdersCount(confirmedOrdersSnapshot.size);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchTerm("");
    }
  };

  // Filter orders based on search term
  const filteredOrders = searchTerm.trim() === "" 
    ? orders 
    : orders.filter(order => 
        order.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleCancelOrder = async (order) => {
    try {
      const batch = writeBatch(db);
      
      // Get the document first to access the items array
      const orderDocRef = doc(db, "nursery_orders", order.id);
      const orderDoc = await getDoc(orderDocRef);
      
      if (!orderDoc.exists()) {
        alert("Order no longer exists!");
        return;
      }
      
      const orderData = orderDoc.data();
      const items = orderData.items || [];
      
      // Filter out the item being canceled
      const updatedItems = items.filter(item => item.id !== order.itemId);
      
      if (updatedItems.length === 0) {
        // If no items left, delete the whole document
        batch.delete(orderDocRef);
      } else {
        // Update the document with the remaining items
        batch.update(orderDocRef, { items: updatedItems });
      }
      
      await batch.commit();
      
      // Update local state
      setOrders(orders.filter(o => !(o.id === order.id && o.itemId === order.itemId)));
      setTotalOrderValue(prev => prev - order.subtotal);
      
      alert("Order canceled successfully!");
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      // Get the original order document to access the document-level workerId
      const orderDocRef = doc(db, "nursery_orders", order.id);
      const orderDocSnap = await getDoc(orderDocRef);
      
      if (!orderDocSnap.exists()) {
        alert("Order document not found!");
        return;
      }
      
      const orderData = orderDocSnap.data();
      
      // Extract workerId from the document level
      const documentWorkerId = orderData.workerId || "";
      
      // Create a new document in supplier_confirmed_orders
      await addDoc(collection(db, "supplier_confirmed_orders"), {
        materialInfo: {
          name: order.name,
          price: order.price,
          quantity: order.quantity,
          image: order.image || "",
          materialId: order.itemId || ""
        },
        supplierInfo: {
          supplierId: user.uid,
          supplierName: user.displayName || ""
        },
        workerInfo: {
          // Use the document-level workerId
          workerId: documentWorkerId,
          // Include the worker name
          workerName: order.workerName || "Unknown Worker"
        },
        status: "confirmed",
        createdAt: serverTimestamp()
      });
      
      // Update the original order document
      const batch = writeBatch(db);
      const items = orderData.items || [];
      const updatedItems = items.filter(item => item.id !== order.itemId);
      
      if (updatedItems.length === 0) {
        batch.delete(orderDocRef);
      } else {
        batch.update(orderDocRef, { items: updatedItems });
      }
      
      await batch.commit();
      
      // Update local state
      setOrders(orders.filter(o => !(o.id === order.id && o.itemId === order.itemId)));
      setTotalOrderValue(prev => prev - order.subtotal);
      setCompletedOrdersCount(prev => prev + 1);
      
      alert(`Order confirmed successfully!`);
    } catch (error) {
      console.error("Error confirming order:", error);
      alert(`Failed to confirm order: ${error.message}`);
    }
  };

  const formatCurrency = (value) => {
    return value?.toFixed(2) || "0.00";
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-center" style={{ color: colors.primary }}>
          Pending Orders Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#fefaef] rounded-lg shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: colors.lightAccent }}>
              <Package size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Pending Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>

          <div className="bg-[#fefaef] rounded-lg shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: colors.lightAccent }}>
              <DollarSign size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Pending Orders Value</p>
              <p className="text-2xl font-bold">${formatCurrency(totalOrderValue)}</p>
            </div>
          </div>

          <div className="bg-[#fefaef] rounded-lg shadow-md p-6 flex items-center">
            <div className="p-3 rounded-full mr-4" style={{ backgroundColor: colors.lightAccent }}>
              <Package size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-sm font-medium opacity-70">Completed Orders</p>
              <p className="text-2xl font-bold">{completedOrdersCount}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-5">
          <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
            <p className="text-xl font-semibold">Orders</p>
            <div className="flex items-center gap-2">
              {showSearchInput && (
                <input
                  type="text"
                  className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                  placeholder="Search by worker or material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              )}
              <IoIosSearch
                className="text-3xl font-bold cursor-pointer"
                onClick={handleSearchClick}
              />
            </div>
          </div>
        </div>

        {/* Pending Orders List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.primary }}>
            Pending Orders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <div
                  key={`${order.id}-${order.itemId}`}
                  className="bg-[#fefaef] rounded-lg shadow-md overflow-hidden"
                >
                  <div
                    className="p-5"
                    style={{ borderBottom: `2px solid ${colors.lightAccent}` }}
                  >
                    <div className="flex items-center mb-3">
                      <User
                        size={20}
                        className="mr-2"
                        style={{ color: colors.primary }}
                      />
                      <h3 className="font-semibold text-lg">{order.workerName}</h3>
                    </div>
                    
                    <div className="flex items-start mb-3">
                      <MapPin
                        size={20}
                        className="mr-2 mt-1 flex-shrink-0"
                        style={{ color: colors.primary }}
                      />
                      <p className="text-sm opacity-80">{order.workerAddress}</p>
                    </div>

                    <div className="mt-4">
                      <p className="font-medium mb-2">Ordered Material:</p>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {order.image && (
                            <img
                              src={order.image}
                              alt={order.name}
                              className="w-12 h-12 rounded-full mr-2 object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{order.name}</p>
                            <p className="text-sm opacity-70">Qty: {order.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">${formatCurrency(order.price)}</span>
                      </div>
                      <div className="mt-3 pt-2 border-t flex justify-between font-bold">
                        <span>Total</span>
                        <span>${formatCurrency(order.subtotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex justify-between">
                    <button
                      onClick={() => handleCancelOrder(order)}
                      className="px-4 py-2 rounded-md flex items-center font-medium"
                      style={{ backgroundColor: "#f8d7da", color: "#721c24" }}
                    >
                      <X size={18} className="mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmOrder(order)}
                      className="px-4 py-2 rounded-md flex items-center font-medium text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Check size={18} className="mr-1" />
                      Confirm
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-lg opacity-70">No pending orders at the moment.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md ${
                      page === currentPage
                        ? "bg-[#607b64] text-white"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOrder;
