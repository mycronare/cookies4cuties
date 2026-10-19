import React from 'react';
import logoWithTextImg from '../assets/logo-w-text.png';

export default function Checkout({ cart, products, removeFromCart, onProceed, onBack }) {
  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      return total + (products[id]?.price || 0) * qty;
    }, 0);
  };

  return (
    <div className="font-['Inter'] max-w-md mx-auto py-2">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="bg-white text-[#8E5A52] px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Store</span>
        </button>
      </div>

      {/* Brand Logo Above Order Details */}
      <div className="text-center mb-4 w-full max-w-xs mx-auto">
        <img 
          src={logoWithTextImg} 
          alt="Cookies for Cuties" 
          className="w-full h-auto object-contain mx-auto" 
        />
      </div>

      {/* Main Order Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-4">
        <h2 className="font-['Chomage'] text-3xl text-[#8E5A52] text-center mb-6">Order Details</h2>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-xs text-slate-400 font-bold border-b border-slate-100 pb-2">
            <span>Item</span>
            <div className="space-x-8">
              <span>Qty</span>
              <span>Price</span>
            </div>
          </div>

          {Object.entries(cart).map(([id, qty]) => {
            const item = products[id];
            if (!item) return null;
            return (
              <div key={id} className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="uppercase">{item.name}</span>
                <div className="flex items-center space-x-6">
                  <span>x {qty}</span>
                  <span className="w-12 text-right">₱{(item.price * qty).toFixed(2)}</span>
                  <button 
                    onClick={() => removeFromCart(id)}
                    className="bg-[#FF3B30] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:opacity-80 transition cursor-pointer"
                  >
                    −
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-bold">Total</span>
          <span className="font-['Chomage'] text-3xl text-[#8E5A52]">
            ₱ {calculateTotal().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Pickup Information Card */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm mb-8 text-[11px] text-slate-600 space-y-2 leading-relaxed">
        <p className="font-bold text-slate-800">Orders can be claimed from any of the following locations:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <td>Vista Mall Pampanga (City of San Fernando, Pampanga)</td>
          <td>Cityland 101 Xavierville (Katipunan, Quezon City)</td>
          <td>One Rockwell East Tower (Estrella, Makati City)</td>
        </ul>
        <p className="pt-2 text-slate-500 italic">
          For orders from Katipunan and Makati, the cookies are usually baked and then brought to Metro Manila every Sunday.
        </p>
        <p className="font-bold text-slate-700">
          You will receive an email a day before your cookies are ready for pickup.
        </p>
      </div>

      {/* Sticker Style Proceed Button */}
      <div className="flex justify-center pb-6">
        <button 
          onClick={onProceed}
          className="bg-white border-4 border-white rounded-full px-6 py-2.5 shadow-xl flex items-center space-x-2 font-['Chomage'] text-2xl text-[#8E5A52] hover:scale-105 transition cursor-pointer"
          style={{
            filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15))',
          }}
        >
          <span>Proceed to Payment</span>
          <span className="text-xl font-sans">➔</span>
        </button>
      </div>
    </div>
  );
}
