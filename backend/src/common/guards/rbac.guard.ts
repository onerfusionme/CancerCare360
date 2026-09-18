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

    // Administrators and Clinical Staff (Oncologists, Surgeons, Coordinators) have full clinical access
    const staffRoles = [
      'ADMIN',
      'SYSTEM_ADMIN',
      'ONCOLOGIST',
      'SURGICAL_ONCOLOGIST',
      'RADIATION_ONCOLOGIST',
      'CARE_COORDINATOR',
      'NURSE',
      'NAVIGATOR',
      'HOD'
    ];
    if (user.roles?.some((role: string) => staffRoles.includes(role))) {
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
