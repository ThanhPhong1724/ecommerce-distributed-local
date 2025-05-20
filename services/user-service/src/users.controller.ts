// src/users/users.controller.ts
import { Controller, Get, UseGuards, Request, Logger, Post, Body, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Sẽ tạo guard này
import { Public } from './auth/decorators/public.decorator'; // Decorator đánh dấu public route
import { AdminGuard } from './auth/guards/admin.guard'; 
import { UserPayload } from './users/interfaces/user-payload.interface';

@Controller('users') // Route prefix là /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- THÊM @Public() VÀO ĐÂY ---
  @Public() // <<< Đánh dấu endpoint này không cần JWT
  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'user-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---
  
  // Endpoint đăng ký user mới
  @Public() // Đánh dấu endpoint này không cần JWT
  @Post()
  // Sử dụng ValidationPipe để tự động validate body dựa trên CreateUserDto
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    console.log('Register request received:', createUserDto.email); // Log để debug
    const user = await this.usersService.create(createUserDto);
    console.log('User registered successfully:', user.email);
    return user; // Trả về thông tin user đã tạo (không có password)
  }

  // Endpoint lấy thông tin profile của user đang đăng nhập
  @UseGuards(JwtAuthGuard) // Sử dụng JwtStrategy để xác thực token và lấy payload
  @Get('profile')
  getProfile(@Request() req) {
    // Nếu JwtAuthGuard chạy thành công, req.user sẽ chứa payload từ JwtStrategy.validate
    console.log('Profile request received for user:', req.user); // Log để debug
    // Bạn có thể gọi UsersService để lấy thông tin đầy đủ hơn nếu cần
    // return this.usersService.findOneById(req.user.userId);
    return req.user; // Trả về thông tin từ token payload
  }

  // --- ENDPOINT MỚI CHO ADMIN ---
  @UseGuards(JwtAuthGuard, AdminGuard) // <<< Yêu cầu đăng nhập VÀ là Admin
  @Get('admin/all') // Route: /api/users/admin/all
  async getAllUsersForAdmin(): Promise<UserPayload[]> { // Trả về mảng UserPayload
    // this.logger.log('Admin request to get all users');
    console.log('Admin request to get all users');
    return this.usersService.findAllForAdmin(); // <<< Sẽ tạo hàm này trong service
  }
  // --- KẾT THÚC ENDPOINT ADMIN ---
}