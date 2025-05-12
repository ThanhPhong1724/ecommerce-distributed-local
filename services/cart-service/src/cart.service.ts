// src/cart/cart.service.ts
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
  Logger, // <<< Import Logger
  Inject, // <<< Import Inject
  HttpStatus, // <<< Import HttpStatus
  HttpException,
  InternalServerErrorException, // <<< Import HttpException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { HttpService } from '@nestjs/axios'; // <<< Import HttpService
import { firstValueFrom, catchError } from 'rxjs'; // <<< Import firstValueFrom và catchError
import { Cart } from './cart/dto/cart.interface'; // <<< Sửa đường dẫn nếu cần
import { CartItem } from './cart/dto/cart-item.interface'; // <<< Sửa đường dẫn nếu cần
import { AddItemDto } from './cart/dto/add-item.dto'; // <<< Sửa đường dẫn nếu cần
import { Product } from './cart/interfaces/product.interface'; // <<< Import Product interface chung

interface RedisCart {
  userId: string;
  items: { productId: string; quantity: number }[];
}

@Injectable()
export class CartService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(CartService.name);
  private readonly productServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
     this.productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL')!;
     if (!this.productServiceUrl) {
       this.logger.error('PRODUCT_SERVICE_URL chưa được cấu hình!');
       throw new Error('Thiếu cấu hình URL cho Product Service.');
     }
  }

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    if (!redisHost || !redisPort) {
      throw new Error('REDIS_HOST hoặc REDIS_PORT chưa được cấu hình trong env!');
    }
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
    });

    this.redisClient.on('connect', () => this.logger.log('CartService connected to Redis'));
    this.redisClient.on('error', (error) => this.logger.error('Redis Connection Error:', error));
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('CartService disconnected from Redis');
    }
  }

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  // --- HÀM LẤY CHI TIẾT SẢN PHẨM (Tương tự OrderService) ---
  private async getProductDetails(productId: string): Promise<Product | null> {
    const url = `${this.productServiceUrl}/products/${productId}`;
    this.logger.debug(`Fetching product details from: ${url}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get<Product>(url).pipe(
          catchError((error) => {
            this.logger.warn(`Không thể lấy chi tiết sản phẩm ${productId}: ${error.response?.status} ${error.message}`);
            if (error.response?.status === HttpStatus.NOT_FOUND) {
                // Nếu sản phẩm không còn tồn tại, coi như nó không có trong giỏ nữa
                return [null]; // Trả về null trong Observable
            }
            // Ném lỗi khác để dừng quá trình
            throw new HttpException(error.response?.data?.message || 'Lỗi giao tiếp với Product Service', error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
          }),
        ),
      );
      // Kiểm tra response trước khi trả về data
      return response ? response.data : null;
    } catch (error) {
      // Bắt cả lỗi ném ra từ catchError
      this.logger.error(`Lỗi nghiêm trọng khi lấy sản phẩm ${productId}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) throw error; // Ném lại HttpException để Controller xử lý
      return null; // Trả về null nếu có lỗi khác
    }
  }
  // ------------------------------------------------------

  // <<< Hàm này bây giờ trả về Cart với đầy đủ chi tiết >>>
  async getCart(userId: string): Promise<Cart> {
    const cartKey = this.getCartKey(userId);
    const cartJson = await this.redisClient.get(cartKey);

    let baseCart: RedisCart = { userId, items: [] }; // <<< Dùng kiểu RedisCart
    if (cartJson) {
      try {
        const parsedCart = JSON.parse(cartJson);
        if (parsedCart && Array.isArray(parsedCart.items)) {
             baseCart = parsedCart as RedisCart;
        } else {
             this.logger.warn(`Dữ liệu giỏ hàng không hợp lệ trong Redis cho user ${userId}, tạo giỏ mới.`);
             await this.redisClient.del(cartKey); // Xóa key lỗi
        }
      } catch (error) {
        this.logger.error(`Lỗi parse JSON giỏ hàng cho user ${userId}:`, error);
        await this.redisClient.del(cartKey); // Xóa key lỗi
        baseCart = { userId, items: [] };
      }
    }

    this.logger.debug(`Fetching details for ${baseCart.items.length} items in cart for user ${userId}`);
    const productDetailPromises = baseCart.items.map(item => this.getProductDetails(item.productId));
    const productDetails = await Promise.all(productDetailPromises);

    const detailedItems: CartItem[] = baseCart.items
      .map((item, index) => {
        const details = productDetails[index];
        if (details) {
          return {
            productId: item.productId,
            quantity: item.quantity,
            name: details.name || 'Unknown Product', // Cung cấp giá trị mặc định
            price: details.price || 0, // Cung cấp giá trị mặc định nếu price là undefined
            img: details.img || null, // Cung cấp giá trị mặc định nếu img là undefined
          };
        }
        this.logger.warn(`Loại bỏ item ${item.productId} khỏi giỏ hàng user ${userId} vì không lấy được thông tin chi tiết.`);
        return null;
      })
      .filter((item): item is NonNullable<CartItem> => item !== null); // Loại bỏ null

    this.logger.log(`Trả về giỏ hàng chi tiết cho user ${userId} với ${detailedItems.length} items.`);
    // <<< Trả về kiểu Cart đầy đủ >>>
    return { userId, items: detailedItems };
  }

