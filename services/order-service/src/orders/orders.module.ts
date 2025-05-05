// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { ClientsModule, Transport } from '@nestjs/microservices'; // Import cho RabbitMQ client
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersController } from './../orders.controller';
import { OrdersService } from './../orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]), // Đăng ký Entities
    HttpModule, // Đăng ký HttpModule để inject HttpService
    ConfigModule, // Cần để đọc config cho RabbitMQ và Service URLs

    // Cấu hình RabbitMQ Client
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE', // Tên để inject client
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')!], // Lấy URL từ env
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}