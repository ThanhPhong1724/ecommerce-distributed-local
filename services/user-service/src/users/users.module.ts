// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from './entities/user.entity'; // Import User entity

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký User entity với TypeORM cho module này
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService để AuthModule có thể dùng
})
export class UsersModule {}