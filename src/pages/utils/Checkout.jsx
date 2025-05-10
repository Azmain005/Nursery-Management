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
    firstName: "",
    lastName: "",
    address: "",
    mobile: "",
    email: "",
    city: "",
    zone: "Dhaka City",
    comment: "",
    payment: "cod",
    delivery: "home",
    voucher: "",
    coupon: "",
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
        items: cartItems.map((i) => ({
          plantId: i.plantId,
          image: i.image,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
        })),
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
          {/* Order Overview */}
          <div className="bg-[#fefaef] rounded-lg shadow p-6">
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                4
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
                    <td className="p-2">{i.name}</td>
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
