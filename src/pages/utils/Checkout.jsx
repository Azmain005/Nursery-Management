// src/pages/utils/Checkout.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../providers/CartProvider';

const Checkout = () => {
  const { cartItems } = useCart();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    mobile: '',
    email: '',
    city: '',
    zone: 'Dhaka City',
    comment: '',
    payment: 'cod',
    delivery: 'home',
    voucher: '',
    coupon: '',
    agree: false
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // compute the various totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge =
    form.delivery === 'home'
      ? 60
      : form.delivery === 'store'
      ? 0
      : 150;
  const total = subtotal + deliveryCharge;

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: hook in your order‐placement logic here (e.g. write to Firestore)
    alert('Order confirmed! Thank you.');
  };

  return (
    <div className="min-h-screen bg-[#faf6e9] flex flex-col">
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold text-[#2c5c2c] mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Customer Information */}
          <div
            className="rounded-lg shadow p-6"
            style={{ backgroundColor: 'rgb(254,250,244)' }}
          >
            <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                1
              </span>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name*"
                className="input w-full"
                required
              />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name*"
                className="input w-full"
                required
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address*"
                className="input w-full md:col-span-2"
                required
              />
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Telephone*"
                className="input w-full"
                required
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-Mail*"
                className="input w-full"
                required
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City*"
                className="input w-full"
                required
              />
              <select
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="select w-full"
              >
                <option>Dhaka City</option>
                <option>Chittagong</option>
                <option>Khulna</option>
              </select>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                placeholder="Comment"
                className="textarea w-full md:col-span-2"
              />
            </div>
          </div>

          {/* Step 2 & 3: Payment & Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                  2
                </span>
                Payment Method
              </h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={handleChange}
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={form.payment === 'online'}
                    onChange={handleChange}
                  />
                  Online Payment
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value="pos"
                    checked={form.payment === 'pos'}
                    onChange={handleChange}
                  />
                  POS on Delivery
                </label>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="flex items-center text-lg font-bold text-[#607b64] mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 mr-2 bg-[#02542d] text-white rounded-full">
                  3
                </span>
                Delivery Method
              </h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery"
                    value="home"
                    checked={form.delivery === 'home'}
                    onChange={handleChange}
                  />
                  Home Delivery – ৳60
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery"
                    value="store"
                    checked={form.delivery === 'store'}
                    onChange={handleChange}
                  />
                  Store Pickup – ৳0
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={form.delivery === 'express'}
                    onChange={handleChange}
                  />
                  Request Express – ৳150
                </label>
              </div>
            </div>
          </div>

          {/* Voucher & Coupon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="voucher"
              value={form.voucher}
              onChange={handleChange}
              placeholder="Gift Voucher"
              className="input w-full"
            />
            <button type="button" className="btn bg-[#02542d] text-white">
              Apply Voucher
            </button>
            <input
              name="coupon"
              value={form.coupon}
              onChange={handleChange}
              placeholder="Promo / Coupon Code"
              className="input w-full"
            />
            <button type="button" className="btn bg-[#02542d] text-white">
              Apply Coupon
            </button>
          </div>

          {/* Step 4: Order Overview */}
          <div className="bg-white rounded-lg shadow p-6">
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
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">
                      ৳{item.price} × {item.quantity}
                    </td>
                    <td className="p-2">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end space-x-4 text-[#2c5c2c]">
              <div>Sub-Total: ৳{subtotal}</div>
              <div>Delivery: ৳{deliveryCharge}</div>
              <div className="font-bold">Total: ৳{total}</div>
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
              I have read and agree to the{' '}
              <NavLink to="/terms" className="text-[#02542d] underline">
                Terms and Conditions
              </NavLink>
              ,{' '}
              <NavLink to="/privacy" className="text-[#02542d] underline">
                Privacy Policy
              </NavLink>{' '}
              and{' '}
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
