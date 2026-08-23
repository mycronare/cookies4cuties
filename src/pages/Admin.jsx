import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Admin({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simple PIN protection (Change 'cutie123' to your preferred key)
  const ADMIN_PASSKEY = 'cutie123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (passkey === ADMIN_PASSKEY) {
      setAuthenticated(true);
      fetchOrders();
    } else {
      alert('Incorrect passkey!');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error fetching orders: ' + error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm mt-10 font-['Inter'] max-w-sm mx-auto">
        <h2 className="font-['Chomage'] text-3xl text-[#8E5A52] text-center mb-4">Admin Portal</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Enter Passkey</label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full p-2.5 border rounded-xl text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#8E5A52] text-white py-2.5 rounded-2xl font-['Chomage'] text-lg hover:opacity-90 transition cursor-pointer"
          >
            Access Dashboard
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-xs text-slate-400 hover:text-slate-600 text-center block pt-2"
          >
            ← Back to Store
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="font-['Inter'] py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold shadow-sm cursor-pointer"
        >
          ← Back to Store
        </button>
        <h1 className="font-['Chomage'] text-3xl text-[#8E5A52]">Admin Dashboard</h1>
        <button
          onClick={fetchOrders}
          className="bg-[#BCE3EB] text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-500 py-10">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center text-slate-500 text-sm">
          No orders received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm text-xs space-y-3">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                  <p className="font-bold text-slate-800 text-sm">{order.email}</p>
                  <p className="text-slate-500">{order.phone}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#8E5A52] text-base">₱{order.total_price}</span>
                  <p className="text-[10px] text-slate-500">{order.pickup_location}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="font-bold text-slate-700 mb-1">Items:</p>
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-slate-600">
                  {Object.entries(order.items || {}).map(([id, qty]) => (
                    <div key={id} className="flex justify-between">
                      <span>{id}</span>
                      <span className="font-bold">x{qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt Image Link */}
              <div className="pt-2 flex justify-end">
                <a
                  href={order.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#8E5A52] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition inline-block"
                >
                  View Payment Proof ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
