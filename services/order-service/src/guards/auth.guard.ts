import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug('Request headers:', request.headers);
    
    const token = this.extractTokenFromHeader(request);
    this.logger.debug('Extracted token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      this.logger.error('No token found in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });
      
      this.logger.debug('Token verified successfully. Payload:', payload);
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    this.logger.debug('Authorization header:', authHeader);
    
    if (!authHeader) {
      this.logger.error('No authorization header found');
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    this.logger.debug('Token type:', type);
    
    return type === 'Bearer' ? token : undefined;
  }
}