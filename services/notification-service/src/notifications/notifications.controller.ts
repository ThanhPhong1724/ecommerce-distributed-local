// src/notifications/notifications.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'; // Có thể dùng cả MessagePattern hoặc EventPattern
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { Get, Post, Delete, Put, Body, Param, Request, ParseUUIDPipe, ValidationPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'; // Thêm HttpCode, HttpStatus
// Interface/DTO nên được định nghĩa ở một nơi chung hoặc import từ thư viện dùng chung
interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: { productId: string; quantity: number; price: number; name: string }[];
  createdAt: string | Date;
  shippingAddress: string;
}

interface PaymentPayload {
  orderId: string;
  paymentMethod: string;
  transactionId: string;
}

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  private readonly notificationQueueName: string;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('!!! NotificationsController constructor CALLED !!!');

    // Lấy tên queue từ config để đảm bảo nhất quán
    this.notificationQueueName = this.configService.get<string>('RABBITMQ_NOTIFICATIONS_QUEUE', 'notifications.queue');
  this.logger.log(`Controller initialized, listening on queue determined by config: ${this.notificationQueueName}`);
  }

  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    return { status: 'ok', service: 'notification-service' }; // Thêm tên service cho dễ nhận biết
  }

  @MessagePattern('notifications.queue')
  async handleIncomingEvents(
    @Payload() data: any, // Dữ liệu nhận được
    @Ctx() context: RmqContext // Context của RabbitMQ
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Received notification event:`, JSON.stringify(data));

      // Kiểm tra loại sự kiện dựa trên dữ liệu
      if (data.orderId && data.items && !data.paymentStatus) {
        // Đây là sự kiện tạo đơn hàng mới
        await this.notificationsService.sendOrderConfirmationEmail({
          orderId: data.orderId,
          userId: data.userId,
          totalAmount: parseFloat(data.totalAmount),
          items: data.items,
          createdAt: data.createdAt,
          shippingAddress: data.shippingAddress
        });
      } else if (data.orderId && data.paymentStatus === 'SUCCESS') {
        // Đây là sự kiện thanh toán thành công
        await this.notificationsService.sendPaymentSuccessEmail({
          orderId: data.orderId,
          paymentMethod: 'VNPay',
          transactionId: data.transactionId
        });
      }

      channel.ack(originalMsg);
      this.logger.log(`Successfully processed notification for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Error processing notification: ${error.message}`);
      channel.ack(originalMsg); // Hoặc nack tùy chiến lược xử lý lỗi
    }
  }
}