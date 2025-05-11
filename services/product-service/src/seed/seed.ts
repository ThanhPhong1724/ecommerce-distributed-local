import { createConnection } from 'typeorm';
// import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
export class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
    imageUrl: string; // Added imageUrl property
  }
async function seed() {
  const connection = await createConnection();

  // Seed categories
  const categories = await connection
    .createQueryBuilder()
    .insert()
    .into(Category)
    .values([
      { name: 'Áo', description: 'Các loại áo' },
      { name: 'Quần', description: 'Các loại quần' },
      { name: 'Phụ kiện', description: 'Phụ kiện thời trang' }
    ])
    .execute();

  // Seed products
  await connection
    .createQueryBuilder()
    .insert()
    .into(Product)
    .values([
      {
        name: 'Áo Khoác Dù 2 Lớp',
        description: 'Áo khoác dù 2 lớp chống nước',
        price: 265000,
        stockQuantity: 100,
        imageUrl: 'https://example.com/aokhoac.jpg',
        categoryId: categories.identifiers[0].id
      },
      {
        name: 'Quần Jeans Slimfit',
        description: 'Quần jeans ôm dáng',
        price: 450000,
        stockQuantity: 50,
        imageUrl: 'https://example.com/quanjeans.jpg',
        categoryId: categories.identifiers[1].id
      }
    ])
    .execute();

  await connection.close();
}

seed()
  .then(() => console.log('Seeding completed!'))
  .catch(error => console.error('Seeding failed:', error));