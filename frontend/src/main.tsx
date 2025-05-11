// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; // <<< Import CartProvider
import './index.css' // << QUAN TRỌNG: Import file CSS chính ở đây

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* <<< Bọc App trong CartProvider */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);

