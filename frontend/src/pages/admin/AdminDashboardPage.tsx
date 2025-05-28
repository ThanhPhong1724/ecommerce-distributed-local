// src/pages/admin/AdminDashboardPage.tsx
import React, { useState, useEffect, useCallback } from 'react'; // <<< Thêm useCallback
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Sector, // Thêm Sector cho active shape của PieChart
} from 'recharts';
import CountUp from 'react-countup';
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  ChartPieIcon,
  ExclamationCircleIcon,
  RefreshIcon,
} from '@heroicons/react/outline'; // Đảm bảo import đúng từ 'outline' hoặc 'solid' tùy theo version
import { motion } from 'framer-motion';
import {
  getDashboardDailySummary, DashboardDailySummary,
  getRevenueOverTimeChartData, RevenueDataPoint,
  getCategoryDistributionChartData, CategoryDistributionDataPoint
} from '../../services/dashboardApi';
import { format, subDays } from 'date-fns'; // <<< THÊM IMPORT NÀY

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value?: number;
  unit?: string;
  loading: boolean;
  error?: string | null;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, unit = '', loading, error }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 ease-in-out min-h-[130px] flex flex-col justify-between"
    >
        {error ? (
            <div className="flex flex-col items-center justify-center text-center h-full">
                <ExclamationCircleIcon className="w-8 h-8 text-red-400 mb-1" />
                <p className="text-xs font-medium text-red-600">{title}: Lỗi tải</p>
                <p className="text-xs text-gray-400 truncate max-w-full" title={error}>{String(error).substring(0,25)}...</p>
            </div>
        ) : loading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
        ) : (
            <>
                <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className={`p-2.5 bg-indigo-100 rounded-full`}>
                        <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
                <div className="mt-1">
                    <p className="text-3xl font-bold text-gray-800">
                        {value !== undefined && value !== null ? <CountUp end={value} separator="." duration={1.5} decimals={title.toLowerCase().includes('doanh thu') ? 0 : 0} /> : '-'}
                        {unit && <span className="text-sm font-medium text-gray-500 ml-1">{unit}</span>}
                    </p>
                </div>
            </>
        )}
    </motion.div>
);

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontWeight="bold" fontSize="14px">
            {payload.name}
        </text>
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
        <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize="12px">{`${value} (${(percent * 100).toFixed(0)}%)`}</text>
        </g>
    );
};


