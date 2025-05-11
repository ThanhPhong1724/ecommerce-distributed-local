// src/orders/orders.service.ts
import { Injectable, Inject, Logger, NotFoundException, InternalServerErrorException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios'; // Import HttpService
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices'; // Import ClientProxy for RabbitMQ
import { firstValueFrom, catchError } from 'rxjs'; // Dùng để làm việc với Observable từ HttpService
import { Order, OrderStatus } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CreateOrderDto } from './orders/dto/create-order.dto';
import { Cart as CartInterface } from './orders/interfaces/cart.interface'; // Tạo interface này
import { Product as ProductInterface } from './orders/interfaces/product.interface'; // Tạo interface này

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private cartServiceUrl: string;
  private productServiceUrl: string;

  constructor(
    @InjectDataSource() private dataSource: DataSource, // Inject DataSource để dùng transaction
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    //@InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>, // Ko cần nếu dùng cascade
    private readonly httpService: HttpService, // Inject HttpService
    private readonly configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy, // Inject RabbitMQ Client
  ) {
    // Lấy URL của các service khác từ biến môi trường (sẽ thêm vào env và compose)
    this.cartServiceUrl = this.configService.get<string>('CART_SERVICE_URL')!;
    this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL')!;
    if (!this.cartServiceUrl || !this.productServiceUrl) {
      throw new Error('CART_SERVICE_URL hoặc PRODUCT_SERVICE_URL chưa được cấu hình!');
    }
  }

  // Hàm helper để gọi API service khác
  private async callService<T>(url: string, config: any = {}): Promise<T> {
    const method = config.method?.toLowerCase() || 'get';
    const { method: removedMethod, ...axiosConfig } = config;
    // Log token một cách an toàn
    const loggableHeaders = { ...axiosConfig.headers };
    if (loggableHeaders.Authorization) {
      loggableHeaders.Authorization = `${loggableHeaders.Authorization.substring(0, 15)}...[REDACTED]`;
    }
    this.logger.debug(`Calling [${method.toUpperCase()}] ${url}`, { data: axiosConfig.data, headers: loggableHeaders });

    try {
      let responseObservable;
      switch (method) {
        case 'post':
          responseObservable = this.httpService.post<T>(url, axiosConfig.data, axiosConfig);
          break;
        case 'put':
          responseObservable = this.httpService.put<T>(url, axiosConfig.data, axiosConfig);
          break;
        case 'patch': // <<< THÊM CASE CHO PATCH
          responseObservable = this.httpService.patch<T>(url, axiosConfig.data, axiosConfig);
          break;
        case 'delete':
          responseObservable = this.httpService.delete<T>(url, axiosConfig);
          break;
        default: // 'get'
          responseObservable = this.httpService.get<T>(url, axiosConfig);
          break;
      }

      const response = await firstValueFrom<AxiosResponse<T>>(
        responseObservable.pipe(
          catchError((error) => {
            const status = error.response?.status;
            const responseData = error.response?.data;
            const message = responseData?.message || error.message;

            this.logger.error(
              `Lỗi khi gọi [${method.toUpperCase()}] ${url}: Status ${status}, Message: ${message}`,
              responseData || error.stack // Log thêm chi tiết lỗi nếu có
            );

            throw new HttpException(
              { message: message || 'Lỗi giao tiếp với service khác', error: responseData?.error || 'Service Error', statusCode: status || HttpStatus.INTERNAL_SERVER_ERROR },
              status || HttpStatus.INTERNAL_SERVER_ERROR,
              { cause: error }
            );
          }),
        ),
      );
      return response.data as T;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Lỗi không xác định khi gọi ${url}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Lỗi không xác định khi gọi service: ${error.message}`);
    }

  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto, userToken: string): Promise<Order> {
    this.logger.log(`Bắt đầu tạo đơn hàng cho user: ${userId}`);

    // --- 1. Lấy giỏ hàng từ cart-service ---
    let cart: CartInterface;
    try {
      this.logger.debug('Token being sent to cart service:', userToken);
      cart = await this.callService<CartInterface>(`${this.cartServiceUrl}/cart`, {
        headers: {
          Authorization: `Bearer ${userToken}` // Sử dụng token của user thay vì JWT_SECRET
        }
      });
    } catch (error) {
      this.logger.error(`Không thể lấy giỏ hàng cho user ${userId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Giỏ hàng không tồn tại hoặc không thể truy cập.');
      }
      throw error;
    }

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống, không thể tạo đơn hàng.');
    }

    // --- 2. KIỂM TRA TỒN KHO VÀ CHUẨN BỊ DỮ LIỆU ĐƠN HÀNG ---
    this.logger.log(`[${userId}] === BƯỚC 2: KIỂM TRA TỒN KHO VÀ CHUẨN BỊ DỮ LIỆU ===`); // Đổi tên bước cho rõ ràng
    const orderItemsData: Partial<OrderItem>[] = [];
    const productStockUpdates: { productId: string; quantityChange: number }[] = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      let product: ProductInterface;
      const productUrl = `${this.productServiceUrl}/products/${item.productId}`;
      try {
        // Gọi API lấy thông tin sản phẩm (bao gồm cả stockQuantity)
        product = await this.callService<ProductInterface>(productUrl); // <<< Gọi API ở đây
        this.logger.log(`[${userId}] Kiểm tra SP ${item.productId}: Cần ${item.quantity}, Còn ${product.stockQuantity}`);
        // Kiểm tra tồn kho ngay tại đây
        if (product.stockQuantity < item.quantity) {
          // Nếu không đủ hàng, ném lỗi NGAY LẬP TỨC, không cần chạy tiếp
          throw new BadRequestException(`Sản phẩm "${product.name}" (ID: ${item.productId}) không đủ số lượng tồn kho (cần ${item.quantity}, còn ${product.stockQuantity}). Vui lòng cập nhật giỏ hàng.`);
        }
        // Nếu đủ hàng, chuẩn bị dữ liệu
        totalAmount += product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price, // Lưu giá tại thời điểm đặt hàng
          productName: product.name || 'Unknown Product', // Xử lý trường hợp tên SP null
        });
        productStockUpdates.push({ productId: item.productId, quantityChange: -item.quantity }); // quantityChange là số âm

      } catch (error) {
         this.logger.error(`[${userId}] Lỗi khi kiểm tra sản phẩm ${item.productId}: ${error.message}`);
         // Ném lại lỗi để dừng quá trình tạo đơn
         if (error instanceof HttpException) throw error;
         throw new InternalServerErrorException('Lỗi khi kiểm tra thông tin sản phẩm.');
      }
    }
    this.logger.log(`[${userId}] === KẾT THÚC KIỂM TRA TỒN KHO === OK. Tổng tiền: ${totalAmount}`);
    // --- KẾT THÚC BƯỚC 2 ---
    // --- 3. Sử dụng Transaction để lưu Order và OrderItems ---
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedOrder: Order;
    try {
      this.logger.log('Bắt đầu lưu đơn hàng vào DB...');
      const newOrder = new Order();
      newOrder.userId = userId;
      newOrder.totalAmount = totalAmount;
      newOrder.status = OrderStatus.PENDING; // Trạng thái chờ xử lý
      newOrder.shippingAddress = createOrderDto.shippingAddress ?? 'Default Address'; // Cung cấp giá trị mặc định nếu không có
      newOrder.items = orderItemsData.map(itemData => {
          const newItem = new OrderItem();
          Object.assign(newItem, itemData);
          return newItem;
      });

      savedOrder = await queryRunner.manager.save(Order, newOrder); // Lưu order và items (do cascade: true)
      this.logger.log(`Đã lưu Order ID: ${savedOrder.id}`);

      // !!! GỌI API GIẢM TỒN KHO BÊN TRONG TRANSACTION !!!
      this.logger.log(`[${userId}] === BƯỚC 3: TRANSACTION - Giảm tồn kho ===`);
      for (const update of productStockUpdates) {
          const updateStockUrl = `${this.productServiceUrl}/products/${update.productId}/stock`;
          try {
              // Gọi API PATCH của product-service
              await this.callService<any>(updateStockUrl, {
                  method: 'PATCH', // <<< Dùng PATCH
                  data: { change: update.quantityChange } // <<< Gửi { change: -số lượng }
              });
              this.logger.log(`[${userId}] Đã gửi yêu cầu giảm ${-update.quantityChange} tồn kho cho SP ${update.productId}`);
          } catch (error) {
              this.logger.error(`[${userId}] Lỗi nghiêm trọng khi gọi API giảm tồn kho SP ${update.productId}: ${error.message}`);
              // Nếu lỗi ở đây, toàn bộ transaction phải rollback
              throw new InternalServerErrorException(`Không thể cập nhật tồn kho cho sản phẩm ${update.productId}. Đơn hàng đã bị hủy.`);
          }
      }
      // --- KẾT THÚC GỌI API GIẢM TỒN KHO ---

      // --- (Tùy chọn - Thách thức Đồng bộ) Giảm tồn kho ---
      // Nếu muốn giảm tồn kho ngay lập tức, cần gọi API product-service ở đây
      // *Trong phạm vi transaction này là KHÓ và RỦI RO*.
      // Cách tốt hơn: Publish event và để product-service tự xử lý (Eventual Consistency)
      // this.logger.log('Giảm tồn kho sản phẩm...');
      // for (const item of savedOrder.items) {
      //    await this.callService<any>(`${this.productServiceUrl}/products/${item.productId}/decrement`, { method: 'PUT', data: { quantity: item.quantity } });
      // }

      await queryRunner.commitTransaction();
      this.logger.log(`Transaction commited cho Order ID: ${savedOrder.id}`);

    } catch (error) {
      this.logger.error(`Lỗi khi lưu đơn hàng hoặc giảm tồn kho: ${error.message}`, error.stack);
      await queryRunner.rollbackTransaction();
      this.logger.log('Transaction rolled back.');
      // Ném lỗi cụ thể hơn nếu có thể
      throw new InternalServerErrorException('Không thể tạo đơn hàng do lỗi hệ thống.');
    } finally {
      // Luôn giải phóng queryRunner
      await queryRunner.release();
      this.logger.log('Query runner released.');
    }

    // --- 4. (Quan trọng) Xóa giỏ hàng sau khi tạo đơn thành công ---
    try {
      this.logger.log(`Xóa giỏ hàng cho user: ${userId} sau khi tạo đơn ${savedOrder.id}`);
      // Thay vì /cart/:userId, CartService có endpoint DELETE /cart (không có param userId trong path, userId lấy từ token)
      await this.callService<void>(`${this.cartServiceUrl}/cart`, { // <<< SỬA URL VÀ KHÔNG CẦN TRUYỀN USERID TRONG PATH
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userToken}` // <<< TRUYỀN TOKEN ĐỂ CART SERVICE BIẾT USER NÀO
          }
      });
      this.logger.log(`Đã gửi yêu cầu xóa giỏ hàng cho user: ${userId}`);
    } catch (error) {
        // Kiểm tra nếu lỗi là 404 từ CartService thì có thể bỏ qua (giỏ hàng có thể đã được xóa bởi một cơ chế khác)
        if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) {
            this.logger.warn(`Không tìm thấy giỏ hàng user ${userId} để xóa (có thể đã được xóa): ${error.message}`);
        } else {
            this.logger.error(`Lỗi khi gửi yêu cầu xóa giỏ hàng cho user ${userId}: ${error.message}`, error instanceof Error ? error.stack : '');
            // Không nên rethrow lỗi ở đây để tránh fail cả flow nếu đơn hàng đã tạo thành công
        }
    }

      // --- 5. Publish sự kiện 'order.created' LÊN DEFAULT EXCHANGE ---
      try {
      // <<< TÊN QUEUE ĐÍCH MÀ NOTIFICATION SERVICE SẼ LẮNG NGHE >>>
      // Lấy tên queue từ biến môi trường hoặc dùng giá trị mặc định
      const targetQueue = this.configService.get<string>('RABBITMQ_NOTIFICATIONS_QUEUE', 'notifications.queue');

      // Chuẩn bị payload (nội dung message)
      const eventPayload = {
        orderId: savedOrder.id,
        userId: savedOrder.userId,
        totalAmount: savedOrder.totalAmount,
        // Lấy thông tin items từ savedOrder nếu cần (đảm bảo có sau khi save hoặc query lại)
        items: savedOrder.items?.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price, // Thêm giá nếu cần
            name: i.productName // Thêm tên nếu cần
        })) || [],
        createdAt: savedOrder.createdAt,
        shippingAddress: savedOrder.shippingAddress,
      };

      this.logger.log(`[${userId}] Chuẩn bị emit sự kiện đến queue '${targetQueue}' cho Order ID: ${savedOrder.id}`);

      // <<< Sử dụng tên queue làm pattern/routing key cho emit >>>
      // ClientProxy sẽ gửi message đến Default Exchange với routing key này
      this.rabbitClient.emit<string, any>(targetQueue, eventPayload);

      this.logger.log(`[${userId}] Đã emit sự kiện đến Default Exchange với routing key (tên queue) '${targetQueue}' cho Order ID: ${savedOrder.id}`);

    } catch (error) {
        // Lỗi này thường xảy ra nếu ClientProxy không kết nối được tới RabbitMQ
        // hoặc có vấn đề khi serialize payload.
        this.logger.error(`[${userId}] Lỗi khi emit sự kiện order_created cho order ${savedOrder.id}: ${error.message}`, error.stack);
        // Cân nhắc: Có nên dừng lại hay tiếp tục? Notification thường không critical bằng core logic.
    }
    // <<< KẾT THÚC ĐOẠN SỬA ĐỔI >>>


    // Trả về thông tin order đã lưu (có thể kèm items)
    // Cần query lại để lấy items nếu không dùng eager loading hoặc cascade không trả về đầy đủ
    return this.findOne(savedOrder.id, userId); // Query lại để đảm bảo có items
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'], // Lấy cả items
      order: { createdAt: 'DESC' }, // Sắp xếp mới nhất trước
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId }, // Đảm bảo user chỉ xem được order của mình
      relations: ['items'], // Lấy cả items
    });
    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tìm thấy hoặc bạn không có quyền xem.`);
    }
    return order;
  }

  // Thêm hàm cập nhật status (ví dụ khi payment thành công)
  // async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  //   const order = await this.orderRepository.findOneBy({ id: orderId });
  //   if (!order) {
  //       throw new NotFoundException(`Đơn hàng với ID ${orderId} không tìm thấy.`);
  //   }
  //   order.status = status;
  //   return this.orderRepository.save(order);
  // }

  // Trong orders.service.ts
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | undefined> { // Hoặc kiểu trả về phù hợp
    this.logger.log(`[updateOrderStatus] Attempting to update order ${orderId} to status ${status}`);
    // const order = await this.orderRepository.findOne({ where: { id: orderId } });
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items']  // Lấy thêm items để gửi thông báo
    });

    if (!order) {
      this.logger.error(`[updateOrderStatus] Order with ID ${orderId} not found.`);
      // Có thể ném lỗi hoặc xử lý tùy theo logic của bạn
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    this.logger.log(`[updateOrderStatus] Found order ${orderId}, current status: ${order.status}`);
    order.status = status;
    // Thêm các cập nhật khác nếu cần, ví dụ: paymentTransactionId, paymentTime
    try {
      const updatedOrder = await this.orderRepository.save(order);
      this.logger.log(`[updateOrderStatus] Successfully saved order ${orderId} with new status ${updatedOrder.status}`);
      // Nếu trạng thái là PROCESSING (đã thanh toán thành công)
      if (status === OrderStatus.PROCESSING) {
        // Chuẩn bị payload để gửi notification
        const notificationPayload = {
          orderId: order.id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.productName
          })),
          createdAt: order.createdAt,
          shippingAddress: order.shippingAddress,
          status: status,
          paymentStatus: 'SUCCESS'
        };

        // Emit event đến notification service
        this.logger.log(`[updateOrderStatus] Gửi thông báo cho đơn hàng ${orderId}`);
        this.rabbitClient.emit('notifications.queue', notificationPayload);
      }      
      return updatedOrder;
    } catch (error) {
      this.logger.error(`[updateOrderStatus] Failed to save order ${orderId} with new status: ${error.message}`, error.stack);
      throw error;
    }
  }

}

// Tạo thêm 2 file interface để định nghĩa kiểu dữ liệu trả về từ service khác
// src/interfaces/cart.interface.ts
import { CartItem as ImportedCartItem } from './orders/interfaces/cart-item.interface';
import { AxiosResponse } from 'axios';
export interface Cart { userId: string; items: ImportedCartItem[]; }

// src/interfaces/cart-item.interface.ts
export interface CartItem { productId: string; quantity: number; }

// src/interfaces/product.interface.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    // Thêm các trường khác nếu cần
}