// src/pages/admin/AdminProductFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSave,
  FiX,
  FiImage,
  FiDollarSign,
  FiPackage,
  FiFolder,
  FiType,
  FiFileText,
  FiArrowLeft
} from 'react-icons/fi';
import {
    // Giả sử bạn sẽ tạo các hàm này trong productApi.ts cho admin
    getProductByIdForAdmin, // Để lấy dữ liệu khi sửa
    createProductForAdmin,
    updateProductForAdmin
} from '../../services/productApi'; // Điều chỉnh đường dẫn
import { getAllCategories, Category } from '../../services/categoryApi'; // Giả sử có API lấy danh mục
import { Product as AdminProductPayload } from '../../services/productApi'; // Hoặc interface riêng

const AdminProductFormPage: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>(); // Lấy productId nếu là edit
  const navigate = useNavigate();
  const isEditMode = Boolean(productId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>(''); // Dùng string để input dễ hơn
  const [stockQuantity, setStockQuantity] = useState<number | string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState(''); // Hoặc File nếu upload
  // const [imageFile, setImageFile] = useState<File | null>(null); // Nếu upload file

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories cho dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories(); // Cần tạo hàm này
        setCategories(cats);
        if (cats.length > 0 && !isEditMode) { // Set mặc định cho form thêm mới
            setSelectedCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCategories();
  }, [isEditMode]);

  // Fetch product data nếu là edit mode
  useEffect(() => {
    if (isEditMode && productId) {
      setLoading(true);
      getProductByIdForAdmin(productId) // Cần tạo hàm này
        .then((product) => {
          setName(product.name);
          setDescription(product.description || '');
          setPrice(product.price);
          setStockQuantity(product.stockQuantity);
          setSelectedCategoryId(product.categoryId);
          setImageUrl(product.img || '');
        })
        .catch((err) => {
          setError('Không thể tải thông tin sản phẩm để sửa.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [productId, isEditMode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const productData = {
        name,
        description,
        price: parseFloat(price as string) || 0,
        stockQuantity: parseInt(stockQuantity as string, 10) || 0,
        categoryId: selectedCategoryId,
        img: imageUrl,
    };

    // (Xử lý Upload File nếu có)
    // const formData = new FormData();
    // Object.entries(productData).forEach(([key, value]) => {
    //    formData.append(key, String(value));
    // });
    // if (imageFile) {
    //    formData.append('image', imageFile); // 'image' là tên field backend mong đợi
    // }

    try {
        if (isEditMode && productId) {
            // Ép kiểu Omit vẫn cần khớp tên thuộc tính
            await updateProductForAdmin(productId, productData as Omit<AdminProductPayload, 'id' | 'createdAt' | 'updatedAt' | 'category'>);
            alert('Cập nhật sản phẩm thành công!');
        } else {
            await createProductForAdmin(productData as Omit<AdminProductPayload, 'id' | 'createdAt' | 'updatedAt' | 'category'>);
            alert('Thêm sản phẩm thành công!');
        }
        navigate('/admin/products');
        } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra.');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };
  if (loading && isEditMode) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Tạo một sản phẩm mới cho cửa hàng'}
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tên sản phẩm
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiType className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFolder className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  required
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Giá (VNĐ)
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiDollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="1000"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                Số lượng tồn kho
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPackage className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="stockQuantity"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                  min="0"
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <FiFileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập mô tả sản phẩm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Link hình ảnh
            </label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiImage className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập URL hình ảnh"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <FiX className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              to="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              data-testid="admin-product-form-submit-button"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 mr-2" />
                  {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminProductFormPage;