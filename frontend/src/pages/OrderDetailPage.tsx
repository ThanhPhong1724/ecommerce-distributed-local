// src/pages/OrderDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, OrderDetail as OrderDetailType, OrderItem } from '../services/orderApi'; // Đổi tên OrderDetail thành OrderDetailType để tránh trùng tên component
import { format } from 'date-fns'; // Thư viện để format ngày tháng
import { vi } from 'date-fns/locale'; // Optional: locale tiếng Việt cho date-fns

// Helper function để format tiền tệ
const formatCurrency = (amount: string | number): string => {
  const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberAmount);
};

// Helper function để hiển thị trạng thái đơn hàng thân thiện hơn
const getOrderStatusDisplay = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Đang chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'shipping':
      return 'Đang giao hàng';
    case 'completed':
      return 'Hoàn thành';
    case 'failed':
      return 'Thất bại';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderDetails(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message || 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="order-detail-loading">Đang tải thông tin đơn hàng...</div>;
  }

  if (error) {
    return <div className="order-detail-error">Lỗi: {error}</div>;
  }

  if (!order) {
    return <div className="order-detail-not-found">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="order-detail-container">
      <h1>Chi tiết Đơn hàng #{order.id.substring(0, 8)}...</h1> {/* Hiển thị một phần ID cho ngắn gọn */}

      <div className="order-summary card">
        <h2>Thông tin chung</h2>
        <p><strong>Mã đơn hàng:</strong> {order.id}</p>
        <p>
          <strong>Trạng thái:</strong>
          <span className={`order-status status-${order.status.toLowerCase()}`}>
            {getOrderStatusDisplay(order.status)}
          </span>
        </p>
        <p><strong>Ngày đặt:</strong> {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
        <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}</p>
        <p><strong>Tổng tiền:</strong> <span className="total-amount">{formatCurrency(order.totalAmount)}</span></p>
      </div>

      <div className="order-items card">
        <h2>Danh sách sản phẩm</h2>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: OrderItem) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(parseFloat(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-actions">
        <Link to="/products" className="button">Tiếp tục mua sắm</Link>
        {/* Bạn có thể thêm các action khác ở đây, ví dụ: Hủy đơn hàng (nếu trạng thái cho phép) */}
      </div>

      <style>{`
        .order-detail-container {
          max-width: 900px;
          margin: 2rem auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          color: #333;
        }
        .order-detail-container h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #2c3e50;
        }
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          padding: 25px;
        }
        .card h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #34495e;
          border-bottom: 2px solid #eee;
          padding-bottom: 0.5rem;
        }
        .order-summary p, .order-items p {
          margin: 0.8rem 0;
          line-height: 1.6;
        }
        .order-summary p strong {
          color: #555;
        }
        .total-amount {
          font-weight: bold;
          font-size: 1.2em;
          color: #e74c3c;
        }
        .order-status {
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.9em;
        }
        .status-pending { background-color: #f39c12; }
        .status-processing { background-color: #3498db; }
        .status-shipping { background-color: #1abc9c; }
        .status-completed { background-color: #2ecc71; }
        .status-failed { background-color: #e74c3c; }
        .status-cancelled { background-color: #95a5a6; }

        .order-items table {
          width: 100%;
          border-collapse: collapse;
        }
        .order-items th, .order-items td {
          text-align: left;
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        .order-items th {
          background-color: #f9f9f9;
          font-weight: 600;
          color: #555;
        }
        .order-items td a {
          color: #3498db;
          text-decoration: none;
        }
        .order-items td a:hover {
          text-decoration: underline;
        }
        .order-items tr:last-child td {
          border-bottom: none;
        }
        .order-detail-loading, .order-detail-error, .order-detail-not-found {
          text-align: center;
          font-size: 1.2em;
          padding: 3rem;
          color: #7f8c8d;
        }
        .order-detail-error {
            color: #e74c3c;
        }
        .order-actions {
            text-align: center;
            margin-top: 2rem;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 1em;
            transition: background-color 0.3s ease;
        }
        .button:hover {
            background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

export default OrderDetailPage;