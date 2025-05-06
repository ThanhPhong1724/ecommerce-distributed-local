// src/pages/VnPayReturnPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext'; // Đảm bảo đường dẫn này đúng

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
        // Backend của bạn redirect về với các tham số là 'code', 'orderId', và 'message'
        const codeParam = searchParams.get('code');
        const orderIdParam = searchParams.get('orderId');
        const messageParam = searchParams.get('message'); // Message đã được encodeURIComponent bởi backend

        console.log('VnPayReturnPage - Received URL params:', {
          code: codeParam,
          orderId: orderIdParam,
          message: messageParam ? decodeURIComponent(messageParam) : null,
        });

        if (orderIdParam) {
          setDisplayOrderId(orderIdParam);
        }

        if (codeParam === '00') {
          // Thanh toán thành công
          setMessage(
            messageParam
              ? decodeURIComponent(messageParam)
              : `Thanh toán thành công cho đơn hàng #${orderIdParam}! Cảm ơn bạn đã mua sắm.`
          );
          setIsSuccess(true);
          if (typeof clearCart === 'function') { // Kiểm tra xem clearCart có phải là hàm không
            await clearCart(); // Xóa giỏ hàng
            console.log('Cart cleared after successful payment.');
          } else {
            console.warn('clearCart function is not available from CartContext.');
          }
          localStorage.removeItem('pendingOrderId'); // Xóa orderId đang chờ (nếu có)
        } else if (codeParam) {
          // Thanh toán thất bại hoặc có mã lỗi khác
          setMessage(
            messageParam
              ? decodeURIComponent(messageParam)
              : `Thanh toán thất bại cho đơn hàng #${orderIdParam || 'không xác định'}. Mã lỗi: ${codeParam}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`
          );
          setIsSuccess(false);
        } else {
          // Không có 'code' trong URL params, có thể URL không đúng
          setMessage('Không nhận được thông tin kết quả thanh toán hợp lệ. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.');
          setIsSuccess(false);
          console.warn('VnPayReturnPage: Missing "code" parameter in URL.');
        }
      } catch (error) {
        console.error('VnPayReturnPage - Error processing payment result:', error);
        setMessage('Có lỗi xảy ra trong quá trình xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.');
        setIsSuccess(false);
      }
    };

    processPaymentResult();
  }, [searchParams, clearCart]); // Thêm clearCart vào dependency array của useEffect

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