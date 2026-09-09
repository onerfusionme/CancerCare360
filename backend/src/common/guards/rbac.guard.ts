import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No user found');
    }

    // Administrators have full permission across all resources
    if (user.roles?.includes('ADMIN') || user.roles?.includes('SYSTEM_ADMIN')) {
      return true;
    }

    if (requiredRoles) {
      const hasRole = () => user.roles?.some((role: string) => requiredRoles.includes(role));
      if (!hasRole()) {
         throw new ForbiddenException('Insufficient roles');
      }
    }

    if (requiredPermissions) {
      const hasPermission = () => user.permissions?.some((p: string) => requiredPermissions.includes(p));
      if (!hasPermission()) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}
