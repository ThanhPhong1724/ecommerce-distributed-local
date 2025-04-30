// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailerModule } from '@nestjs-modules/mailer'; // <<< BỎ COMMENT IMPORT
import { ConfigModule, ConfigService } from '@nestjs/config'; // <<< BỎ COMMENT IMPORT
import { join } from 'path'; // <<< BỎ COMMENT IMPORT (nếu dùng template)
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'; // <<< Bỏ comment nếu dùng template Handlebars

@Module({
  imports: [
    ConfigModule, // <<< THÊM ConfigModule vào imports nếu chưa có
    // --- Cấu hình MailerModule ---
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Cần ConfigModule để đọc env
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'), // 'smtp.gmail.com'
          port: configService.get<number>('MAIL_PORT'), // 587
          secure: false, // <<< QUAN TRỌNG: false vì port 587 dùng STARTTLS (sẽ tự nâng cấp lên TLS)
          auth: {
            user: configService.get<string>('MAIL_USER'), // email của bạn
            pass: configService.get<string>('MAIL_PASS'), // mật khẩu ứng dụng
          },
          // --- Cấu hình TLS ---
          // Thường không cần cấu hình tường minh nếu dùng port 587 và secure: false
          // tls: {
          //   ciphers: 'SSLv3' // Một số trường hợp cần chỉ định
          // }
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'), // Lấy từ env
        },
        // --- Cấu hình Template (Nếu dùng) ---
        // template: {
        //   dir: join(__dirname, 'templates'), // Thư mục chứa file template (ví dụ: src/notifications/templates)
        //   adapter: new HandlebarsAdapter(), // Chọn adapter cho template engine
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
      inject: [ConfigService], // Inject ConfigService vào useFactory
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}