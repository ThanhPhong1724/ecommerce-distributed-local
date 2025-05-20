// src/pages/admin/AdminUserListPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllUsersForAdmin, AdminUserPayload } from '../../services/userApi'; // Đường dẫn có thể cần điều chỉnh

const AdminUserListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllUsersForAdmin();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách người dùng.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Đang tải danh sách người dùng...</div>;
  if (error) return <div style={{ color: 'red' }}>Lỗi: {error}</div>;

  return (
    <div>
      <h2>Quản lý Người dùng</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd', background: '#f0f0f0' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Tên</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Họ</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Vai trò</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Ngày tạo</th>
            {/* Thêm cột Actions sau */}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{user.id.substring(0,8)}...</td>
              <td style={{ padding: '8px' }}>{user.email}</td>
              <td style={{ padding: '8px' }}>{user.firstName}</td>
              <td style={{ padding: '8px' }}>{user.lastName}</td>
              <td style={{ padding: '8px' }}>{user.role}</td>
              <td style={{ padding: '8px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserListPage;