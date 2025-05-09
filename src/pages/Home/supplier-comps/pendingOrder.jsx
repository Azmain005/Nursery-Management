import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import Loader from "../../../components/Loader/Loader";

const PendingOrder = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const ordersPerPage = 16; // 4 rows * 4 cards per row

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const rawOrderSnapshot = await getDocs(collection(db, "raw_order"));
        const ordersData = rawOrderSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (!showSearchInput) {
      setSearchTerm("");
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const rawOrderSnapshot = await getDocs(collection(db, "raw_order"));
          const ordersData = rawOrderSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    } else if (searchTerm.trim() !== "") {
      const filteredOrders = orders.filter((order) =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setOrders(filteredOrders);
      setCurrentPage(1);
    }
  }, [searchTerm, showSearchInput]);

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setSearchTerm("");
      setOrders((prevOrders) => prevOrders);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, "raw_order", orderId));
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
      alert("Order canceled successfully!");
    } catch (error) {
      console.error("Error canceling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      await addDoc(collection(db, "raw_material"), {
        name: order.name,
        price: order.price,
        quantity: order.quantity,
        image: order.image,
      });
      await deleteDoc(doc(db, "raw_order", order.id));
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id));
      alert("Order confirmed successfully!");
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order. Please try again.");
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div
      className="p-6"
      style={{ backgroundColor: "#faf6e9", minHeight: "100vh" }}
    >
      <h1 className="text-2xl font-bold mb-4">Pending Orders</h1>

      {/* Search Bar */}
      <div className="flex gap-3 mb-5">
        <div className="flex gap-3 flex-1 border justify-between items-center h-[55px] bg-[#faf6e9] rounded-xl text-[#2c5c2c] px-4">
          <p className="text-xl font-semibold">Orders</p>
          <div className="flex items-center gap-2">
            {showSearchInput && (
              <input
                type="text"
                className="outline-none rounded-lg h-[40px] p-3 bg-[#faf6e9] border border-gray-300 transition-all w-60"
                placeholder="Search orders..."
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

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {currentOrders.map((order) => (
              <div
                key={order.id}
                className="border p-4 rounded-lg shadow-md bg-[#607b64] text-white flex flex-col"
              >
                <img
                  src={order.image || "https://via.placeholder.com/150"}
                  alt={order.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-white mb-1">
                  {order.name}
                </h3>
                <p className="text-sm text-white mb-1">Price: ${order.price}</p>
                <p className="text-sm text-white mb-4">
                  Quantity: {order.quantity}
                </p>
                <div className="flex justify-between mt-auto">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmOrder(order)}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
};

export default PendingOrder;
