import React, { useState, useEffect } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const PICKUP_LABELS = {
  pampanga: 'Vista Mall Pampanga',
  katipunan: 'Cityland 101 Xavierville',
  rockwell: 'One Rockwell East',
};

export default function Payment({ cart, products, onHome, onSuccess, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr' | 'cod'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('pampanga');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [paidTotal, setPaidTotal] = useState(0);

  const isCOD = paymentMethod === 'cod';

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      return total + (products[id]?.price || 0) * qty;
    }, 0);
  };

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isCOD && !file) {
      setError('Please upload your proof of payment.');
      return;
    }

    setSubmitting(true);

    try {
      const items = Object.entries(cart).map(([id, qty]) => ({
        product_id: products[id].dbId,
        quantity: qty,
      }));

      const form = new FormData();
      form.append('customer_name', name);
      form.append('email', email);
      form.append('phone_number', phone);
      form.append('items', JSON.stringify(items));
      form.append('total_price', calculateTotal());
      form.append('pickup_location', pickup);
      form.append('payment_method', isCOD ? 'cash_on_pickup' : 'online');
      if (!isCOD) form.append('proof_of_payment', file);

      const res = await fetch(`${API_URL}/orders`, { method: 'POST', body: form });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const d = body.detail;
        throw new Error(typeof d === 'string' ? d : 'Please check your details and try again.');
      }

      setPaidTotal(calculateTotal());

      if (onSuccess) onSuccess();
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center mt-10 shadow-sm font-['Inter'] max-w-sm mx-auto">
        <div className="bg-[#BCE3EB] w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#8E5A52]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-['Chomage'] text-4xl text-[#8E5A52] mb-3">Order Submitted!</h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {isCOD
            ? `Please reply with "Yes" to the confirmation email we will send shortly! Prepare ₱${paidTotal.toFixed(2)} in cash when you claim your order at ${PICKUP_LABELS[pickup]}.`
            : "We'll review your payment proof and send a confirmation email soon."}
        </p>
        <button
          onClick={onHome}
          className="w-full bg-[#8E5A52] text-white py-3 rounded-full font-['Chomage'] text-xl hover:opacity-90 transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8E5A52]/40 focus:border-[#8E5A52]';

  const methodBtn = (value, label, sub) => (
    <button
      type="button"
      onClick={() => {
        setPaymentMethod(value);
        setError('');
      }}
      aria-pressed={paymentMethod === value}
      className={`flex-1 p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
        paymentMethod === value
          ? 'border-[#8E5A52] bg-[#8E5A52]/5'
          : 'border-slate-200 bg-white hover:border-[#BCE3EB]'
      }`}
    >
      <span className="block text-xs font-bold text-slate-800">{label}</span>
      <span className="block text-[10px] text-slate-500 mt-0.5">{sub}</span>
    </button>
  );

  return (
    <div className="font-['Inter'] max-w-md mx-auto py-2">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Cart</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <h2 className="font-['Chomage'] text-3xl text-[#8E5A52] text-center mb-1">Payment</h2>
        <p className="text-center text-xs text-slate-500 mb-5">
          Total: <span className="font-bold text-slate-800">₱{calculateTotal().toFixed(2)}</span>
        </p>

        {/* Payment Method Toggle */}
        <div className="flex gap-3 mb-5">
          {methodBtn('qr', 'Pay via QR', 'Scan & upload receipt')}
          {methodBtn('cod', 'Cash (COD)', 'Pay when you pick up')}
        </div>

        {/* QR Code Section / COD Note */}
        {isCOD ? (
          <div className="mb-6 bg-[#BCE3EB]/30 p-4 rounded-2xl border border-[#BCE3EB] text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-[#8E5A52] mb-1">Cash on Delivery</p>
            <p>
              No payment needed now. Please bring{' '}
              <span className="font-bold">₱{calculateTotal().toFixed(2)}</span> in cash (exact change is appreciated)
              when you claim your order at your chosen pickup location.
            </p>
          </div>
        ) : (
          <div className="text-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">Scan QR Code to Pay</p>
            <img
              src="/qr-code.png"
              alt="Payment QR Code"
              className="w-84 h-84 max-w-full mx-auto object-contain"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Total Amount: <span className="font-bold text-slate-800">₱{calculateTotal().toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="pickup" className="block font-bold text-slate-700 mb-1">Pickup Location</label>
            <select
              id="pickup"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className={inputClass}
            >
              <option value="pampanga">{PICKUP_LABELS.pampanga}</option>
              <option value="katipunan">{PICKUP_LABELS.katipunan}</option>
              <option value="rockwell">{PICKUP_LABELS.rockwell}</option>
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block font-bold text-slate-700 mb-1">Nickname</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className={inputClass}
              placeholder="Cookie Monster"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
              placeholder="cutie@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-bold text-slate-700 mb-1">Mobile Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="0917XXXXXXX"
            />
          </div>

          {!isCOD && (
            <div>
              <label htmlFor="proof" className="block font-bold text-slate-700 mb-1">Proof of Payment (.png / .jpg)</label>
              <input
                id="proof"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="w-full p-2 text-slate-500 text-xs"
              />
              {preview && (
                <div className="mt-2 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-2">
                  <img src={preview} alt="Receipt preview" className="w-14 h-14 object-cover rounded-lg" />
                  <span className="text-[11px] text-slate-500 truncate">{file?.name}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="bg-red-50 text-[#FF3B30] border border-red-100 rounded-xl p-3 text-xs font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8E5A52] text-white py-3 rounded-full font-['Chomage'] text-xl hover:opacity-90 transition cursor-pointer mt-4 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : isCOD ? 'Place Order (COD)' : 'Submit Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
