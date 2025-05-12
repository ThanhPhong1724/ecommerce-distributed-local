import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}

const ProfilePage: React.FC = () => {
  const { state } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Nguyễn Văn A',
    email: state.user?.email || '',
    phone: '0123456789',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-3xl p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold">
                      {profile.fullName[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                  <FiEdit2 className="w-4 h-4 text-purple-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                <p className="text-white/80">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="bg-white rounded-b-3xl shadow-sm p-8">
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin cá nhân
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) =>
                            setProfile({ ...profile, fullName: e.target.value })
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="form-input bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                      >
                        <FiX className="w-4 h-4 mr-2" />
                        Hủy
                      </button>
                      <button type="submit" className="btn-primary">
                        <FiSave className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                    >
                      <FiEdit2 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 2.5rem;
          border: 1px solid #E5E7EB;
          border-radius: 0.5rem;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .form-input:disabled {
          background-color: #F9FAFB;
          cursor: not-allowed;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(to right, #8B5CF6, #EC4899);
          color: white;
          font-weight: 500;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background-color: #F3F4F6;
          color: #4B5563;
          font-weight: 500;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background-color: #E5E7EB;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;