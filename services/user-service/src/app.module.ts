// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule và ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';             // Import TypeOrmModule
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity'; // Import User entity
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // 1. Cấu hình ConfigModule để đọc biến môi trường (.env)
    // isGlobal: true giúp các module khác không cần import lại ConfigModule
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Chỉ định file env (dù Docker Compose truyền vào nhưng để đây cho rõ ràng)
    }),

    // 2. Cấu hình TypeOrmModule để kết nối Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Cần ConfigModule để đọc biến môi trường
      inject: [ConfigService],  // Inject ConfigService để sử dụng
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'), // Đọc từ env
        port: parseInt(configService.get<string>('DATABASE_PORT')!, 10), // Đọc từ env
        username: configService.get<string>('DATABASE_USER'), // Đọc từ env
        password: configService.get<string>('DATABASE_PASSWORD'), // Đọc từ env
        database: configService.get<string>('DATABASE_NAME'), // Đọc từ env
        entities: [User], // Liệt kê các Entity mà TypeORM cần quản lý
        synchronize: true, // !!! QUAN TRỌNG (Development): Tự động tạo/cập nhật schema DB dựa trên entities.
                           // !!! KHÔNG DÙNG TRONG PRODUCTION. Production dùng Migrations.
        autoLoadEntities: true, // Tự động load các entities được đăng ký qua forFeature
        logging: true, // Bật log SQL để dễ debug (có thể tắt sau)
      }),
    }),
    
    // 3. Import các module chức năng
    UsersModule,
    AuthModule,
  ],
  controllers: [], // Không cần controller ở đây
  providers: [
    // Đăng ký JwtAuthGuard làm guard mặc định cho toàn bộ ứng dụng
    // Các route muốn public thì phải dùng @Public() decorator
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],   
})
export class AppModule {}