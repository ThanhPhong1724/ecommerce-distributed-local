import { Injectable, NotFoundException, Inject, Logger, BadRequestException, HttpException, InternalServerErrorException, UseGuards  } from '@nestjs/common'; // Import thêm Inject
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Import CACHE_MANAGER từ @nestjs/cache-manager
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm'; // Import InjectDataSource
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { Product } from './products/entities/product.entity';
import { CreateProductDto } from './products/dto/create-product.dto';
import { UpdateProductDto } from './products/dto/update-product.dto';
import { CategoriesService } from './categories.service'; // Import để kiểm tra category tồn tại
import { Cache } from 'cache-manager'; // Import kiểu Cache
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // <<< Đường dẫn ví dụ
import { AdminGuard } from './auth/guards/admin.guard';   // <<< Đường dẫn ví dụ
import { CategoryDistributionDto } from './products/dto/stats.dto'; // Import DTO

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name); // <<< Thêm Logger

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService, // Inject CategoriesService
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inject CacheManager
    @InjectDataSource() private dataSource: DataSource, // <<< Inject DataSource
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Kiểm tra category có tồn tại không
    await this.categoriesService.findOne(createProductDto.categoryId);

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);
    await this.clearProductsCache(); // Xóa cache khi có sản phẩm mới
    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    console.log('Fetching products from DB...');
    return this.productRepository.find({
      relations: ['category'], // Lấy cả thông tin category
      select: ['id', 'name', 'description', 'price', 'stockQuantity', 'img', 'createdAt', 'updatedAt'], // Chỉ định các trường cần lấy
    });
  }
  // async findAll2(): Promise<Product[]> {
  //   console.log('Fetching products from DB...');
  //   return this.productRepository.find({
  //     relations: ['category'], // Lấy cả thông tin category
  //     select: ['id', 'name', 'description', 'price', 'stockQuantity', 'img', 'createdAt', 'updatedAt'], // Chỉ định các trường cần lấy
  //   });
  // }
  async findOne(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey);

    if (cachedProduct) {
      console.log(`Fetching product ${id} from CACHE`);
      return cachedProduct;
    }

    console.log(`Fetching product ${id} from DB`);
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'], // Lấy cả thông tin category
      select: ['id', 'name', 'description', 'price', 'stockQuantity', 'img', 'createdAt', 'updatedAt'], // Chỉ định các trường cần lấy
    });
    if (!product) {
      throw new NotFoundException(`Product với ID ${id} không tìm thấy`);
    }

    await this.cacheManager.set(cacheKey, product, 300); // Cache 5 phút
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Nếu categoryId được cập nhật, kiểm tra category mới có tồn tại không
    if (updateProductDto.categoryId) {
        await this.categoriesService.findOne(updateProductDto.categoryId);
    }

    const product = await this.productRepository.preload({ // Dùng preload để lấy entity và merge DTO
        id: id,
        ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product với ID ${id} không tìm thấy`);
    }
    const updatedProduct = await this.productRepository.save(product);
    await this.clearProductCache(id); // Xóa cache của product này
    await this.clearProductsCache(); // Xóa cache của list products
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product với ID ${id} không tìm thấy`);
    }
    await this.clearProductCache(id); // Xóa cache của product này
    await this.clearProductsCache(); // Xóa cache của list products
  }

  // --- HÀM CẬP NHẬT TỒN KHO ---
  async updateStock(id: string, change: number): Promise<Product> {
    if (change === 0) {
          this.logger.warn(`Received stock update request with change=0 for product ${id}. No action taken.`);
          // Trả về sản phẩm hiện tại nếu change là 0
          const currentProduct = await this.findOne(id); // Dùng findOne để lấy từ cache nếu có
          if(!currentProduct) throw new NotFoundException(`Sản phẩm với ID ${id} không tìm thấy.`);
          return currentProduct;
    }

    this.logger.log(`Updating stock for product ${id}, change: ${change}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE'); // <<< Mức cô lập cao nhất để tránh race condition

    try {
      // Lấy sản phẩm và khóa dòng (Pessimistic Write Lock)
      const product = await queryRunner.manager.findOne(Product, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${id} không tìm thấy trong transaction.`);
      }

      this.logger.debug(`[Transaction] Product ${id} current stock: ${product.stockQuantity}`);

      const newStock = product.stockQuantity + change;

      // Kiểm tra tồn kho âm khi giảm
      if (newStock < 0) {
        throw new BadRequestException(`Không đủ tồn kho cho sản phẩm "${product.name}" (ID: ${id}). Chỉ còn ${product.stockQuantity}, cần giảm ${-change}.`);
      }

      // Cập nhật số lượng
      product.stockQuantity = newStock;

      // Lưu thay đổi
      const updatedProduct = await queryRunner.manager.save(Product, product); // Chỉ lưu product

      // Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(`[Transaction] Product ${id} stock updated to ${updatedProduct.stockQuantity}. Commited.`);

      // Xóa Cache sau khi commit thành công
      await this.clearProductCache(id);
      await this.clearProductsCache(); // Xóa cả cache list

      return updatedProduct;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update stock for product ${id}. Rolled back. Error: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống khi cập nhật tồn kho.');
    } finally {
      await queryRunner.release();
    }
  }
  // --- KẾT THÚC HÀM CẬP NHẬT TỒN KHO ---

  async findByCategory(categoryId: string): Promise<Product[]> {
    const cacheKey = `products_category_${categoryId}`;
    const cachedProducts = await this.cacheManager.get<Product[]>(cacheKey);

    if (cachedProducts) {
      this.logger.log(`Fetching products for category ${categoryId} from cache`);
      return cachedProducts;
    }

    this.logger.log(`Fetching products for category ${categoryId} from DB`);
    const products = await this.productRepository.find({
      where: { categoryId },
      relations: ['category'],
      select: ['id', 'name', 'description', 'price', 'stockQuantity', 'img', 'createdAt', 'updatedAt'],
    });

    if (products.length === 0) {
      // Kiểm tra xem category có tồn tại không
      await this.categoriesService.findOne(categoryId);
      // Nếu category tồn tại nhưng không có sản phẩm, trả về mảng rỗng
    }

    await this.cacheManager.set(cacheKey, products, 300); // Cache 5 phút
    return products;
  }

  // --- Cache Invalidation Helpers ---
  private async clearProductCache(id: string) {
      const cacheKey = `product_${id}`;
      await this.cacheManager.del(cacheKey);
      console.log(`Cleared cache for product ${id}`);
  }

  private async clearProductsCache() {
      // Cần một cách để xóa cache của list, ví dụ dùng key cố định
      // Hoặc dùng pattern matching nếu Redis client hỗ trợ (ioredis có thể)
      // Cách đơn giản nhất là dùng một key cố định cho list
      const listCacheKey = 'products_list'; // Giả sử key dùng cho findAll là thế này
      await this.cacheManager.del(listCacheKey);
      console.log('Cleared cache for products list');
      // Lưu ý: Cách invalidation này khá đơn giản, trong thực tế có thể cần phức tạp hơn.

      // Thêm logic xóa cache của category
      const category = await this.categoriesService.findAll();
      for (const cat of category) {
        const categoryKey = `products_category_${cat.id}`;
        await this.cacheManager.del(categoryKey);
        this.logger.log(`Cleared cache for category ${cat.id}`);
      }
  }
  // --- THỐNG KÊ CHO ADMIN ---
  async getCategoryProductCount(): Promise<CategoryDistributionDto[]> {
    this.logger.log('[Stats] Lấy phân bố sản phẩm theo danh mục');
    const result = await this.productRepository
      .createQueryBuilder('product')
      .innerJoin('product.category', 'category') // Join với category qua relation
      .select('category.name', 'name')
      .addSelect('COUNT(product.id)', 'value')
      .groupBy('category.id') // Group theo category.id để đảm bảo chính xác
      .addGroupBy('category.name') // Thêm category.name vào group by
      .orderBy('value', 'DESC')
      .getRawMany<{ name: string; value: string }>();

    return result.map(item => ({
        name: item.name,
        value: parseInt(item.value, 10)
    }));
  }
  // --- KẾT THÚC THỐNG KÊ CHO ADMIN ---
}