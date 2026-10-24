import React, { useState } from 'react';
import logoWithTextImg from '../assets/logo-w-text.png';
import boxOfSixImg from '../assets/box-of-six.png';
import singlePalmImg from '../assets/single-palm.png';

export default function Home({ addToCart, totalItems, onGoToCheckout, cart = {} }) {
  // Briefly shows a checkmark on the bag button after adding
  const [justAdded, setJustAdded] = useState(null);

  const products = [
    {
      id: 'box_of_six',
      name: 'Box Of Six',
      price: 250.00,
      desc: 'Six pieces of regular-sized chocolate chip cookies in a box.',
      image: boxOfSixImg,
    },
    {
      id: 'single_palm',
      name: 'Single Palm-Sized',
      price: 80.00,
      desc: 'One palm-sized chocolate chip cookie.',
      image: singlePalmImg,
    },
  ];

  const handleAdd = (id) => {
    addToCart(id);
    setJustAdded(id);
    setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 900);
  };

  return (
    <div className="flex flex-col items-center py-6 min-h-screen justify-between relative">
      <div className="w-full flex flex-col items-center">
        {/* Header Logo with Text */}
        <div className="text-center mb-4 w-full max-w-xs">
          <img
            src={logoWithTextImg}
            alt="Cookies for Cuties"
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Instructions Card with Identical Bag Icon */}
        <div className="w-full bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-2.5 mb-6 shadow-sm flex items-center space-x-3">
          <span className="bg-[#BCE3EB] p-1.5 rounded-full shadow-xs flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </span>
          <p className="font-['Inter'] text-xs text-[#8E5A52] font-medium leading-snug">
            Click the shopping bag on any cookie to add it to your order!
          </p>
        </div>

        {/* Product Cards */}
        <div className="w-full space-y-6 mb-28">
          {products.map((product) => {
            const qty = cart[product.id] || 0;
            const added = justAdded === product.id;
            return (
              <div
                key={product.id}
                className="bg-white rounded-[2rem] p-6 shadow-sm relative flex justify-between min-h-[200px] overflow-hidden"
              >
                {/* Text & Desc Column */}
                <div className="z-10 max-w-[55%] flex flex-col justify-between">
                  <div>
                    <h2 className="font-['Chomage'] text-3xl text-[#8E5A52] leading-tight font-bold">
                      {product.name}
                    </h2>
                    <p className="font-['Inter'] italic text-sm text-slate-700 mt-1">
                      Php {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-6">
                    <p className="font-['Inter'] text-xs text-slate-600 leading-relaxed">
                      {product.desc}
                    </p>
                    {qty > 0 && (
                      <p className="font-['Inter'] text-[11px] font-bold text-[#8E5A52] mt-2">
                        {qty} in your order
                      </p>
                    )}
                  </div>
                </div>

                {/* Edge-to-Edge Cookie Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute right-0 top-0 bottom-0 h-full w-[55%] object-cover object-left pointer-events-none"
                />

                {/* Shopping Bag Button */}
                <button
                  onClick={() => handleAdd(product.id)}
                  aria-label={`Add ${product.name} to order`}
                  className={`z-20 p-3 rounded-full shadow-sm transition-all duration-200 cursor-pointer self-start absolute top-5 right-5 flex items-center justify-center active:scale-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8E5A52]/40 ${
                    added ? 'bg-[#8E5A52] scale-110' : 'bg-[#BCE3EB] hover:bg-[#a6d5df]'
                  }`}
                >
                  {added ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout Sticker Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 z-30 flex justify-center">
          <button
            onClick={onGoToCheckout}
            className="group relative bg-white border-4 border-white rounded-full px-6 py-2 shadow-xl flex items-center space-x-2 font-['Chomage'] text-3xl text-[#8E5A52] hover:scale-105 transition cursor-pointer"
            style={{
              filter: 'drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15))',
            }}
          >
            {/* Red Badge Indicator */}
            <span
              key={totalItems}
              className="absolute -top-2 -left-2 bg-[#FF3B30] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-['Inter'] font-bold border-2 border-white shadow-md animate-bounce [animation-iteration-count:1]"
            >
              {totalItems}
            </span>
            <span className="tracking-wide">checkout</span>
            <span className="text-2xl font-sans">➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
