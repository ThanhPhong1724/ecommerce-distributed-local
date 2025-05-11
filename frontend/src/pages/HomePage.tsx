import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import AOS from 'aos';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "aos/dist/aos.css";

// Ví dụ: import icon nếu cần
// import { ChevronRightIcon } from '@heroicons/react/solid';

const heroSlides = [
  {
    image: "https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf9yjzslq49u38",
    title: "Thời Trang Phong Cách",
    description: "Bộ sưu tập mùa hè 2025",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?collection=summer-2025"
  },
  {
    image: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-loxc0qdd6v2v67.webp",
    title: "Xu Hướng Mới Nhất",
    description: "Khám phá các mẫu áo khoác thời thượng",
    buttonText: "Xem Áo Khoác",
    buttonLink: "/products?category=jackets"
  },
  // Thêm nhiều slides khác
];

const categories = [
  {
    name: "Áo",
    image: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-loxc0qddchcna6.webp",
    link: "/products?category=ao"
  },
  {
    name: "Quần",
    image: "https://down-vn.img.susercontent.com/file/cn-11134207-7r98o-loxc0qdd89nb2c.webp",
    link: "/products?category=quan"
  },
  {
    name: "Váy",
    image: "https://images.unsplash.com/photo-1595905980087-appyc1dba9a8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGRyZXNzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60", // Thay ảnh thật
    link: "/products?category=vay"
  },
  {
    name: "Phụ Kiện",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWNjZXNzb3JpZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60", // Thay ảnh thật
    link: "/products?category=phu-kien"
  }
];

// Bạn nên tạo interface/type cho sản phẩm nổi bật
interface FeaturedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  link: string;
}

const featuredProducts: FeaturedProduct[] = [
  { id: '1', name: 'Áo Thun Basic Cotton', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60', price: 250000, link: '/products/ao-thun-basic' },
  { id: '2', name: 'Quần Jeans Slimfit', image: 'https://images.unsplash.com/photo-1602293589930-4535de560201?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8amVhbnN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60', price: 550000, oldPrice: 650000, link: '/products/quan-jeans-slimfit' },
  // Thêm sản phẩm
];

const HomePage: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800, // Giảm nhẹ duration
      once: true,
      offset: 50, // Điều chỉnh offset để animation kích hoạt sớm hơn một chút
    });
    // Refresh AOS on route change if needed, or when new content loads
    // AOS.refresh();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700, // Tăng tốc độ chuyển slide
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000, // Tăng thời gian hiển thị mỗi slide
    fade: true, // Thêm hiệu ứng fade
    cssEase: 'linear',
    pauseOnHover: true,
    arrows: false, // Ẩn nút next/prev mặc định, có thể custom sau
    responsive: [
        {
            breakpoint: 768, // Dưới 768px
            settings: {
                // arrows: false, // Có thể hiện arrows cho mobile nếu muốn
            }
        }
    ]
  };

  const sectionTitleClasses = "text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12";
  const cardBaseClasses = "relative group overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl";

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Hero Section */}
      <section className="relative">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative h-[calc(100vh-4rem)] min-h-[400px] max-h-[700px]"> {/* Chiều cao linh hoạt, 4rem là chiều cao Navbar */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"} // Ưu tiên tải ảnh slide đầu
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end items-center text-center p-6 sm:p-12">
                <div className="text-white max-w-2xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8"
                  >
                    {slide.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <Link
                      to={slide.buttonLink}
                      className="bg-brand-primary text-white px-6 py-3 sm:px-8 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-black/50 transition duration-300 inline-flex items-center group"
                    >
                      {slide.buttonText}
                      {/* <ChevronRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /> */}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Danh mục nổi bật */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className={sectionTitleClasses}>Danh Mục Nổi Bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={cardBaseClasses}
            >
              <Link to={category.link} className="block">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-colors duration-300 flex items-center justify-center p-4">
                  <h3 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold text-center">{category.name}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sản phẩm nổi bật (Nếu có) */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className={sectionTitleClasses}>Sản Phẩm Nổi Bật</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {featuredProducts.map((product) => (
              <div key={product.id} data-aos="fade-up" className="bg-white rounded-lg shadow-md overflow-hidden group transition-shadow hover:shadow-xl">
                <Link to={product.link} className="block">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
                     <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" loading="lazy"/>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-700 truncate group-hover:text-brand-primary">{product.name}</h3>
                    <div className="mt-1 flex items-baseline">
                        <p className="text-lg sm:text-xl font-semibold text-brand-primary">{product.price.toLocaleString('vi-VN')}₫</p>
                        {product.oldPrice && (
                            <p className="ml-2 text-sm text-gray-500 line-through">{product.oldPrice.toLocaleString('vi-VN')}₫</p>
                        )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
           <div className="text-center mt-12">
                <Link
                    to="/products"
                    className="bg-brand-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-secondary transition duration-300 text-base"
                >
                    Xem Tất Cả Sản Phẩm
                </Link>
            </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Đăng Ký Nhận Tin</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Nhận ngay voucher giảm giá và cập nhật những ưu đãi mới nhất!
          </p>
          <form className="max-w-lg mx-auto sm:flex sm:gap-4">
            <label htmlFor="email-newsletter" className="sr-only">Email</label>
            <input
              id="email-newsletter"
              type="email"
              placeholder="Nhập email của bạn..."
              required
              className="flex-1 w-full mb-3 sm:mb-0 px-5 py-3 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-purple-600"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-white text-brand-primary rounded-full font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition duration-300"
            >
              Đăng Ký
            </button>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-brand-dark text-gray-300 pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Về YourShop</h3>
              <p className="text-sm mb-4">Mang đến trải nghiệm mua sắm thời trang tuyệt vời với sản phẩm chất lượng và dịch vụ tận tâm.</p>
              {/* Thêm Logo nhỏ nếu muốn */}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Chính Sách</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/policy/shipping" className="hover:text-white">Chính sách giao hàng</Link></li>
                <li><Link to="/policy/returns" className="hover:text-white">Chính sách đổi trả</Link></li>
                <li><Link to="/policy/privacy" className="hover:text-white">Chính sách bảo mật</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white">Điều khoản dịch vụ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Liên Hệ</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: support@yourshop.com</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP HCM</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Kết Nối Với Chúng Tôi</h3>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white">
                  {/* <FacebookIcon className="h-6 w-6" /> */}
                  <span>FB</span> {/* Thay bằng icon */}
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white">
                  {/* <InstagramIcon className="h-6 w-6" /> */}
                  <span>IG</span> {/* Thay bằng icon */}
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white">
                  {/* <TwitterIcon className="h-6 w-6" /> */}
                  <span>TW</span> {/* Thay bằng icon */}
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} YourShop. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;