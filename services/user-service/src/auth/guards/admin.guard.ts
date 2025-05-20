// src/auth/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../users/entities/user.entity'; // Import UserRole

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy user từ JwtAuthGuard

    if (user && user.role === UserRole.ADMIN) { // Kiểm tra role
      return true;
    }
    throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này.');
  }
}