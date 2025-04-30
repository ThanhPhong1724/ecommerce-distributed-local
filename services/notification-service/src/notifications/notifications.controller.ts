// src/notifications/notifications.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'; // Import các decorators cần thiết
import { NotificationsService } from './notifications.service';

@Controller() // Controller cho microservice không cần prefix
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // Đăng ký lắng nghe sự kiện có tên 'order_created'
  @MessagePattern('order_created')
  async handleOrderCreatedEvent(
    @Payload() data: any, // Dữ liệu nhận được từ message
    @Ctx() context: RmqContext // Context của RabbitMQ (chứa thông tin message gốc)
  ) {
    this.logger.log(`Received message for pattern: order_created`);
    const channel = context.getChannelRef(); // Lấy channel gốc
    const originalMsg = context.getMessage(); // Lấy message gốc

    try {
      // Gọi service để xử lý logic
      // Nên validate payload `data` ở đây trước khi xử lý
      await this.notificationsService.handleOrderCreated(data);

      // --- QUAN TRỌNG: Acknowledge a message ---
      // Báo cho RabbitMQ biết message đã được xử lý thành công
      // để RabbitMQ có thể xóa message khỏi queue.
      channel.ack(originalMsg);
      this.logger.log(`Acknowledged message for order: ${data.orderId}`);

    } catch (error) {
      this.logger.error(`Lỗi xử lý sự kiện order_created cho order ${data?.orderId}: ${error.message}`, error.stack);
      // --- Xử lý lỗi ---
      // Quyết định xem có nên Nack message để RabbitMQ thử gửi lại không?
      // Hoặc gửi vào Dead Letter Queue?
      // Hiện tại, chỉ log lỗi và không ack/nack (RabbitMQ sẽ giữ message và có thể gửi lại nếu cấu hình)
      // channel.nack(originalMsg, false, false); // Nack và không requeue
    }
  }

  // Có thể thêm các @MessagePattern khác ở đây để lắng nghe sự kiện khác
  // @MessagePattern('payment_processed')
  // async handlePaymentEvent(@Payload() data: any, @Ctx() context: RmqContext) { ... }
}