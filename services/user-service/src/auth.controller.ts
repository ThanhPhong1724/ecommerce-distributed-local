// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard'; // Sẽ tạo guard này
import { LoginUserDto } from './users/dto/login-user.dto';
import { Public } from './auth/decorators/public.decorator'; // Decorator đánh dấu public route

@Controller('auth') // Route prefix là /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  // Endpoint đăng nhập
  @Public() // Đánh dấu endpoint này không cần JWT
  @UseGuards(LocalAuthGuard) // Sử dụng LocalStrategy để xác thực user/pass
  @Post('login')
  @HttpCode(HttpStatus.OK) // Trả về 200 OK thay vì 201 Created mặc định của POST
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) {
    // Nếu LocalAuthGuard chạy thành công, req.user sẽ chứa thông tin user từ LocalStrategy.validate
    console.log('Login request received for user:', req.user); // Log để debug
    return this.authService.login(req.user); // Gọi service để tạo token
  }
}