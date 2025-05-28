// src/auth/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../products/entities/user.entity'; // Import UserRole

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // user được gán bởi JwtAuthGuard

    if (user && user.role === UserRole.ADMIN) {
      return true;
    }
    throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này (Admin Only).');
  }
}