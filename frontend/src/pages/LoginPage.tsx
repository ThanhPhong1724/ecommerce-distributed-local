// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook để chuyển trang
import { useAuth } from '../contexts/AuthContext'; // Hook lấy context Auth
import { loginUser, getUserProfile } from '../services/authApi'; // Import hàm gọi API

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAuth(); // Lấy hàm dispatch từ context
  const navigate = useNavigate(); // Hook để chuyển trang

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Ngăn form submit theo cách truyền thống
    setError(null);
    setLoading(true);

    try {
      const loginData = await loginUser({ email, password }); // Gọi API login
      const token = loginData.access_token;

      // Sau khi có token, gọi API lấy profile user
      // (Hoặc nếu API login trả về user info thì dùng luôn)
      // Cần thiết lập apiClient để gửi token tự động (đã làm ở bước trước)
      const userProfile = await getUserProfile();

      // Dispatch action LOGIN_SUCCESS vào context
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user: { id: userProfile.userId, email: userProfile.email } },
      });

      navigate('/'); // Chuyển về trang chủ sau khi đăng nhập thành công
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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