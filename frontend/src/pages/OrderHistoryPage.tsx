import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, OrderListItem } from '../services/orderApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="order-history">
      <h1>Lịch Sử Đơn Hàng</h1>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <h3>Đơn hàng #{order.id}</h3>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-info">
                <p>Ngày đặt: {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                <p>Tổng tiền: {parseInt(order.totalAmount).toLocaleString('vi-VN')}đ</p>
                <p>Số lượng sản phẩm: {order.itemCount}</p>
              </div>
              <div className="order-actions">
                <Link to={`/orders/${order.id}`} className="view-detail-btn">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        .order-history {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .orders-list {
          display: grid;
          gap: 20px;
          margin-top: 20px;
        }
        .order-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: white;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
        }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.processing { background: #cce5ff; color: #004085; }
        .status.completed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .view-detail-btn {
          display: inline-block;
          padding: 8px 16px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 10px;
        }
        .view-detail-btn:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default OrderHistoryPage;