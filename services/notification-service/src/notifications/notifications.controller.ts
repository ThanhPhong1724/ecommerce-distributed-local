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
  // ... các trường khác
}


@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  private readonly notificationQueueName: string; // Lưu tên queue

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService, // Inject ConfigService
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
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'notification-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---

  // <<< SỬA LẠI PATTERN LÀ TÊN QUEUE >>>
  // Dùng MessagePattern vì nó linh hoạt hơn, có thể dùng cho cả emit và send
  @MessagePattern('notifications.queue') // <<< Pattern là tên queue vật lý đang lắng nghe
  // Nếu bạn chắc chắn chỉ dùng emit (one-way), @EventPattern vẫn dùng được
  // @EventPattern('notifications.queue')
  
  async handleIncomingEvents(
    @Payload() data: any, // Dữ liệu nhận được
    @Ctx() context: RmqContext // Context của RabbitMQ
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    // Khi dùng Default Exchange, routing key chính là tên queue
    const routingKey = originalMsg.fields.routingKey;
    const queueName = this.notificationQueueName; // Lấy tên queue đang nghe

    this.logger.log(`[Queue: ${queueName}] Received message with routing key [${routingKey}]`);
    this.logger.debug(`[Queue: ${queueName}] Payload:`, JSON.stringify(data)); // Log chi tiết payload khi debug

    try {
      this.logger.log('!!! Handler function called !!!');
      this.logger.debug(`[Queue: ${queueName}] Original message:`, originalMsg); // Log chi tiết message gốc

      // --- Phân loại sự kiện dựa trên payload hoặc routing key (nếu có cấu trúc) ---
      // Cách đơn giản: Dựa vào sự tồn tại của các trường đặc trưng
      if (routingKey === queueName && data && data.orderId && data.userId && data.items) {
          this.logger.log(`[Queue: ${queueName}] Detected 'order.created' event.`);
          await this.notificationsService.sendOrderConfirmationEmail(data as OrderCreatedPayload);
      } else if (routingKey === queueName && data && data.orderId /* && trường đặc trưng của payment */) {
           this.logger.log(`[Queue: ${queueName}] Detected 'payment.successful' event (assuming based on payload).`);
           // await this.notificationsService.sendPaymentSuccessEmail(data as PaymentPayload); // Bỏ comment nếu có sự kiện này
      } else {
           this.logger.warn(`[Queue: ${queueName}] Unknown or invalid event received with routing key [${routingKey}]. Payload:`, data);
           // Vẫn ack để tránh lặp lại message không xử lý được
      }

      // --- Acknowledge message ---
      channel.ack(originalMsg);
      this.logger.log(`[Queue: ${queueName}] Message acknowledged (Routing Key: ${routingKey}).`);

    } catch (error) {
      this.logger.error(`[Queue: ${queueName}] Error processing message (Routing Key: ${routingKey}): ${error.message}`, error.stack);
      // Tạm thời ack để tránh lặp lại khi dev
      channel.ack(originalMsg);
    }
  }
}