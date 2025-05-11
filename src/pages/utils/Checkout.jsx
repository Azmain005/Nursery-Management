// src/pages/utils/Checkout.jsx
import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { db } from "../../Auth/firebase.init";
import { AuthContext } from "../../providers/AuthProvider";
import { useCart } from "../../providers/CartProvider";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useCart();
  const { state } = useLocation();
  const cartItems = state?.cartItems || [];
  const navigate = useNavigate();

  // form state for customer fields
  const [form, setForm] = useState({

    delivery: "home",
    agree: false,
  });

  // compute your totals
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge =
    form.delivery === "home" ? 60 : form.delivery === "store" ? 0 : 150;
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        userId: user.uid,
        deliveryOption: form.delivery,
        deliveryCharge: deliveryCharge,
        items: cartItems.map((i) => ({
          plantId: i.plantId,
          image: i.image,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
          
      })),
      totalAmount: total,
      };

      // write to Firestore
      await addDoc(collection(db, "ordered"), orderData);

      // wipe out the cart
      await clearCart();

      // go back to vendor
      navigate("/vendor");
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Could not place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Options */}
          <div className="bg-[#fefaef] rounded-lg shadow p-6">
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                
              </span>
              Delivery Options
            </h2>
            <div>
              <label htmlFor="delivery" className="block text-gray-700 text-sm font-bold mb-2">
                Select Delivery Option:
              </label>
              <select
                id="delivery"
                name="delivery"
                value={form.delivery}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="home">Home Delivery ($60)</option>
                <option value="store">Pick up from Store (Free)</option>
                <option value="express">Express Delivery ($150)</option>
              </select>
            </div>
          </div>

          {/* Order Overview */}
          <div className="bg-[#fefaef] rounded-lg shadow p-6">
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                
              </span>
              Order Overview
            </h2>
            <table className="w-full text-[#2c5c2c]">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Product Name</th>
                  <th className="p-2 text-left">Price × Qty</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((i) => (
                  <tr key={i.id}>
                    <td className="p-2 flex items-center">
                      {i.image && (
                        <img
                          src={i.image}
                          alt={i.name}
                          className="w-10 h-10 rounded-full mr-2 object-cover"
                        />
                      )}
                      {i.name}
                    </td>
                    {/* <td className="p-2">{i.name}</td> */}
                    <td className="p-2">
                      ${i.price} × {i.quantity}
                    </td>
                    <td className="p-2">${i.price * i.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end space-x-4 text-[#2c5c2c]">
              <div>Sub-Total: ${subtotal}</div>
              <div>Delivery: ${deliveryCharge}</div>
              <div className="font-bold">Total: ${total}</div>
            </div>
          </div>

          {/* Terms & Confirm */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
              required
            />
            <label className="text-gray-600 text-sm">
              I have read and agree to the{" "}
              <NavLink to="/terms" className="text-[#02542d] underline">
                Terms and Conditions
              </NavLink>
              ,{" "}
              <NavLink to="/privacy" className="text-[#02542d] underline">
                Privacy Policy
              </NavLink>{" "}
              and{" "}
              <NavLink to="/refund" className="text-[#02542d] underline">
                Refund and Return Policy
              </NavLink>
            </label>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="btn bg-[#02542d] text-white"
              disabled={!form.agree}
            >
              Confirm Order
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
