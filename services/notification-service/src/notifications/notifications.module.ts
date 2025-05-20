// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '@nestjs/config';
// HttpModule nếu cần gọi User Service để lấy email
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    HttpModule, // Thêm HttpModule nếu NotificationsService cần gọi API khác
    // MailerModule KHÔNG cần .forRootAsync() ở đây
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}