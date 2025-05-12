import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiUserCheck, FiCreditCard } from 'react-icons/fi';

const TermsPage: React.FC = () => {
  const sections = [
    {
      icon: <FiUserCheck />,
      title: "1. Điều khoản sử dụng",
      content: `Bằng việc truy cập và sử dụng website của YourShop, bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện được quy định dưới đây. Nếu bạn không đồng ý với bất kỳ phần nào của những điều khoản này, vui lòng không sử dụng website của chúng tôi.`
    },
    {
      icon: <FiShield />,
      title: "2. Chính sách bảo mật",
      content: `Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi thông tin cá nhân của bạn sẽ được mã hóa và bảo mật theo tiêu chuẩn quốc tế. Chúng tôi không chia sẻ thông tin của bạn cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý.`
    },
    {
      icon: <FiCreditCard />,
      title: "3. Chính sách thanh toán",
      content: `Chúng tôi chấp nhận nhiều hình thức thanh toán khác nhau bao gồm: thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, và thanh toán qua các cổng thanh toán trực tuyến được cấp phép. Mọi giao dịch đều được bảo mật và mã hóa.`
    },
    {
      icon: <FiLock />,
      title: "4. Quyền sở hữu trí tuệ",
      content: `Tất cả nội dung trên website bao gồm nhưng không giới hạn ở text, đồ họa, logo, biểu tượng, hình ảnh, clip âm thanh, bản nhạc, bản quyền số và phần mềm đều là tài sản của YourShop hoặc các đối tác cung cấp nội dung cho chúng tôi.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Điều khoản & Điều kiện
          </h1>
          <p className="text-gray-600">
            Cập nhật lần cuối: 12/05/2025
          </p>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-xl">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl"
        >
          <h3 className="text-2xl font-semibold mb-4">
            Bạn cần hỗ trợ thêm?
          </h3>
          <p className="text-gray-600 mb-6">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:shadow-lg transition-shadow duration-300">
            Liên hệ hỗ trợ
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;