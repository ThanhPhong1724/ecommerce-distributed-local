// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      // 1. Call API login
      const loginData = await loginUser({ email, password });
      const token = loginData.access_token; // Use the exact key returned by your API

      // --- BEGIN FIX ---
      if (!token) {
          throw new Error("Không nhận được token khi đăng nhập.");
      }

      // 2. Store the token IMMEDIATELY using the correct key
      //    Make sure this key matches the one in apiClient.ts interceptor
      localStorage.setItem('accessToken', token);
      console.log("Token đã được lưu vào localStorage:", localStorage.getItem('accessToken')); // Verify
      // --- END FIX ---

      // 3. Now that the token is stored, the interceptor will pick it up
      //    when calling getUserProfile
      const userProfile = await getUserProfile();
      console.log("User profile:", userProfile); // Check if profile data is received

      // 4. Dispatch action LOGIN_SUCCESS into context
      dispatch({
        type: 'LOGIN_SUCCESS',
        // Use consistent naming (userId or id?) - check ProfileResponse
        payload: { token, user: { id: userProfile.userId, email: userProfile.email } },
      });

      navigate('/'); // Redirect to home page

    } catch (err: any) {
        // Better error message display
        let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
        if (err.message) {
            errorMessage = err.message;
        }
        // Check if the error object has more specific info from backend
        if (err.error && err.message && Array.isArray(err.message)) {
            errorMessage = `${err.error}: ${err.message.join(', ')}`; // Example for NestJS validation errors
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
    // JSX remains the same
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;