// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Ctx, MessagePattern, Payload, RmqContext, EventPattern } from '@nestjs/microservices';

// Nên tạo các Interface/DTO chi tiết hơn cho từng loại payload
interface OrderPayload {
  orderId: string;
  userId: string; // Có thể cần gọi user-service để lấy email từ userId
  totalAmount: number;
  items: { productId: string; quantity: number; price: number; name: string }[];
  createdAt: string | Date;
  shippingAddress: string;
}

interface PaymentPayload {
  orderId: string;
  paymentMethod?: string; // Ví dụ
  transactionId?: string; // Ví dụ
  // Thêm các thông tin khác từ sự kiện payment
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly mailFrom: string;
  private readonly defaultRecipient = 'yasuaola@gmail.com'; // <<< Email mặc định để test

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
this.logger.log('!!! NotificationsService constructor CALLED !!!');
    this.logger.log('!!! NotificationsService constructor CALLED !!!');
    this.mailFrom = this.configService.get<string>('MAIL_FROM', 'noreply@example.com');
  }

  async sendOrderConfirmationEmail(payload: OrderPayload) {
    this.logger.log(`[order.created] Chuẩn bị gửi email xác nhận đơn hàng ${payload.orderId}`);

    // !!! TODO: Lấy email thật của user từ userId (cần gọi user-service)
    // Ví dụ: const userEmail = await this.getUserEmail(payload.userId);
    const recipientEmail = this.defaultRecipient; // <<< Tạm thời dùng email test

    const subject = `Xác nhận đơn hàng #${payload.orderId}`;

    // Xây dựng nội dung email (có thể dùng template engine như Handlebars)
    let bodyText = `Cảm ơn bạn đã đặt hàng!\n\n`;
    bodyText += `Mã đơn hàng: ${payload.orderId}\n`;
    bodyText += `Ngày đặt: ${new Date(payload.createdAt).toLocaleString('vi-VN')}\n`;
    bodyText += `Tổng tiền: ${payload.totalAmount.toLocaleString('vi-VN')} VNĐ\n`;
    bodyText += `Địa chỉ giao hàng: ${payload.shippingAddress}\n\n`;
    bodyText += `Chi tiết sản phẩm:\n`;
    payload.items.forEach(item => {
        bodyText += `- ${item.name} (x${item.quantity}) - ${ (item.price * item.quantity).toLocaleString('vi-VN')} VNĐ\n`;
    });
    bodyText += `\nChúng tôi sẽ thông báo khi đơn hàng được giao.`;

    // Tạo nội dung HTML (ví dụ)
    let bodyHtml = `<h1>Cảm ơn bạn đã đặt hàng!</h1>`;
    bodyHtml += `<p>Mã đơn hàng: <strong>${payload.orderId}</strong></p>`;
    // ... (Thêm nội dung HTML tương tự bodyText) ...

    try {
      this.logger.log(`[order.created] Gửi email đến ${recipientEmail} cho đơn hàng ${payload.orderId}`);
      await this.mailerService.sendMail({
        to: recipientEmail,
        from: this.mailFrom, // Lấy từ config
        subject: subject,
        text: bodyText,    // Nội dung dạng text
        html: bodyHtml,    // Nội dung dạng HTML
      });
      this.logger.log(`[order.created] Đã gửi email thành công cho đơn hàng ${payload.orderId}`);
    } catch (error) {
      this.logger.error(`[order.created] Lỗi gửi email cho đơn hàng ${payload.orderId}:`, error);
      throw error; // Ném lỗi để controller xử lý ack/nack
    }
  }

  async sendPaymentSuccessEmail(payload: PaymentPayload) {
    this.logger.log(`[payment.successful] Chuẩn bị gửi email thanh toán thành công cho đơn hàng ${payload.orderId}`);

    // !!! TODO: Lấy email thật của user (cần thêm userId vào payload payment)
    const recipientEmail = this.defaultRecipient; // <<< Tạm thời dùng email test

    const subject = `Thanh toán thành công cho đơn hàng #${payload.orderId}`;
    const bodyText = `Chúng tôi xác nhận đã nhận thanh toán thành công cho đơn hàng #${payload.orderId}.\nĐơn hàng của bạn đang được xử lý.`;
    // Thêm chi tiết thanh toán nếu có trong payload

    try {
      this.logger.log(`[payment.successful] Gửi email đến ${recipientEmail} cho đơn hàng ${payload.orderId}`);
      await this.mailerService.sendMail({
        to: recipientEmail,
        from: this.mailFrom,
        subject: subject,
        text: bodyText,
      });
      this.logger.log(`[payment.successful] Đã gửi email thành công cho đơn hàng ${payload.orderId}`);
    } catch (error) {
      this.logger.error(`[payment.successful] Lỗi gửi email cho đơn hàng ${payload.orderId}:`, error);
      throw error;
    }
  }

  // (Tùy chọn) Hàm helper để lấy email từ user-service
  // private async getUserEmail(userId: string): Promise<string | null> {
  //   try {
  //      // Cần inject HttpService và ConfigService để gọi API user-service
  //      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL'); // Thêm biến này vào env
  //      const response = await firstValueFrom(this.httpService.get<{ email: string }>(`${userServiceUrl}/users/${userId}/email`)); // Giả sử có endpoint này
  //      return response.data.email;
  //   } catch (error) {
  //      this.logger.error(`Không thể lấy email cho user ${userId}: ${error.message}`);
  //      return null; // Hoặc trả về email mặc định/admin email
  //   }
  // }
}