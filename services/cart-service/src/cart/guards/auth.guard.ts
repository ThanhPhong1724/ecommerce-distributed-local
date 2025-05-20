import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    try {
      // Lấy token từ header
      const token = authHeader.split(' ')[1];
      // Giả lập decode token (trong thực tế sẽ verify JWT)
      const decoded = this.decodeToken(token);
      // Gán thông tin user vào request
      request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private decodeToken(token: string): any {
    // Giả lập decode token, thực tế sẽ dùng jwt.verify
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
      return { userId: payload.sub };
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }
}