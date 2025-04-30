// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer'; // <<< IMPORT MailerService
import { ConfigService } from '@nestjs/config'; // Import nếu cần đọc email đích

interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: { productId: string; quantity: number }[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailerService: MailerService, // <<< INJECT MailerService
    private readonly configService: ConfigService,
  ) {}

// src/notifications/notifications.service.ts
async handleOrderCreated(payload: OrderCreatedPayload) {
    this.logger.log(`Bước 1: Nhận được sự kiện order_created: Order ID ${payload.orderId}`);
    const recipientEmail = "yasuaola@gmail.com";
    const subject = `[${this.configService.get('MAIL_FROM', '').split('<')[0].trim()}] Xác nhận đơn hàng #${payload.orderId}`;
    const bodyText = `...`; // Nội dung mail
  
    this.logger.log(`Bước 2: Chuẩn bị gửi email đến ${recipientEmail}`);
    try {
      this.logger.log(`Bước 3: Bắt đầu gọi mailerService.sendMail`);
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: subject,
        text: bodyText,
      });
      this.logger.log(`Bước 4: Đã gửi email thành công cho đơn hàng ${payload.orderId}`); // <<< Log thành công
    } catch (error) {
      this.logger.error(`Bước 4 - LỖI: Lỗi gửi email cho đơn hàng ${payload.orderId}:`, error); // <<< Log lỗi tường minh
      // Rethrow lỗi để controller biết và không ack (hoặc xử lý khác)
      throw error;
    }
  }
}