// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './users/entities/user.entity';
import { UserPayload } from './users/interfaces/user-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, // Inject JwtService để tạo token
  ) {}

  // Hàm này được LocalStrategy gọi để xác thực user
  async validateUser(email: string, pass: string): Promise<UserPayload | null> { 
    const user = await this.usersService.findOneByEmail(email);
    // So sánh password nhập vào với password đã hash trong DB
    if (user && await user.validatePassword(pass)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user; // Trả về user không có password
        return result;
    }
    return null; // Xác thực thất bại
  }

  // Hàm này được AuthController gọi sau khi LocalStrategy xác thực thành công
  async login(user: UserPayload) {
    // Payload chứa thông tin muốn đưa vào token (không nên chứa thông tin nhạy cảm)
    const payload = { email: user.email, sub: user.id }; // sub là subject, thường là user id
    return {
      access_token: this.jwtService.sign(payload), // Tạo JWT
    };
  }
}