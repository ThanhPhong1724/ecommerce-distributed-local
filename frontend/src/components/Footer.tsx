import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Về YourShop</h3>
            <p className="text-gray-400 leading-relaxed">
              Mang đến trải nghiệm mua sắm thời trang tuyệt vời với sản phẩm chất lượng và dịch vụ tận tâm.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Chính Sách</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/policy/shipping" className="hover:text-white transition-colors">Chính sách giao hàng</Link></li>
              <li><Link to="/policy/returns" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/policy/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Liên Hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@yourshop.com</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP HCM</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Kết Nối Với Chúng Tôi</h3>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebookF className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} YourShop. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;