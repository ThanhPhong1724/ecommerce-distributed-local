// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authApi'; // Import API

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await registerUser({ email, password, firstName, lastName });
      setSuccess(true);
      // Tùy chọn: Tự động chuyển đến trang đăng nhập sau vài giây
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Chuyển sau 2 giây
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng Ký Tài Khoản</h2>
      {success ? (
        <p style={{ color: 'green' }}>Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Input cho firstName */}
          <div>
            <label htmlFor="firstName">Tên:</label>
            <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          {/* Input cho lastName */}
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="lastName">Họ:</label>
            <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          {/* Input cho email */}
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="reg-email">Email:</label>
            <input type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {/* Input cho password */}
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="reg-password">Mật khẩu:</label>
            <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RegisterPage;