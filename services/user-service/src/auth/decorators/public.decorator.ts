// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Tạo decorator @Public() để đánh dấu các route không cần xác thực JWT
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);