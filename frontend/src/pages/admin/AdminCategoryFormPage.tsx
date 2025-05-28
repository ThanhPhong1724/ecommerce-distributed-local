// src/pages/admin/AdminCategoryFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSave,
  FiX,
  FiArrowLeft,
  FiLoader
} from 'react-icons/fi';
import {
  getCategoryById, // Dùng chung
  createCategoryForAdmin,
  updateCategoryForAdmin,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '../../services/categoryApi';

const AdminCategoryFormPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(categoryId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && categoryId) {
      setLoading(true);
      getCategoryById(categoryId)
        .then((category) => {
          setName(category.name);
          setDescription(category.description || '');
        })
        .catch((err) => {
          setError('Không thể tải thông tin danh mục để sửa.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [categoryId, isEditMode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const payload: CreateCategoryPayload | UpdateCategoryPayload = { name, description };

    try {
      if (isEditMode && categoryId) {
        await updateCategoryForAdmin(categoryId, payload as UpdateCategoryPayload);
        alert('Cập nhật danh mục thành công!');
      } else {
        await createCategoryForAdmin(payload as CreateCategoryPayload);
        alert('Thêm danh mục thành công!');
      }
      navigate('/admin/categories');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode ? 'Cập nhật thông tin danh mục' : 'Tạo một danh mục mới cho cửa hàng'}
          </p>
        </div>
        <Link
          to="/admin/categories"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên danh mục
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              placeholder="Nhập mô tả cho danh mục"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              to="/admin/categories"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-sm font-medium rounded-lg text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Cập nhật' : 'Tạo danh mục'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminCategoryFormPage;