import { Injectable, NotFoundException, Inject } from '@nestjs/common'; // Import thêm Inject
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // Import CACHE_MANAGER từ @nestjs/cache-manager
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products/entities/product.entity';
import { CreateProductDto } from './products/dto/create-product.dto';
import { UpdateProductDto } from './products/dto/update-product.dto';
import { CategoriesService } from './categories.service'; // Import để kiểm tra category tồn tại
import { Cache } from 'cache-manager'; // Import kiểu Cache

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService, // Inject CategoriesService
    @Inject(CACHE_MANAGER) private cacheManager: Cache // Inject CacheManager
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
  }
}