const AdminDashboardPage: React.FC = () => {
  const { state: authState } = useAuth();

  const [dailyStats, setDailyStats] = useState<DashboardDailySummary | null>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<RevenueDataPoint[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionDataPoint[]>([]);

  const [loadingDailyStats, setLoadingDailyStats] = useState(true);
  const [loadingWeeklyRevenue, setLoadingWeeklyRevenue] = useState(true);
  const [loadingCategoryDist, setLoadingCategoryDist] = useState(true);

  const [errorDailyStats, setErrorDailyStats] = useState<string | null>(null);
  const [errorWeeklyRevenue, setErrorWeeklyRevenue] = useState<string | null>(null);
  const [errorCategoryDist, setErrorCategoryDist] = useState<string | null>(null);

  const [activePieIndex, setActivePieIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };

  const fetchAllData = useCallback(async (showLoadingIndicators = true) => {
    if (showLoadingIndicators) {
        setLoadingDailyStats(true);
        setLoadingWeeklyRevenue(true);
        setLoadingCategoryDist(true);
    }
    setErrorDailyStats(null);
    setErrorWeeklyRevenue(null);
    setErrorCategoryDist(null);

    try {
        const statsPromise = getDashboardDailySummary()
            .then(data => setDailyStats(data))
            .catch(err => {
                console.error("Error fetching daily stats:", err);
                setErrorDailyStats(err.message || 'Lỗi tải thống kê ngày');
            });

        const today = new Date();
        const endDateApi = format(today, 'yyyy-MM-dd');
        const startDateApi = format(subDays(today, 6), 'yyyy-MM-dd');

        const revenuePromise = getRevenueOverTimeChartData(startDateApi, endDateApi)
            .then(data => setWeeklyRevenue(data))
            .catch(err => {
                console.error("Error fetching weekly revenue:", err);
                setErrorWeeklyRevenue(err.message || 'Lỗi tải doanh thu tuần');
            });

        const categoryPromise = getCategoryDistributionChartData()
            .then(data => setCategoryDistribution(data))
            .catch(err => {
                console.error("Error fetching category distribution:", err);
                setErrorCategoryDist(err.message || 'Lỗi tải phân bố danh mục');
            });

        await Promise.all([statsPromise, revenuePromise, categoryPromise]);

    } catch (err: any) {
        console.error("Lỗi tổng thể khi tải dữ liệu dashboard (should not happen if individual catches work):", err);
    } finally {
        if (showLoadingIndicators) {
            setLoadingDailyStats(false);
            setLoadingWeeklyRevenue(false);
            setLoadingCategoryDist(false);
        }
    }
  }, []);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-4 sm:p-6 lg:p-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản trị</h1>
          <p className="mt-1 text-sm text-gray-600">
            Xin chào, Quản trị viên {authState.user?.firstName || authState.user?.email}!
          </p>
        </div>
        <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchAllData(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            disabled={loadingDailyStats || loadingWeeklyRevenue || loadingCategoryDist}
        >
            <RefreshIcon className={`w-5 h-5 mr-2 ${(loadingDailyStats || loadingWeeklyRevenue || loadingCategoryDist) ? 'animate-spin' : ''}`} />
            Làm mới Dữ liệu
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={CurrencyDollarIcon} title="Doanh thu hôm nay" value={dailyStats?.todayRevenue} unit="VNĐ" loading={loadingDailyStats} error={errorDailyStats}/>
        <StatCard icon={ShoppingCartIcon} title="Đơn hàng mới" value={dailyStats?.newOrdersToday} loading={loadingDailyStats} error={errorDailyStats}/>
        <StatCard icon={UsersIcon} title="Khách hàng mới" value={dailyStats?.newUsersToday} loading={loadingDailyStats} error={errorDailyStats}/>
        <StatCard icon={ShoppingBagIcon} title="Sản phẩm đã bán" value={dailyStats?.productsSoldToday} loading={loadingDailyStats} error={errorDailyStats}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-xl shadow-xl min-h-[400px] flex flex-col"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUpIcon className="w-6 h-6 text-green-500 mr-2" />
            Doanh thu (7 ngày qua)
          </h3>
          {loadingWeeklyRevenue ? (
            <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
          ) : errorWeeklyRevenue ? (
            <div className="flex-grow flex items-center justify-center text-red-600 p-4 bg-red-50 rounded-md">{errorWeeklyRevenue}</div>
          ) : weeklyRevenue.length > 0 ? (
            <div className="flex-grow h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenue} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
                  <YAxis stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}Tr` : `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString('vi-VN')} VNĐ`, "Doanh thu"]}
                    labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                    itemStyle={{ color: '#6366f1' }}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',}}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">Không có dữ liệu doanh thu để hiển thị.</div>
          )}
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-xl min-h-[400px] flex flex-col"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ChartPieIcon className="w-6 h-6 text-purple-500 mr-2" />
            Phân bố Sản phẩm theo Danh mục
          </h3>
          {loadingCategoryDist ? (
            <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div></div>
          ) : errorCategoryDist ? (
            <div className="flex-grow flex items-center justify-center text-red-600 p-4 bg-red-50 rounded-md">{errorCategoryDist}</div>
          ) : categoryDistribution.length > 0 ? (
            <div className="flex-grow h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70} // Tăng innerRadius cho donut
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    paddingAngle={2}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none hover:opacity-90 transition-opacity cursor-pointer"/>
                    ))}
                  </Pie>
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={12} wrapperStyle={{fontSize: '13px', lineHeight: '20px'}} formatter={(value) => <span className="text-gray-700">{value}</span>}/>
                  <Tooltip formatter={(value: number, name: string) => [`${value} sản phẩm`, name]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">Không có dữ liệu phân bố danh mục.</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;