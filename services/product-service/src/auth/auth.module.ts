// services/product-service/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
// Không cần AuthService ở đây nếu product-service không cấp token

@Module({
  imports: [
    ConfigModule, // Đảm bảo ConfigModule được import (thường là global trong AppModule)
    PassportModule.register({ defaultStrategy: 'jwt' }), // Đăng ký strategy mặc định
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'), // Hoặc thời gian bạn muốn
        },
      }),
    }),
  ],
  providers: [JwtStrategy], // <<< QUAN TRỌNG: Cung cấp JwtStrategy
  exports: [PassportModule, JwtModule], // Export để các module khác có thể dùng
})
export class AuthModule {}