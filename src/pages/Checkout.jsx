import React from 'react';
import logoWithTextImg from '../assets/logo-w-text.png';

export default function Checkout({ cart, products, removeFromCart, onProceed, onBack }) {
  const entries = Object.entries(cart).filter(([id]) => products[id]);
  const isEmpty = entries.length === 0;

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

        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-4">Your order is empty. Add some cookies first!</p>
            <button
              onClick={onBack}
              className="bg-[#BCE3EB] text-slate-800 px-5 py-2 rounded-full text-xs font-bold hover:bg-[#a6d5df] transition cursor-pointer"
            >
              Browse cookies
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-[1fr_auto_auto_1.25rem] gap-x-4 text-xs text-slate-400 font-bold border-b border-slate-100 pb-2">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="w-16 text-right">Price</span>
                <span />
              </div>

              {entries.map(([id, qty]) => {
                const item = products[id];
                return (
                  <div
                    key={id}
                    className="grid grid-cols-[1fr_auto_auto_1.25rem] gap-x-4 items-center text-xs font-bold text-slate-800"
                  >
                    <div>
                      <span className="uppercase block">{item.name}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        ₱{item.price.toFixed(2)} each
                      </span>
                    </div>
                    <span className="text-right">x {qty}</span>
                    <span className="w-16 text-right">₱{(item.price * qty).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(id)}
                      aria-label={`Remove one ${item.name}`}
                      className="bg-[#FF3B30] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:opacity-80 active:scale-90 transition cursor-pointer"
                    >
                      −
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-bold">Total</span>
              <span className="text-3xl text-[#8E5A52] flex items-baseline gap-1">
                {/* Peso sign in Inter so it renders cleanly */}
                <span className="font-['Inter'] font-bold text-2xl">₱</span>
                <span className="font-['Chomage']">{calculateTotal().toFixed(2)}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Pickup Information Card */}
      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm mb-8 text-[11px] text-slate-600 space-y-2 leading-relaxed">
        <p className="font-bold text-slate-800">Orders can be claimed from any of the following locations:</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Vista Mall Pampanga (City of San Fernando, Pampanga)</li>
          <li>Cityland 101 Xavierville (Katipunan, Quezon City)</li>
          <li>One Rockwell East Tower (Estrella, Makati City)</li>
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
          disabled={isEmpty}
          className="bg-white border-4 border-white rounded-full px-6 py-2.5 shadow-xl flex items-center space-x-2 font-['Chomage'] text-2xl text-[#8E5A52] hover:scale-105 transition cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
