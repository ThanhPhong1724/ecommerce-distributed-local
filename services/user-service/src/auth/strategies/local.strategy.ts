// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth.service';
import { LoginUserDto } from '../../users/dto/login-user.dto'; // Import DTO để lấy kiểu dữ liệu

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) { // Kế thừa từ passport-local
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Chỉ định field dùng làm username (mặc định là 'username')
  }

  // Hàm này sẽ tự động được gọi bởi LocalAuthGuard khi endpoint được bảo vệ
  async validate(email: string, password: string): Promise<any> {
    console.log(`LocalStrategy validating user: ${email}`); // Log để debug
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log(`LocalStrategy validation failed for user: ${email}`);
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }
    console.log(`LocalStrategy validation successful for user: ${email}`);
    return user; // Trả về thông tin user (không có password) nếu thành công
                 // Thông tin này sẽ được gắn vào request.user
  }
}