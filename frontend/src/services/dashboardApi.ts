// src/services/dashboardApi.ts
import apiClient from './apiClient';
import axios, { AxiosError } from 'axios'; // Import AxiosError

// Interfaces cho dữ liệu thống kê trả về từ backend
// (Nên đồng bộ với DTOs ở backend)

export interface DailyOrderStats {
  todayRevenue: number;
  newOrdersToday: number;
  productsSoldToday: number;
}

export interface NewUsersTodayStats {
  newUsersToday: number;
}

// Kết hợp lại thành một interface cho tất cả số liệu của Stat Cards
export interface DashboardDailySummary {
  todayRevenue: number;
  newOrdersToday: number;
  productsSoldToday: number;
  newUsersToday: number;
  // Thêm các trường cho % thay đổi nếu backend hỗ trợ
  // revenueChangePercent?: number;
  // ordersChangePercent?: number;
}

export interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  name: string; // Tên hiển thị cho ngày (vd: T2, T3 hoặc dd/MM)
  revenue: number;
}

export interface CategoryDistributionDataPoint {
  name: string; // Tên danh mục
  value: number; // Số lượng sản phẩm
}

/**
 * Lấy dữ liệu thống kê tổng hợp cho các Stat Cards trên Dashboard.
 * Gọi song song nhiều API và kết hợp kết quả.
 */
export const getDashboardDailySummary = async (): Promise<DashboardDailySummary> => {
  console.log('dashboardApi: Fetching daily summary stats...');
  try {
    // Gọi song song các API lấy số liệu
    const [orderStatsResponse, userStatsResponse] = await Promise.all([
      apiClient.get<DailyOrderStats>('/admin/stats/orders/daily-summary'),
      apiClient.get<NewUsersTodayStats>('/admin/stats/users/today-new-count')
    ]);

    if (!orderStatsResponse?.data || !userStatsResponse?.data) {
        throw new Error('Dữ liệu thống kê trả về không đầy đủ.');
    }

    console.log('dashboardApi: Order Stats Received:', orderStatsResponse.data);
    console.log('dashboardApi: User Stats Received:', userStatsResponse.data);

    return {
      todayRevenue: orderStatsResponse.data.todayRevenue,
      newOrdersToday: orderStatsResponse.data.newOrdersToday,
      productsSoldToday: orderStatsResponse.data.productsSoldToday,
      newUsersToday: userStatsResponse.data.newUsersToday,
    };
  } catch (error) {
    console.error("dashboardApi: Lỗi khi lấy thống kê hàng ngày tổng hợp:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};

/**
 * Lấy dữ liệu doanh thu theo khoảng thời gian (mặc định 7 ngày qua nếu backend hỗ trợ).
 */
export const getRevenueOverTimeChartData = async (startDate?: string, endDate?: string): Promise<RevenueDataPoint[]> => {
  console.log(`dashboardApi: Fetching revenue over time. Start: ${startDate}, End: ${endDate}`);
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get<RevenueDataPoint[]>('/admin/stats/orders/revenue-over-time', { params });
    console.log('dashboardApi: Weekly Revenue Data Received:', response.data);
    return response.data;
  } catch (error) {
    console.error("dashboardApi: Lỗi khi lấy doanh thu theo thời gian:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};

/**
 * Lấy dữ liệu phân bố sản phẩm theo danh mục.
 */
export const getCategoryDistributionChartData = async (): Promise<CategoryDistributionDataPoint[]> => {
  console.log('dashboardApi: Fetching category distribution data...');
  try {
    const response = await apiClient.get<CategoryDistributionDataPoint[]>('/admin/stats/products/category-distribution');
    console.log('dashboardApi: Category Distribution Data Received:', response.data);
    return response.data;
  } catch (error) {
    console.error("dashboardApi: Lỗi khi lấy phân bố danh mục:", error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      throw axiosError.response?.data || axiosError;
    }
    throw error;
  }
};