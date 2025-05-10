import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { db } from "../../../Auth/firebase.init";
import EmptyCartImage from "../../../assets/empty-cart.png";
import Loader from "../../../components/Loader/Loader";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNurseryCart } from "./NurseryCartProvider";

const NurseryCart = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, removeFromCart, updateQuantity } = useNurseryCart();
  const [quantities, setQuantities] = useState({});
  const [maxQuantities, setMaxQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [localCartItems, setLocalCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "nursery_cart"));
        const items = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.workerId === user.uid); // Filter by workerId instead of userId
        setLocalCartItems(items);

        // Initialize quantities to 1 and store max values separately
        const initQuantities = {};
        const maxQtys = {};
        items.forEach((item) => {
          initQuantities[item.id] = item.quantity || 1; // Use existing cart quantity
          maxQtys[item.id] = item.maxQuantity || item.quantity || 1; // First try maxQuantity, then fallback
        });
        setQuantities(initQuantities);
        setMaxQuantities(maxQtys);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.uid) {
      fetchCartItems();
    }
  }, [user]);

  const handleQtyChange = async (id, delta) => {
    const maxQty = maxQuantities[id] || 1;
    const newQty = Math.min(maxQty, Math.max(1, (quantities[id] || 1) + delta));

    setQuantities((prev) => ({
      ...prev,
      [id]: newQty,
    }));

    try {
      const itemRef = doc(db, "nursery_cart", id);
      await updateDoc(itemRef, { quantity: newQty });

      // Update local state
      setLocalCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleQtyInputChange = (id, value) => {
    // Parse input value to number, default to 1 if NaN
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = 1;

    // Ensure value is within valid range (1 to max)
    const maxQty = maxQuantities[id] || 1;
    numValue = Math.min(maxQty, Math.max(1, numValue));

    setQuantities((prev) => ({
      ...prev,
      [id]: numValue,
    }));
  };

  const handleQtyInputBlur = async (id) => {
    const newQty = quantities[id] || 1;

    try {
      const itemRef = doc(db, "nursery_cart", id);
      await updateDoc(itemRef, { quantity: newQty });

      // Update local state
      setLocalCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      // Only delete from nursery_cart collection without affecting Material_for_sell
      await deleteDoc(doc(db, "nursery_cart", itemId));

      // Update local state
      setLocalCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const calculateTotal = () => {
    return localCartItems.reduce((sum, item) => {
      const qty = quantities[item.id] || 1;
      return sum + item.price * qty;
    }, 0);
  };

  const handleConfirmOrder = async () => {
    try {
      // Check if all items have sufficient stock before proceeding
      for (const cartItem of localCartItems) {
        const matRef = doc(db, "Material_for_sell", cartItem.materialId);
        const matSnap = await getDoc(matRef);

        if (!matSnap.exists()) {
          throw new Error(
            `Material "${cartItem.name}" is no longer available.`
          );
        }

        const currentStock = matSnap.data()?.quantity ?? 0;
        const selectedQuantity = quantities[cartItem.id] || 1;

        if (currentStock < selectedQuantity) {
          throw new Error(
            `Not enough stock for "${cartItem.name}". Only ${currentStock} left.`
          );
        }
      }

      // Create a new array with updated quantities for checkout
      const checkoutItems = localCartItems.map((item) => {
        // Create a new object to avoid modifying the original item
        return {
          ...item,
          quantity: quantities[item.id] || 1, // Use the selected quantity (defaulting to 1)
        };
      });

      // Store MODIFIED cart items in session storage for checkout
      sessionStorage.setItem("nurseryCartItems", JSON.stringify(checkoutItems));

      // Navigate to checkout
      navigate("/nurserycheckout");
    } catch (err) {
      console.error("Failed to proceed to checkout:", err);
      alert(err.message || "Could not proceed to checkout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 flex flex-col p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">
          Nursery Cart
        </h1>

        {isLoading ? (
          <Loader />
        ) : localCartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <img
              src={EmptyCartImage}
              alt="Your cart is empty"
              className="w-48 h-48 mb-6"
            />
            <h2 className="text-2xl font-bold text-[#2c5c2c] mb-2">Oops!</h2>
            <p className="text-lg text-gray-600 mb-4">
              Your nursery cart is empty!
            </p>
            <NavLink
              to="/nurseryWorker/order-raw-material"
              className="btn bg-[#02542d] text-white"
            >
              Order Material
            </NavLink>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[#faf6e9] rounded-lg p-4 shadow">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[#607b64]">
                  <th className="p-2">Image</th>
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Unit Price</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Supplier</th>
                  <th className="p-2 text-center">Remove</th>
                </tr>
                <tr>
                  <td
                    colSpan={7}
                    style={{ height: "2px", background: "#02542d", padding: 0 }}
                  ></td>
                </tr>
              </thead>
              <tbody>
                {localCartItems.map((item, idx) => (
                  <>
                    <tr key={item.id}>
                      <td className="p-2">
                        <img
                          src={item.image || "https://via.placeholder.com/150"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-2 text-[#2c5c2c]">{item.name}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQtyChange(item.id, -1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#607b64] text-white hover:bg-[#4a5e4a]"
                          >
                            –
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={maxQuantities[item.id] || 1}
                            value={quantities[item.id] || 1}
                            onChange={(e) =>
                              handleQtyInputChange(item.id, e.target.value)
                            }
                            onBlur={() => handleQtyInputBlur(item.id)}
                            className="w-16 text-center border-2 border-[#607b64] rounded bg-[#faf6e9] p-1 focus:outline-none focus:border-[#3e5931]"
                          />
                          <button
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#607b64] text-white hover:bg-[#4a5e4a]"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Available: {maxQuantities[item.id] || 1}
                        </div>
                      </td>
                      <td className="p-2 text-[#2c5c2c] font-bold">
                        ${item.price}
                      </td>
                      <td className="p-2 text-[#2c5c2c] font-bold">
                        ${item.price * (quantities[item.id] || 1)}
                      </td>
                      <td className="p-2 text-[#2c5c2c]">
                        {item.supplierName || "Unknown Supplier"}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 flex justify-center items-center mx-auto"
                          aria-label="Remove from cart"
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                    <tr key={`sep-${item.id}`}>
                      <td
                        colSpan={7}
                        style={{
                          height: "2px",
                          background: "#02542d",
                          padding: 0,
                        }}
                      ></td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex justify-end">
              <div className="bg-[#607b64] text-white p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Sub-Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <NavLink
                to="/nurseryWorker/order-raw-material"
                className="btn bg-[#02542d] text-white"
              >
                Order More
              </NavLink>
              <button
                onClick={handleConfirmOrder}
                className="btn bg-[#02542d] text-white"
              >
                Confirm Order
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NurseryCart;
