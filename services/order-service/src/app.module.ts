// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';         // Import
import { OrderItem } from './orders/entities/order-item.entity'; // Import
import { JwtStrategy } from './guards/jwt.strategy'; // <<< Import strategy của order-service
import { HttpModule } from '@nestjs/axios';
import { ClientsModule } from '@nestjs/microservices'; // Nếu dùng cho RabbitMQ
import { AuthModule } from './auth/auth.module'; // <<< IMPORT AUTHMODULE

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST')!,
        port: parseInt(configService.get<string>('DATABASE_PORT', '5432')!, 10),
        username: configService.get<string>('DATABASE_USER')!,
        password: configService.get<string>('DATABASE_PASSWORD')!,
        database: configService.get<string>('DATABASE_NAME')!,
        entities: [Order, OrderItem], // <<< THÊM ENTITIES MỚI
        synchronize: true,
        autoLoadEntities: true,
        logging: true,
      }),
    }),
    OrdersModule, // Import OrdersModule
    HttpModule, // Đảm bảo HttpModule được import nếu service có gọi API ngoài
    AuthModule, // <<< THÊM AUTHMODULE VÀO IMPORTS
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}