import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    return data ? user[data] : user;
  },
);