import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNurseryCart } from './NurseryCartProvider';
import { db } from '../../../Auth/firebase.init';
import { collection, addDoc } from 'firebase/firestore';

const NurseryCheckout = () => {
  const { cartItems } = useNurseryCart();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    mobile: '',
    email: '',
    comment: '',
    agree: false
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge = 0; // For nursery workers, assume no delivery charge
  const total = subtotal + deliveryCharge;

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'nursery_orders'), {
        worker: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          mobile: form.mobile,
          email: form.email,
          comment: form.comment,
        },
        items: cartItems,
        subtotal,
        total,
        createdAt: new Date().toISOString(),
      });
      setOrderPlaced(true);
    } catch (err) {
      alert('Failed to place order. Please try again.');
      console.error(err);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#faf6e9] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">Order Confirmed!</h1>
        <p className="mb-4">Thank you for your order. Your request has been submitted to the nursery management.</p>
        <NavLink to="/nurserycart" className="btn bg-[#02542d] text-white">Back to Cart</NavLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">Nursery Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'rgb(254,250,244)' }}>
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">1</span>
              Worker Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name*" className="input w-full" required />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name*" className="input w-full" required />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address*" className="input w-full md:col-span-2" required />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Telephone*" className="input w-full" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-Mail*" className="input w-full" required />
              <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Comment" className="textarea w-full md:col-span-2" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">2</span>
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
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">৳{item.price} × {item.quantity}</td>
                    <td className="p-2">৳{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end space-x-4 text-[#2c5c2c]">
              <div>Sub-Total: ৳{subtotal}</div>
              <div className="font-bold">Total: ৳{total}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required />
            <label className="text-gray-600 text-sm">I confirm this order is correct and ready for processing.</label>
          </div>
          <div className="text-right">
            <button type="submit" className="btn bg-[#02542d] text-white" disabled={!form.agree}>
              Confirm Order
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NurseryCheckout; 