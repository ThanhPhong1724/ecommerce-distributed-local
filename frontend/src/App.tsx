// src/App.tsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ProductListPage from './pages/ProductListPage';
// import CartPage from './pages/CartPage';
// import CheckoutPage from './pages/CheckoutPage';
// import VnPayReturnPage from './pages/VnPayReturnPage';
// import OrderDetailPage from './pages/OrderDetailPage';
// import OrderHistoryPage from './pages/OrderHistoryPage';
// import ProductDetailPage from './pages/ProductDetailPage';
// import ProfilePage from './pages/ProfilePage';
// import AboutPage from './pages/AboutPage';
// import TermsPage from './pages/TermsPage';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';

// const App: React.FC = () => {
//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen">
//         <Navbar />
//         <main className="flex-grow">
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RegisterPage />} />
//             <Route path="/products" element={<ProductListPage />} />
//             <Route path="/cart" element={<CartPage />} />
//             <Route path="/checkout" element={<CheckoutPage />} />
//             <Route path="/payment/result" element={<VnPayReturnPage />} />
//             <Route path="/orders/:orderId" element={<OrderDetailPage />} />
//             <Route path="/orders" element={<OrderHistoryPage />} />
//             <Route path="/products/:id" element={<ProductDetailPage />} />
//             <Route path="/users/profile" element={<ProfilePage />} />
//             <Route path="/about" element={<AboutPage />} />
//             <Route path="/terms" element={<TermsPage />} />
//             <Route path="*" element={<h1>404 Not Found</h1>} />
//           </Routes>
//         </main>
//         <Footer />
//       </div>
//     </Router>
//   );
// };

// export default App;

// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import PrivateRoute from './router/PrivateRoute';
import AdminRoute from './router/AdminRoute';

// User Pages
// ... (các import trang user)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListPage from './pages/ProductListPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VnPayReturnPage from './pages/VnPayReturnPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserListPage from './pages/admin/AdminUserListPage';
import AdminProductListPage from './pages/admin/AdminProductListPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage'; 
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage';
import AdminOrderListPage from './pages/admin/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
// ... (các import trang admin khác)

const NotFoundPage = () => <h1>404 Not Found</h1>;

// --- Component Layout cho User ---
const UserLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Outlet /> {/* Trang con của user sẽ render ở đây */}
    </main>
    <Footer />
  </div>
);
// --------------------------------

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Routes cho người dùng thường (sử dụng UserLayout) */}
        <Route element={<UserLayout />}> {/* <<< Bọc các route user bằng UserLayout */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/payment/result" element={<PrivateRoute><VnPayReturnPage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
          <Route path="/orders/:orderId" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/users/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {/* Không đặt 404 ở đây nữa, sẽ có 404 chung cuối cùng */}
        </Route>

        {/* Routes cho Admin (sử dụng AdminLayout) */}
        <Route
          path="/admin" // <<< Chỉ cần /admin ở đây
          element={
            <AdminRoute> {/* Bảo vệ toàn bộ nhánh /admin */}
              <AdminLayout /> {/* AdminLayout chứa Outlet */}
            </AdminRoute>
          }
        >
          {/* Các route con của admin sẽ tự động render vào Outlet của AdminLayout */}
          {/* path ở đây sẽ là tương đối so với /admin */}
          <Route index element={<AdminDashboardPage />} /> {/* /admin */}
          <Route path="dashboard" element={<AdminDashboardPage />} /> {/* /admin/dashboard */}
          <Route path="users" element={<AdminUserListPage />} /> {/* /admin/users */}
          <Route path="products" element={<AdminProductListPage />} /> {/* /admin/products */}
          {/* <Route path="orders" element={<AdminOrderListPage />} /> */}
          {/* <Route path="categories" element={<AdminCategoryListPage />} /> */}
          <Route path="products/new" element={<AdminProductFormPage />} /> {/* Thêm sản phẩm mới */}
          <Route path="products/edit/:productId" element={<AdminProductFormPage />} /> {/* Sửa sản phẩm */}
          <Route path="categories" element={<AdminCategoryListPage />} />
          <Route path="categories/new" element={<AdminCategoryFormPage />} />
          <Route path="categories/edit/:categoryId" element={<AdminCategoryFormPage />} />
          <Route path="orders" element={<AdminOrderListPage />} />
          <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* 404 cho các route /admin/không_khớp */}
        </Route>

        {/* Route 404 chung cho toàn bộ ứng dụng (nếu không khớp user routes hoặc admin routes) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;