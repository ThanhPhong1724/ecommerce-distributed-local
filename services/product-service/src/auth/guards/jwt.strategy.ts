// services/product-service/src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../products/entities/user.entity'; // Import UserRole


export interface JwtPayload {
  sub: string; // Thường là userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // <<< Quan trọng: Đặt tên strategy là 'jwt'
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    // Không cần UsersService ở đây nếu chỉ validate token
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    this.logger.log(`JWT_SECRET used: ${configService.get<string>('JWT_SECRET')?.substring(0,5)}...`);
  }

  async validate(payload: JwtPayload): Promise<any> {
    this.logger.debug(`Validating JWT payload: ${JSON.stringify(payload)}`);
    if (!payload || !payload.sub || !payload.role) {
        throw new UnauthorizedException('Invalid token payload');
    }
    // Trả về object sẽ được gán vào req.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}