// src/pages/VnPayReturnPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Đảm bảo đường dẫn này đúng
import { getOrderDetails } from '../services/orderApi'; // Thêm import này

const VnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart(); // Giả định clearCart là một hàm async

  const [message, setMessage] = useState<string>('Đang xử lý kết quả thanh toán...');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null); // Sử dụng tên biến khác để rõ ràng

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const codeParam = searchParams.get('code');
        const orderIdParam = searchParams.get('orderId');
        const messageParam = searchParams.get('message');

        if (orderIdParam) {
          setDisplayOrderId(orderIdParam);
          
          // Thêm phần này để cập nhật trạng thái đơn hàng
          try {
            const orderDetails = await getOrderDetails(orderIdParam);
            console.log('Updated order status:', orderDetails.status);
            
            // Nếu thanh toán thành công
            if (codeParam === '00') {
              setIsSuccess(true);
              setMessage('Thanh toán thành công!');
              if (typeof clearCart === 'function') {
                await clearCart();
              }
            } else {
              setIsSuccess(false);
              setMessage(messageParam ? decodeURIComponent(messageParam) : 'Thanh toán thất bại');
            }
          } catch (orderError) {
            console.error('Error fetching order details:', orderError);
            setMessage('Không thể cập nhật trạng thái đơn hàng');
          }
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
        setIsSuccess(false);
      }
    };

    processPaymentResult();
  }, [searchParams, clearCart]);

  return (
    <div className="payment-result-container">
      <h2>Kết quả Thanh toán</h2>
      <div
        className={`message ${
          isSuccess === true ? 'success' : isSuccess === false ? 'error' : ''
        }`}
      >
        {message}
      </div>
      <div className="actions">
        <button onClick={() => navigate('/')}>Về Trang chủ</button>
        {isSuccess && displayOrderId && (
          <button onClick={() => navigate(`/orders/${displayOrderId}`)}>
            Xem chi tiết đơn hàng
          </button>
        )}
        {!isSuccess && displayOrderId && ( // Thêm nút thử lại hoặc xem đơn hàng nếu thất bại
           <button onClick={() => navigate(`/orders/${displayOrderId}`)}>
            Xem thông tin đơn hàng
          </button>
        )}
      </div>
      <style>{`
        .payment-result-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-radius: 8px;
          background-color: white;
        }
        .message {
          margin: 1.5rem 0;
          padding: 1.5rem;
          border-radius: 8px;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .success {
          color: #2e7d32;
          background-color: #e8f5e9;
          border: 1px solid #a5d6a7;
        }
        .error {
          color: #c62828;
          background-color: #ffebee;
          border: 1px solid #ef9a9a;
        }
        .actions {
          margin-top: 2rem;
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap; /* Cho phép xuống dòng nếu không đủ chỗ */
        }
        button {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 4px;
          background-color: #1976d2; /* Màu chính */
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s ease-in-out;
          font-weight: 500;
        }
        button:hover {
          background-color: #1565c0; /* Màu đậm hơn khi hover */
        }
        /* Có thể thêm style cho nút thứ hai nếu cần */
        .actions button:nth-child(2) {
            background-color: #6c757d; /* Màu khác cho nút xem đơn hàng */
        }
        .actions button:nth-child(2):hover {
            background-color: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default VnPayReturnPage;