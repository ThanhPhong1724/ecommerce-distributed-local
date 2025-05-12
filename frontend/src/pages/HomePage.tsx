import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productApi';
import { getCategories } from '../services/categoryApi';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import AOS from 'aos';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiCreditCard } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "aos/dist/aos.css";

import summerCollectionImg from "../assets/images/hero/summer-collection.jpg";
import winterCollectionImg from "../assets/images/hero/winter-collection.jpg";
import accessoriesImg from "../assets/images/hero/accessories.jpg";

import './../assets/styles/HomePage.css';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  img: string;
  categoryId: string;
  discount?: number;
  originalPrice?: number;
}

interface Category {
  id: string;
  name: string;
  img: string;
}

const ProductSliderArrow = ({ direction, onClick }: { direction: 'prev' | 'next'; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`
      absolute top-1/2 z-10 -translate-y-1/2
      ${direction === 'prev' ? 'left-2 md:-left-5' : 'right-2 md:-right-5'}
      w-10 h-10 rounded-full
      bg-white shadow-lg hover:shadow-xl
      flex items-center justify-center
      text-gray-600 hover:text-brand-primary
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-brand-primary
      group
    `}
    aria-label={direction === 'prev' ? 'Previous' : 'Next'}
  >
    <FiArrowRight 
      className={`w-5 h-5 ${direction === 'prev' ? 'rotate-180' : ''} 
      transition-transform group-hover:scale-110`} 
    />
  </button>
);

const heroSlides = [
  {
    image: summerCollectionImg,
    title: "Bộ Sưu Tập Hè 2025",
    description: "Khám phá những xu hướng mới nhất với thiết kế độc đáo",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products?collection=summer-2025"
  },
  {
    image: winterCollectionImg,
    title: "BST Áo Khoác Mới",
    description: "Những mẫu áo khoác thời thượng nhất mùa này",
    buttonText: "Xem Bộ Sưu Tập",
    buttonLink: "/products?collection=summer-2025"
  },
  {
    image: accessoriesImg,
    title: "Phụ Kiện Cao Cấp",
    description: "Hoàn thiện phong cách của bạn",
    buttonText: "Mua Sắm Ngay",
    buttonLink: "/products?collection=summer-2025"
  }
];

const features = [
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: "Miễn phí vận chuyển",
    description: "Cho đơn hàng từ 499k"
  },
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Bảo hành 30 ngày",
    description: "Đổi trả dễ dàng"
  },
  {
    icon: <FiCreditCard className="w-6 h-6" />,
    title: "Thanh toán an toàn",
    description: "Bảo mật thông tin"
  },
  {
    icon: <FiShoppingBag className="w-6 h-6" />,
    title: "Quà tặng hấp dẫn",
    description: "Cho thành viên VIP"
  }
];

const CustomArrow = ({ direction, onClick }: { direction: 'prev' | 'next'; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 z-10 -translate-y-1/2 ${
      direction === 'prev' ? 'left-4' : 'right-4'
    } w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center text-white`}
  >
    <FiArrowRight className={`w-6 h-6 ${direction === 'prev' ? 'rotate-180' : ''}`} />
  </button>
);

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  fade: true,
  cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
  pauseOnHover: true,
  arrows: true,
  prevArrow: <CustomArrow direction="prev" />,
  nextArrow: <CustomArrow direction="next" />,
  appendDots: (dots: React.ReactNode) => (
    <div style={{ position: 'absolute', bottom: '2rem' }}>
      <ul className="flex justify-center gap-2">{dots}</ul>
    </div>
  ),
  customPaging: () => (
    <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-colors duration-200" />
  ),
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false
      }
    }
  ]
};

const getCategoryColor = (categoryName: string): string => {
  const colorMap: { [key: string]: string } = {
    'Áo': 'from-blue-500 to-blue-700',
    'Quần': 'from-red-500 to-red-700',
    'Váy': 'from-purple-500 to-purple-700',
    'Phụ Kiện': 'from-red-500 to-red-700'
  };
  return colorMap[categoryName] || 'from-gray-500 to-gray-700'; // Default color
};

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50,
    });

    const fetchData = async () => {
      try {
        const [products, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        // Transform the products to match your component's Product type
        const transformedProducts = products.map(product => ({
          ...product,
          imageUrl: product.img || '/default-image.jpg' // Adjust based on your API response
        }));
        setFeaturedProducts(products.slice(0, 8));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sectionTitleClasses = "text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12";

  const productSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <ProductSliderArrow direction="prev" />,
    nextArrow: <ProductSliderArrow direction="next" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative h-[calc(100vh-4rem)] min-h-[400px] max-h-[700px]">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
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
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="flex-shrink-0 p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className={sectionTitleClasses}>Danh Mục Nổi Bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[3/4]"
            >
              <img
                src={category.img}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t opacity-60 transition-opacity duration-300 group-hover:opacity-70 ${
                getCategoryColor(category.name)
              }`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                <Link
                  to={`/products?category=${category.id}`}
                  className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-white/30 transition-colors duration-300"
                >
                  Khám phá
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16 overflow-hidden">
        <h2 className={sectionTitleClasses}>Sản Phẩm Nổi Bật</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <Slider {...productSliderSettings} className="featured-products-slider -mx-2">
            {featuredProducts.map((product) => (
              <div key={product.id} className="px-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <Link 
                    to={`/products/${product.id}`} 
                    className="block relative aspect-w-1 aspect-h-1 w-full h-64" // Thêm h-64 để fix chiều cao
                  >
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                        -{product.discount}%
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-brand-primary">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {product.originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 bg-brand-primary text-white rounded-full font-semibold hover:bg-brand-secondary transition-all duration-300 group"
          >
            Xem Tất Cả Sản Phẩm
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-24 overflow-hidden mt-16 mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/20">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-100 text-transparent bg-clip-text"
              >
                Đăng Ký Nhận Ưu Đãi
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-white/90 mb-8"
              >
                Nhận ngay voucher giảm giá <span className="font-bold text-pink-300">100.000đ</span> cho đơn hàng đầu tiên
              </motion.p>
            </div>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8"
            >
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full pl-12 pr-6 py-4 rounded-full bg-white/10 text-white placeholder-gray-300 border-2 border-white/30 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 outline-none transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
              >
                Đăng Ký Ngay
              </button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center text-white/70 text-sm space-y-2"
            >
              <p>
                Bằng cách đăng ký, bạn đồng ý với
              </p>
              <p>
                <Link to="/terms" className="text-pink-300 hover:text-pink-200 transition-colors underline">
                  Điều khoản dịch vụ
                </Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-pink-300 hover:text-pink-200 transition-colors underline">
                  Chính sách bảo mật
                </Link>
                {' '}của chúng tôi
              </p>
            </motion.div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-3xl opacity-20" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

