// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser, getUserProfile } from '../services/authApi';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginData = await loginUser({ email, password });
      const token = loginData.access_token;

      if (!token) {
        throw new Error("Không nhận được token khi đăng nhập.");
      }

      localStorage.setItem('accessToken', token);
      
      const userProfile = await getUserProfile();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          token, 
          user: { 
            id: userProfile.userId, 
            email: userProfile.email, 
            role: userProfile.role 
          } 
        },
      });

      // Chuyển hướng dựa vào role
      if (userProfile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (err.message) {
          errorMessage = err.message;
      }
      if (err.error && err.message && Array.isArray(err.message)) {
          errorMessage = `${err.error}: ${err.message.join(', ')}`;
      } else if (typeof err.message === 'string') {
           errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Lỗi trong quá trình đăng nhập:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative px-4 py-12 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #f43f5e)',
        backgroundSize: '400% 400%',
        // animation: 'gradient 8s ease infinite'
      }}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Login container */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 shadow-2xl rounded-2xl space-y-8">
          <div>
            {/* Logo có thể đặt ở đây */}
            {/* <img className="mx-auto h-12 w-auto" src="/your-logo.svg" alt="Your Company" /> */}
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brand-dark">
              Đăng nhập tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Hoặc{' '}
              <Link to="/register" className="font-medium text-brand-primary hover:text-brand-secondary">
                tạo tài khoản mới
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Trường ẩn cho remember me, không bắt buộc */}
            {/* <input type="hidden" name="remember" defaultValue="true" /> */}
            
            <div className="space-y-4"> {/* Thay vì -space-y-px để có khoảng cách giữa các input */}
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="off"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 my-4"> {/* Giảm padding một chút */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2"> {/* Giảm margin một chút */}
                    <p className="text-sm font-medium text-red-700">{error}</p> {/* Đậm hơn màu chữ lỗi */}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ tôi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" /* Thay bằng route thực tế */ className="font-medium text-brand-primary hover:text-brand-secondary">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-black text-sm font-medium rounded-md shadow-sm text-black border-black bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng Nhập'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;