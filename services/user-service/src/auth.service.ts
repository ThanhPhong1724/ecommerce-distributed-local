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
    // Nên gọi hàm lấy user đầy đủ thông tin bao gồm role
    const user = await this.usersService.findOneByEmailWithRole(email); 
    if (user && (await user.validatePassword(pass))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      // result sẽ bao gồm cả role từ user entity
      return result as UserPayload; // Ép kiểu nếu cần
    }
    return null;
  }

  // Hàm này được AuthController gọi sau khi LocalStrategy xác thực thành công
  async login(user: UserPayload) { // user ở đây đã là UserPayload, có trường role
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role, // <<< THÊM ROLE VÀO JWT PAYLOAD
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

}