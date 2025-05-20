// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UserPayload } from './users/interfaces/user-payload.interface';
@Injectable()
export class UsersService {
  constructor(
    // Inject UserRepository để tương tác với bảng 'users'
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserPayload> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Tạo instance User mới từ DTO
    // Password sẽ được tự động hash bởi hook @BeforeInsert trong entity
    const newUser = this.userRepository.create(createUserDto);

    // Lưu user vào database
    const savedUser = await this.userRepository.save(newUser);

    // Trả về thông tin user (loại bỏ password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    return result;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
     if (!user) {
        throw new NotFoundException(`User với ID ${id} không tồn tại`);
     }
     return user;
  }

  // Thêm các hàm khác nếu cần (findAll, update, remove...)
}