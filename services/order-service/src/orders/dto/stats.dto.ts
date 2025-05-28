// File: services/order-service/src/orders/dto/stats.dto.ts
import { IsOptional, IsDateString } from 'class-validator';

export class DailyOrderStatsDto {
  todayRevenue: number;
  newOrdersToday: number;
  productsSoldToday: number;
}

export class RevenueDataPointDto { // Đổi tên để phân biệt với interface frontend
  date: string; // YYYY-MM-DD (Ngày)
  name: string; // Tên hiển thị cho ngày (vd: T2, T3 hoặc dd/mm)
  revenue: number;
}

export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'startDate phải là ngày hợp lệ (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate phải là ngày hợp lệ (YYYY-MM-DD)' })
  endDate?: string;
}