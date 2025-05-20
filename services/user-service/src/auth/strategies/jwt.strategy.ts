// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users.service'; // Import UsersService nếu cần lấy thêm thông tin user
import { UserRole } from '../../users/entities/user.entity'; // <<< Import UserRole

// Định nghĩa kiểu cho JWT Payload
interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole; // <<< Thêm role vào đây
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // Có thể không cần nếu không query DB ở đây
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> { // <<< Sử dụng JwtPayload
    this.logger.debug(`JwtStrategy validating payload:`, payload); // Thêm this.logger nếu đã khai báo logger

    // Không cần query DB lại nếu thông tin trong token đã đủ
    // const user = await this.usersService.findOneByIdWithRole(payload.sub);
    // if (!user || user.role !== payload.role) { // (Tùy chọn) Kiểm tra thêm role có khớp DB không
    //   throw new UnauthorizedException('Invalid token or user role changed.');
    // }

    // Trả về các thông tin cần thiết để gắn vào req.user
    return { userId: payload.sub, email: payload.email, role: payload.role }; // <<< TRẢ VỀ CẢ ROLE
  }
   // Thêm logger nếu chưa có
   private readonly logger = new Logger(JwtStrategy.name);
}
