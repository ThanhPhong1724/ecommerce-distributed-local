// File: services/product-service/src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Import UserRole từ một vị trí chung.
// Nếu product-service không cần biết chi tiết User entity,
// chỉ cần enum UserRole là đủ.
// Giả sử bạn tạo file này: services/product-service/src/common/enums/user-role.enum.ts
import { UserRole } from '../../products/entities/user.entity'; // Import UserRole


// Interface định nghĩa cấu trúc payload bên trong JWT
// Nó phải khớp với những gì bạn đưa vào khi tạo token ở user-service
export interface JwtAccessPayload {
  sub: string; // Subject (thường là userId)
  email: string;
  role: UserRole; // Vai trò của người dùng
  iat?: number; // Issued at (thời điểm token được tạo)
  exp?: number; // Expiration time (thời điểm token hết hạn)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // Đặt tên strategy là 'jwt'
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    // Trong product-service, chúng ta có thể không cần inject UsersService
    // vì mục đích chính là xác thực token và lấy thông tin từ payload.
    // Nếu bạn muốn query DB để kiểm tra user tồn tại/trạng thái mỗi lần xác thực,
    // thì bạn sẽ cần một cách để product-service gọi user-service (ví dụ qua API hoặc gRPC)
    // hoặc chia sẻ module/entity User (không khuyến khích cho microservices độc lập).
    // Hiện tại, chúng ta sẽ giả định thông tin trong token là đủ tin cậy sau khi xác thực chữ ký.
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header 'Authorization: Bearer <token>'
      ignoreExpiration: false, // Không bỏ qua token đã hết hạn
      secretOrKey: configService.get<string>('JWT_SECRET'), // Lấy secret key từ biến môi trường
    });
    // Log để kiểm tra secret key (chỉ log một phần để bảo mật)
    const secret = configService.get<string>('JWT_SECRET');
    this.logger.log(`JwtStrategy initialized. JWT_SECRET used (partial): ${secret ? secret.substring(0,5) : 'NOT_SET'}...`);
    if (!secret) {
        this.logger.error('CRITICAL: JWT_SECRET is not set in environment variables for Product Service!');
    }
  }

  /**
   * Hàm này được Passport tự động gọi sau khi xác thực thành công chữ ký của token
   * và token chưa hết hạn.
   * `payload` là object đã được giải mã từ JWT.
   * Giá trị trả về từ hàm này sẽ được gán vào `request.user`.
   */
  async validate(payload: JwtAccessPayload): Promise<any> {
    this.logger.debug(`Validating JWT payload in ProductService: ${JSON.stringify(payload)}`);

    // Kiểm tra các trường bắt buộc trong payload
    if (!payload || !payload.sub || !payload.role) {
      this.logger.warn('Invalid token payload received:', payload);
      throw new UnauthorizedException('Invalid token payload.');
    }

    // Trả về object chứa thông tin user sẽ được gắn vào `req.user`
    // Các Guard (như AdminGuard) sẽ sử dụng thông tin này.
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}