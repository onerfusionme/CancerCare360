import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends PassportAuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // If JWT verification fails or no token was provided, do not throw 401
    return user || null;
  }
}
