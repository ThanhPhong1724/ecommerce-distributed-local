// src/pages/admin/AdminProductListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Để tạo link Thêm mới
import {  getProducts, } from '../../services/productApi'; // Điều chỉnh đường dẫn nếu cần

// Interface AdminProductPayload có thể giống Product interface bạn đã tạo
// Nếu chưa có, tạo một interface tương tự Product nhưng có thể thêm/bớt trường admin cần
// import { Product as AdminProductPayload } from '../../interfaces/product.interface';
// Định nghĩa kiểu dữ liệu Product (nên giống backend hoặc tạo interface chung)
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  img: string; // Changed from imageUrl to img to match database
  category?: {
    id: string;
    name: string;
  };
  categoryId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
// Interface cho payload admin (có thể giống Product hoặc tùy chỉnh)
export type AdminProductPayload = Product; // Hiện tại dùng chung kiểu Product

const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProductPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsForAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      // Giả sử backend có API /api/products/admin/all hoặc tương tự
      const data = await getProducts(); // Gọi API lấy tất cả sản phẩm cho admin
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sản phẩm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsForAdmin();
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm(`Bạn chắc chắn muốn xóa sản phẩm ID: ${productId}? Thao tác này không thể hoàn tác.`)) {
        try {
            // await deleteProductForAdmin(productId); // Gọi API xóa sản phẩm
            alert(`Sản phẩm ${productId} đã được xóa (Mô phỏng).`);
            // Sau khi xóa thành công, fetch lại danh sách
            fetchProductsForAdmin();
        } catch (err: any) {
            alert(`Lỗi xóa sản phẩm: ${err.message}`);
        }
    }
  };

  if (loading) return <div className="p-6">Đang tải danh sách sản phẩm...</div>;
  if (error) return <div className="p-6 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <Link
          to="/admin/products/new" // Route để tạo sản phẩm mới (sẽ tạo sau)
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          + Thêm Sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <p>Không có sản phẩm nào.</p>
      ) : (
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản phẩm</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <img src={product.imageUrl || '/placeholder-image.png'} alt={product.name} className="h-10 w-10 rounded-full object-cover" /> */}
                    Ảnh nhỏ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.id.substring(0,8)}...</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.stockQuantity}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* {new Date(product.createdAt).toLocaleDateString('vi-VN')} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</Link>
                    <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                    >
                        Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TODO: Thêm Phân trang ở đây */}
    </div>
  );
};

export default AdminProductListPage;