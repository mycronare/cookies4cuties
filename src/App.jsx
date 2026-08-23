import React, { useState } from 'react';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState({});

  const products = {
    box_of_six: { id: 'box_of_six', name: 'BOX OF SIX', price: 250 },
    single_palm: { id: 'single_palm', name: 'SINGLE PALM-SIZED', price: 80 },
  };

  const addToCart = (productId) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#BCE3EB] flex justify-center p-4">
      <div className="w-full max-w-md">
        {currentPage === 'home' && (
          <Home 
            addToCart={addToCart} 
            totalItems={totalItems} 
            onGoToCheckout={() => setCurrentPage('checkout')} 
          />
        )}

        {currentPage === 'checkout' && (
          <Checkout 
            cart={cart} 
            products={products} 
            removeFromCart={removeFromCart} 
            onProceed={() => setCurrentPage('payment')} 
            onBack={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'payment' && (
          <Payment 
            cart={cart} 
            products={products} 
            onSuccess={clearCart}
            onHome={() => setCurrentPage('home')}
            onBack={() => setCurrentPage('checkout')}
          />
        )}
      </div>
    </div>
  );
}
