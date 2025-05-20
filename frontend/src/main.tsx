// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; 
import './index.css' // Import CSS file

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* Bọc App trong CartProvider để sử dụng context giỏ hàng */}
        {/* Bọc App trong AuthProvider để sử dụng context xác thực */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);

