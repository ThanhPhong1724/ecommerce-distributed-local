// src/cart/cart.service.ts
import { Injectable, NotFoundException, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis'; // Import ioredis
import { Cart } from './cart/dto/cart.interface';
import { CartItem } from './cart/dto/cart-item.interface';
import { AddItemDto } from './cart/dto/add-item.dto';

@Injectable()
export class CartService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  // Kết nối tới Redis khi module khởi tạo
  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    if (!redisHost || !redisPort) {
      throw new Error('REDIS_HOST hoặc REDIS_PORT chưa được cấu hình trong env!');
    }
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      // Thêm các options khác nếu cần (password, db...)
    });

    this.redisClient.on('connect', () => console.log('CartService connected to Redis'));
    this.redisClient.on('error', (error) => console.error('Redis Connection Error:', error));
  }

  // Ngắt kết nối Redis khi module bị hủy
  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      console.log('CartService disconnected from Redis');
    }
  }

  // Hàm helper lấy key của giỏ hàng trong Redis
  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  // Lấy giỏ hàng từ Redis
  async getCart(userId: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId);
    const cartJson = await this.redisClient.get(cartKey);
    if (!cartJson) {
      // Nếu chưa có giỏ hàng, tạo giỏ hàng rỗng
      return { userId, items: [] };
    }
    try {
      return JSON.parse(cartJson) as Cart;
    } catch (error) {
      console.error("Lỗi parse JSON giỏ hàng:", error);
      // Xử lý lỗi, có thể trả về giỏ hàng rỗng hoặc xóa key lỗi
      await this.redisClient.del(cartKey);
      return { userId, items: [] };
    }
  }

  // Lưu giỏ hàng vào Redis
  private async saveCart(cart: Cart): Promise<void> {
    const cartKey = this.getCartKey(cart.userId);
    // Có thể set TTL (thời gian sống) cho giỏ hàng ở đây nếu muốn
    // Ví dụ: 1 ngày (86400 giây)
    await this.redisClient.set(cartKey, JSON.stringify(cart), 'EX', 86400);
  }

  // Thêm item vào giỏ hàng
  async addItem(userId: string, addItemDto: AddItemDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const { productId, quantity } = addItemDto;

    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // Nếu sản phẩm đã có, cộng thêm số lượng
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Nếu chưa có, thêm mới vào mảng items
      cart.items.push({ productId, quantity });
    }

    await this.saveCart(cart);
    return cart;
  }

  // Cập nhật số lượng item
  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
      const cart = await this.getCart(userId);
      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex === -1) {
          throw new NotFoundException(`Sản phẩm với ID ${productId} không có trong giỏ hàng.`);
      }

      if (quantity <= 0) {
          // Nếu số lượng <= 0, xóa item khỏi giỏ hàng
          cart.items.splice(itemIndex, 1);
      } else {
          cart.items[itemIndex].quantity = quantity;
      }

      await this.saveCart(cart);
      return cart;
  }


  // Xóa item khỏi giỏ hàng
  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item.productId !== productId);

    if (cart.items.length === initialLength) {
       throw new NotFoundException(`Sản phẩm với ID ${productId} không có trong giỏ hàng.`);
    }

    await this.saveCart(cart);
    return cart;
  }

  // Xóa toàn bộ giỏ hàng
  async clearCart(userId: string): Promise<void> {
    const cartKey = this.getCartKey(userId);
    const result = await this.redisClient.del(cartKey); // <<< Lấy kết quả trả về
    console.log(`Xóa cart key ${cartKey}, kết quả: ${result}`); // Log kết quả (1 nếu thành công, 0 nếu key ko tồn tại)
  }
}