import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiPackage, FiHeart } from 'react-icons/fi';

const AboutPage: React.FC = () => {
  const stats = [
    {
      icon: <FiUsers className="w-6 h-6" />,
      value: "10K+",
      label: "Khách hàng tin tưởng"
    },
    {
      icon: <FiPackage className="w-6 h-6" />,
      value: "50K+",
      label: "Sản phẩm đã bán"
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      value: "5+",
      label: "Năm kinh nghiệm"
    },
    {
      icon: <FiHeart className="w-6 h-6" />,
      value: "99%",
      label: "Khách hàng hài lòng"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Về YourShop
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Chúng tôi tin rằng thời trang không chỉ là về quần áo - đó là về việc thể hiện cá tính và sự tự tin của bạn.
              YourShop ra đời với sứ mệnh mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý.
            </p>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold mb-4">Chất lượng</h3>
              <p className="text-gray-600">
                Chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất,
                được tuyển chọn kỹ lưỡng từ các nhà cung cấp uy tín.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold mb-4">Dịch vụ</h3>
              <p className="text-gray-600">
                Đội ngũ chăm sóc khách hàng tận tâm, sẵn sàng hỗ trợ bạn
                24/7 với mọi thắc mắc và nhu cầu.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold mb-4">Sáng tạo</h3>
              <p className="text-gray-600">
                Không ngừng đổi mới và cập nhật xu hướng thời trang mới nhất
                để đáp ứng nhu cầu của khách hàng.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;