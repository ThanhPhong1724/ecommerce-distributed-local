// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users.service'; // Import UsersService nếu cần lấy thêm thông tin user

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // Kế thừa từ passport-jwt
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // Inject nếu cần lấy thêm thông tin user từ DB
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header Authorization: Bearer <token>
      ignoreExpiration: false, // Không bỏ qua token hết hạn
      secretOrKey: configService.get<string>('JWT_SECRET'), // Lấy secret key từ env
    });
  }

  // Hàm này sẽ tự động được gọi bởi JwtAuthGuard khi endpoint được bảo vệ
  // payload là nội dung đã được giải mã từ JWT (mà ta đã tạo trong auth.service.login)
  async validate(payload: { sub: string; email: string }): Promise<any> {
     console.log(`JwtStrategy validating payload:`, payload); // Log để debug
    // Bạn có thể kiểm tra thêm xem user còn tồn tại trong DB không nếu cần
    // const user = await this.usersService.findOneById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('User không tồn tại');
    // }
    // Trả về thông tin user muốn gắn vào request.user
    // Chỉ trả về payload là đủ cho nhiều trường hợp
    return { userId: payload.sub, email: payload.email };
  }
}