// <<< Hàm này lưu kiểu RedisCart (chỉ ID và số lượng) >>>
private async saveCart(cart: RedisCart): Promise<void> {
  const cartKey = this.getCartKey(cart.userId);
  await this.redisClient.set(cartKey, JSON.stringify(cart), 'EX', 86400);
  this.logger.debug(`Saved basic cart data to Redis for key: ${cartKey}`);
}

// <<< Hàm này trả về Cart đầy đủ >>>
async addItem(userId: string, addItemDto: AddItemDto): Promise<Cart> {
  const cartKey = this.getCartKey(userId);
  const cartJson = await this.redisClient.get(cartKey);
  // <<< Khai báo kiểu RedisCart >>>
  let currentCart: RedisCart = { userId, items: [] };
  if (cartJson) {
    try {
       const parsedCart = JSON.parse(cartJson);
       if (parsedCart && Array.isArray(parsedCart.items)) {
            currentCart = parsedCart as RedisCart;
       }
    } catch (e) { this.logger.error(`Lỗi parse giỏ hàng khi thêm item cho user ${userId}:`, e); }
  }

  const { productId, quantity } = addItemDto;
  const validQuantity = Math.max(1, quantity || 1);

  const productDetails = await this.getProductDetails(productId);
  if (!productDetails) {
      throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại.`);
  }

  const existingItemIndex = currentCart.items.findIndex(item => item.productId === productId);

  if (existingItemIndex > -1) {
    currentCart.items[existingItemIndex].quantity += validQuantity;
  } else {
    // <<< Không còn lỗi 'never' ở đây >>>
    currentCart.items.push({ productId, quantity: validQuantity });
  }

  await this.saveCart(currentCart);
  return this.getCart(userId); // Trả về giỏ hàng chi tiết
}

// <<< Hàm này trả về Cart đầy đủ >>>
async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cartKey = this.getCartKey(userId);
    const cartJson = await this.redisClient.get(cartKey);
    if (!cartJson) { throw new NotFoundException(`Giỏ hàng không tồn tại.`); }

    let currentCart: RedisCart; // <<< Dùng RedisCart
    try {
        const parsedCart = JSON.parse(cartJson);
        if (parsedCart && Array.isArray(parsedCart.items)) {
             currentCart = parsedCart as RedisCart;
        } else { throw new Error('Invalid cart data'); }
    } catch (e) { throw new InternalServerErrorException('Lỗi đọc giỏ hàng'); }

    const itemIndex = currentCart.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) { throw new NotFoundException(`Sản phẩm ${productId} không có trong giỏ hàng.`); }

    if (quantity <= 0) {
        currentCart.items.splice(itemIndex, 1);
    } else {
        // (Tùy chọn kiểm tra tồn kho)
        currentCart.items[itemIndex].quantity = quantity;
    }

    await this.saveCart(currentCart);
    return this.getCart(userId);
}

 // <<< Hàm này trả về Cart đầy đủ >>>
 async removeItem(userId: string, productId: string): Promise<Cart> {
  const cartKey = this.getCartKey(userId);
  const cartJson = await this.redisClient.get(cartKey);
  if (!cartJson) { return { userId, items: [] }; }

  let currentCart: RedisCart; // <<< Dùng RedisCart
  try {
      const parsedCart = JSON.parse(cartJson);
      if (parsedCart && Array.isArray(parsedCart.items)) {
           currentCart = parsedCart as RedisCart;
      } else { throw new Error('Invalid cart data'); }
  } catch (e) { throw new InternalServerErrorException('Lỗi đọc giỏ hàng'); }


  const initialLength = currentCart.items.length;
  currentCart.items = currentCart.items.filter(item => item.productId !== productId);

  if (currentCart.items.length < initialLength) {
      await this.saveCart(currentCart);
      this.logger.log(`Removed product ${productId} from cart ${cartKey}`);
  } else {
      this.logger.warn(`Product ${productId} not found in cart ${cartKey} during removal attempt.`);
  }
  return this.getCart(userId);
}


  // Xóa toàn bộ giỏ hàng (giữ nguyên)
  async clearCart(userId: string): Promise<void> {
    const cartKey = this.getCartKey(userId);
    const result = await this.redisClient.del(cartKey);
    this.logger.log(`Xóa cart key ${cartKey}, kết quả: ${result}`);
  }
}