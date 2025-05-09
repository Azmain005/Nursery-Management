// src/pages/utils/Cart.jsx
import { doc, runTransaction, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { db } from "../../Auth/firebase.init";
import EmptyCartImage from "../../assets/empty-cart.png";
import { useCart } from "../../providers/CartProvider";

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  // Initialize local quantity state from cartItems
  useEffect(() => {
    const init = {};
    cartItems.forEach((item) => {
      init[item.id] = item.quantity;
    });
    setQuantities(init);
  }, [cartItems]);

  // Handles +/- clicks: optimistically update UI and Firestore
  const handleQtyChange = async (id, delta) => {
    const newQty = Math.max(1, (quantities[id] || 1) + delta);
    setQuantities((q) => ({ ...q, [id]: newQty }));

    try {
      await updateDoc(doc(db, "cart", id), { quantity: newQty });
      // onSnapshot will pick up the change and sync cartItems
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setQuantities((q) => ({
        ...q,
        [id]: cartItems.find((i) => i.id === id)?.quantity || 1,
      }));
      alert("Couldn’t update quantity. Please try again.");
    }
  };

  // Compute subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Confirm Order: decrement inventory stock then navigate to checkout
  const handleConfirmOrder = async () => {
    try {
      await Promise.all(
        cartItems.map((cartLine) => {
          const invRef = doc(db, "inventory", cartLine.plantId);
          return runTransaction(db, async (tx) => {
            const invSnap = await tx.get(invRef);
            const currentStock = invSnap.data()?.stock ?? 0;
            if (currentStock < cartLine.quantity) {
              throw new Error(
                `Not enough stock for "${cartLine.name}". Only ${currentStock} left.`
              );
            }
            tx.update(invRef, { stock: currentStock - cartLine.quantity });
          });
        })
      );
      // pass the confirmed lines into checkout
      navigate("/checkout", { state: { cartItems } });
    } catch (err) {
      console.error("Failed to confirm order:", err);
      alert(err.message || "Could not confirm order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 flex flex-col p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <img
              src={EmptyCartImage}
              alt="Your cart is empty"
              className="w-48 h-48 mb-6"
            />
            <h2 className="text-2xl font-bold text-[#2c5c2c] mb-2">Oops!</h2>
            <p className="text-lg text-gray-600 mb-4">
              Your shopping cart is empty!
            </p>
            <NavLink to="/" className="btn bg-[#02542d] text-white">
              Continue Shopping
            </NavLink>
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
                        src={item.image}
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
                          –
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
                        <button
                          onClick={() => removeFromCart(item)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoMdClose />
                        </button>
                      </div>
                    </td>
                    <td className="p-2 text-[#2c5c2c]">৳{item.price}</td>
                    <td className="p-2 text-[#2c5c2c]">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <div className="bg-[#607b64] text-white p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Sub-Total:</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>৳{subtotal}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <NavLink to="/" className="btn bg-[#02542d] text-white">
                Continue Shopping
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

export default Cart;