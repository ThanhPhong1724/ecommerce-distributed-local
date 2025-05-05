// src/app.module.ts (trong notification-service)
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer'; // Import MailerModule
import { NotificationsModule } from './notifications/notifications.module'; // Sẽ tạo module này
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
;
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({ // Cấu hình MailerModule
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'), // ví dụ: 'smtp.gmail.com'
          port: configService.get<number>('MAIL_PORT'), // ví dụ: 587 hoặc 465
          secure: configService.get<string>('MAIL_SECURE', 'false') === 'true', // true cho port 465, false cho 587 (thường là STARTTLS)
          auth: {
            user: configService.get<string>('MAIL_USER'), // email của bạn
            pass: configService.get<string>('MAIL_PASS'), // mật khẩu ứng dụng hoặc mật khẩu email
          },
        },
        defaults: {
          from: `"${configService.get<string>('MAIL_FROM_NAME', 'No Reply')}" <${configService.get<string>('MAIL_FROM_ADDRESS') || configService.get<string>('MAIL_USER') || 'default@example.com'}>`, // Tên người gửi và địa chỉ
        },
        // --- Tùy chọn Template Engine (ví dụ Handlebars) ---
        // template: {
        //   dir: join(__dirname, 'templates'), // Thư mục chứa template
        //   adapter: new HandlebarsAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {}