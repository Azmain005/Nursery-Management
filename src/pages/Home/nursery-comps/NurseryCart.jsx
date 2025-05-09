import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../Auth/firebase.init";
import { IoMdRefresh, IoMdClose } from "react-icons/io";
import EmptyCartImage from "../../../assets/empty-cart.png";

const NurseryCart = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "nursery_cart"));
        const items = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.userId === user.uid);
        setCartItems(items);

        const initQuantities = {};
        items.forEach((item) => {
          initQuantities[item.id] = item.quantity;
        });
        setQuantities(initQuantities);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleQtyChange = (id, delta) => {
    setQuantities((q) => ({
      ...q,
      [id]: Math.max(1, (q[id] || 1) + delta),
    }));
  };

  const handleUpdate = async (id) => {
    const newQty = quantities[id];
    const current = cartItems.find((item) => item.id === id)?.quantity;
    if (newQty && newQty !== current) {
      await updateDoc(doc(db, "nursery_cart", id), {
        quantity: newQty,
      });
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await deleteDoc(doc(db, "nursery_cart", itemId));
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 flex flex-col p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">
          Nursery Cart
        </h1>

        {isLoading ? (
          <p>Loading...</p>
        ) : cartItems.length === 0 ? (
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
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg p-4 shadow">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[#607b64] border-b">
                  <th className="p-2">Image</th>
                  <th className="p-2">Product Name</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Unit Price</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b">
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
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={quantities[item.id] || item.quantity}
                          readOnly
                          className="w-12 text-center border rounded"
                        />
                        <button
                          onClick={() => handleQtyChange(item.id, +1)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-2 text-[#2c5c2c]">${item.price}</td>
                    <td className="p-2 text-[#2c5c2c]">
                      ${item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="bg-[#607b64] text-white p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Sub-Total:</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${subtotal}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button className="btn bg-[#02542d] text-white">
                Continue Shopping
              </button>
              <button className="btn bg-[#02542d] text-white">
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
