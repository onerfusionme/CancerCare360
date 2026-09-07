import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Since we'll use Passport JWT strategy, we rely on it to set req.user
    // This is a basic AuthGuard placeholder if not using @UseGuards(AuthGuard('jwt'))
    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return true;
  }
}

export { AuthGuard as JwtAuthGuard };
