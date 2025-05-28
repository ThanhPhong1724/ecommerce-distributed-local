// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './users/entities/user.entity';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UserPayload } from './users/interfaces/user-payload.interface';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    // Inject UserRepository để tương tác với bảng 'users'
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserPayload> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }

    // UserRole.USER sẽ được tự động gán do default trong Entity
    const newUser = this.userRepository.create(createUserDto);

    const savedUser = await this.userRepository.save(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = savedUser;
    // `result` ở đây sẽ tự động bao gồm `role` do spread operator lấy tất cả trường của `savedUser` trừ `password`
    return result as UserPayload; // Có thể cần ép kiểu tường minh nếu TS chưa nhận ra
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

  // (Tùy chọn) Thêm hàm tìm user đầy đủ (bao gồm role) cho Auth Service
  async findOneByEmailWithRole(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByIdWithRole(id: string): Promise<User | null> {
     return this.userRepository.findOne({ where: { id }});
  }
  // Thêm các hàm khác nếu cần (findAll, update, remove...)
  async findAllForAdmin(): Promise<UserPayload[]> {
    const users = await this.userRepository.find({
        // (Tùy chọn) Sắp xếp hoặc chọn các trường cần thiết
        // select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
        order: { createdAt: 'DESC' }
    });
    // Map để loại bỏ password và đảm bảo đúng kiểu UserPayload
    return users.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result as UserPayload;
    });
  }
  // --- THỐNG KÊ CHO ADMIN ---
  async getNewUsersTodayCount(): Promise<{ newUsersToday: number }> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const count = await this.userRepository.count({
      where: { createdAt: Between(todayStart, todayEnd) },
    });
    return { newUsersToday: count };
  }
  // --- KẾT THÚC THỐNG KÊ CHO ADMIN ---
}