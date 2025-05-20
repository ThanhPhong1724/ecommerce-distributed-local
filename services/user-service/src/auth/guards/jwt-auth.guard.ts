// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Import key

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // Kế thừa AuthGuard('jwt')
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Kiểm tra xem có metadata 'isPublic' được set bởi @Public() decorator không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check metadata trên phương thức (handler)
      context.getClass(),   // Check metadata trên class (controller)
    ]);

    if (isPublic) {
      return true; // Nếu là public thì cho qua luôn, không cần check JWT
    }

    // Nếu không phải public, thì chạy logic kiểm tra JWT mặc định của AuthGuard('jwt')
    return super.canActivate(context);
  }
}