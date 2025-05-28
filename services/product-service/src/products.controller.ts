import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ValidationPipe, UseInterceptors, ClassSerializerInterceptor, Logger } from '@nestjs/common'; // Import thêm Cache...
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { CreateProductDto } from './products/dto/create-product.dto';
import { UpdateProductDto } from './products/dto/update-product.dto';
import { UpdateStockDto } from './products/dto/update-stock.dto'; 
import { Put, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'; // Thêm HttpCode, HttpStatus
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // <<< Đường dẫn ví dụ
import { AdminGuard } from './auth/guards/admin.guard';   // <<< Đường dẫn ví dụ
import { CategoryDistributionDto } from './products/dto/stats.dto'; // Import DTO

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name); // <<< Thêm Logger
  
  constructor(private readonly productsService: ProductsService) {
    this.logger.debug('Available routes:');
    this.logger.debug('GET /products/category/:categoryId');
    this.logger.debug('GET /products/:id');
    this.logger.debug('GET /products');
  }
  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'products-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---

  // --- ENDPOINT CẬP NHẬT TỒN KHO ---
  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStockDto: UpdateStockDto,
  ): Promise<{ message: string; newStock: number }> { // Trả về thông báo và số lượng mới
    this.logger.log(`API: Received stock update for ${id}: change ${updateStockDto.change}`);
    const updatedProduct = await this.productsService.updateStock(id, updateStockDto.change);
    return {
        message: 'Cập nhật tồn kho thành công',
        newStock: updatedProduct.stockQuantity
    };
  }
  // --- KẾT THÚC ENDPOINT TỒN KHO ---

  
  @Post()
  create(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // --- ÁP DỤNG CACHING CHO GET ALL ---
  @UseInterceptors(CacheInterceptor) // Sử dụng interceptor để tự động cache response
  @CacheKey('products_list')      // Key cố định cho danh sách sản phẩm
  @CacheTTL(120)                  // Cache trong 120 giây
  @Get()
  findAll() {
    // Interceptor sẽ cache kết quả trả về từ hàm này
    return this.productsService.findAll();
  }

  // --- GET ONE KHÔNG DÙNG INTERCEPTOR (đã xử lý cache trong service) ---
  // Nếu muốn dùng Interceptor ở đây cũng được, nhưng phải bỏ logic cache trong service đi
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id); // Service tự xử lý cache
  }

  /* // --- CÁCH DÙNG CACHE INTERCEPTOR CHO GET ONE (thay thế logic trong service) ---
  @UseInterceptors(CacheInterceptor)
  @CacheKey(`product_${id}`) // Key động dựa trên id (cần đảm bảo id có trong scope) - Cách này khó hơn
  // Hoặc để Nest tự tạo key dựa trên URL: @CacheKey('product_detail') // Key chung, Nest sẽ thêm URL vào
  @CacheTTL(300) // Cache 5 phút
  @Get(':id')
  findOneUsingInterceptor(@Param('id', ParseUUIDPipe) id: string) {
     console.log(`Controller: Fetching product ${id} (will be cached by interceptor if not present)`);
     return this.productsService.findOneWithoutCache(id); // Cần tạo hàm này trong service nếu dùng interceptor
  }
  */

  @Get('category/:categoryId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache 5 phút
  async findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string) {
    this.logger.log(`Finding products for category ${categoryId}`);
    return this.productsService.findByCategory(categoryId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard) // <<< CHỈ ADMIN
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateProductDto: UpdateProductDto) {
    // Hàm update trong service đã có logic xóa cache
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard) // <<< CHỈ ADMIN
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    // Hàm remove trong service đã có logic xóa cache
    return this.productsService.remove(id);
  }
    
  // --- ADMIN STATS ENDPOINT (GỘP VÀO ĐÂY) ---
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/stats/category-distribution') // Route: /api/products/admin/stats/category-distribution
  async getCategoryDistributionForAdmin(): Promise<CategoryDistributionDto[]> {
    this.logger.log('API Admin: Get category distribution');
    return this.productsService.getCategoryProductCount();
  }
  // --- KẾT THÚC ADMIN STATS ---
}