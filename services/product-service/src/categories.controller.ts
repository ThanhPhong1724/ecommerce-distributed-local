import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ValidationPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './categories/dto/create-category.dto';
import { UpdateCategoryDto } from './categories/dto/update-category.dto';
import { Put, Request, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'; // Thêm HttpCode, HttpStatus

@UseInterceptors(ClassSerializerInterceptor) // Có thể dùng để loại bỏ field không mong muốn nếu dùng @Exclude trong entity
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- PHƯƠNG THỨC HEALTH CHECK NẰM Ở ĐÂY ---
  @Get('health') // Route sẽ là /cart/health
  @HttpCode(HttpStatus.OK)
  checkHealth() {
    // Không cần logic phức tạp, chỉ cần trả về là service đang chạy
    return { status: 'ok', service: 'categories-service' }; // Thêm tên service cho dễ nhận biết
  }
  // --- KẾT THÚC HEALTH CHECK ---
  
  @Post()
  create(@Body(ValidationPipe) createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}