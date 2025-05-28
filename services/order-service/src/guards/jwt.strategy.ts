// services/order-service/src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from './../orders/entities/user.entity'; // <<< Đường dẫn này quan trọng

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

    constructor(private readonly configService: ConfigService) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET')!, // <<< THÊM DẤU CHẤM THAN Ở ĐÂY
    });
    const secret = configService.get<string>('JWT_SECRET');
    this.logger.log(`JwtStrategy initialized for OrderService. JWT_SECRET (partial): ${secret ? secret.substring(0,5) : 'NOT_SET'}...`);
    if (!secret) {
        this.logger.error('CRITICAL: JWT_SECRET is not set in environment variables for Order Service!');
    }
  }

  async validate(payload: JwtAccessPayload): Promise<any> {
    this.logger.debug(`Validating JWT payload in OrderService: ${JSON.stringify(payload)}`);
    if (!payload || !payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid token payload in OrderService.');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}