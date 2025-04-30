import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ValidationPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common'; // Import thêm Cache...
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { CreateProductDto } from './products/dto/create-product.dto';
import { UpdateProductDto } from './products/dto/update-product.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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


  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateProductDto: UpdateProductDto) {
    // Hàm update trong service đã có logic xóa cache
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    // Hàm remove trong service đã có logic xóa cache
    return this.productsService.remove(id);
  }
}