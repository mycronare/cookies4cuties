import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Payment({ cart, products, onHome, onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('Vista Mall Pampanga');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      return total + (products[id]?.price || 0) * qty;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload your proof of payment!');

    setSubmitting(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('orders').insert([
        {
          email,
          phone,
          pickup_location: pickup,
          items: cart,
          total_price: calculateTotal(),
          proof_url: urlData.publicUrl,
        },
      ]);

      if (insertError) throw insertError;

      if (onSuccess) onSuccess();
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
  return (
    <div className="bg-white p-8 rounded-3xl text-center mt-10 shadow-sm font-['Inter'] max-w-sm mx-auto">
      <h2 className="font-['Chomage'] text-4xl text-[#8E5A52] mb-3">Order Submitted!</h2>
      <p className="text-xs text-slate-600 leading-relaxed mb-6">
        We'll review your payment proof and send a confirmation email soon.
      </p>
      {/* Updated to onHome below */}
      <button
        onClick={onHome}
        className="w-full bg-[#8E5A52] text-white py-3 rounded-full font-['Chomage'] text-xl hover:opacity-90 transition cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  );
}

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
        <h2 className="font-['Chomage'] text-3xl text-[#8E5A52] text-center mb-4">Payment</h2>

        {/* QR Code Section */}
        <div className="text-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-2">Scan QR Code to Pay</p>
          <img 
            src="/qr-code.png" 
            alt="Payment QR Code" 
            className="w-84 h-84 mx-auto object-contain"
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Total Amount: <span className="font-bold text-slate-800">₱{calculateTotal().toFixed(2)}</span>
          </p>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pickup Location</label>
            <select 
              value={pickup} 
              onChange={(e) => setPickup(e.target.value)}
              className="w-full p-3 border rounded-xl bg-slate-50 text-slate-800"
            >
              <option value="Vista Mall Pampanga">Vista Mall Pampanga</option>
              <option value="Cityland 101 Xavierville">Cityland 101 Xavierville (Katipunan)</option>
              <option value="One Rockwell East">One Rockwell East (Estrella, Makati)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-xl bg-slate-50 text-slate-800"
              placeholder="cutie@example.com"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-3 border rounded-xl bg-slate-50 text-slate-800"
              placeholder="0917XXXXXXX"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Proof of Payment (.png / .jpg)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full p-2 text-slate-500 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8E5A52] text-white py-3 rounded-full font-['Chomage'] text-xl hover:opacity-90 transition cursor-pointer mt-4 shadow-sm"
          >
            {submitting ? 'Submitting...' : 'Submit Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
