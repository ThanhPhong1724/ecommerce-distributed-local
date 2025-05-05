import React from 'react';
import { useSearchParams } from 'react-router-dom';

const VnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Lấy các tham số từ URL (query params)
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
  const vnpAmount = searchParams.get('vnp_Amount');

  return (
    <div>
      <h1>VNPay Return Page</h1>
      <p>Kết quả giao dịch:</p>
      <ul>
        <li>Mã phản hồi: {vnpResponseCode}</li>
        <li>Trạng thái giao dịch: {vnpTransactionStatus}</li>
        <li>Số tiền: {vnpAmount}</li>
      </ul>
    </div>
  );
};

export default VnPayReturnPage;