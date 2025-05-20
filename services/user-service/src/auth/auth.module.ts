// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthController } from '../auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PassportModule } from '@nestjs/passport'; // Import PassportModule
import { JwtModule } from '@nestjs/jwt';           // Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy'; // Sẽ tạo sau
import { LocalStrategy } from './strategies/local.strategy'; // Sẽ tạo sau

@Module({
  imports: [
    UsersModule, // Để AuthService có thể dùng UsersService
    PassportModule,
    ConfigModule, // Cần để đọc JWT_SECRET từ env
    JwtModule.registerAsync({ // Cấu hình JWT bất đồng bộ
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Đọc secret key từ env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '3600s'), // Đọc thời gian hết hạn từ env, mặc định 1h
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Đăng ký các providers và strategies
  exports: [AuthService],
})
export class AuthModule {}