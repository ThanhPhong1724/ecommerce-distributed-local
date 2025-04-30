// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module'; // Sẽ tạo module này
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    NotificationsModule, // Import module chính
  ],
  controllers: [],
  providers: [NotificationsService],
})
export class AppModule {}