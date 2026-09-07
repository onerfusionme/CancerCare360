import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TenantGuard ensures every request is scoped to a specific tenant.
 * It extracts the tenant ID from the authenticated user's JWT claims
 * and sets the PostgreSQL session variable for Row-Level Security (RLS).
 *
 * This is the core of multi-tenant data isolation — Hospital A can never
 * access Hospital B's data because RLS policies filter on app.current_tenant.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Tenant ID must come from the authenticated JWT — never from client headers
    // to prevent tenant spoofing attacks
    const tenantId = user?.tenantId;

    if (!tenantId) {
      this.logger.warn(
        `Request without tenant context from user ${user?.sub || 'unknown'}`,
      );
      throw new BadRequestException(
        'Tenant context is required. Ensure your account is associated with a hospital.',
      );
    }

    // Validate UUID format to prevent SQL injection via RLS context
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      throw new ForbiddenException('Invalid tenant context');
    }

    // Set PostgreSQL session variable for Row-Level Security
    // This is used by RLS policies: current_setting('app.current_tenant')
    try {
      await this.prisma.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
    } catch (error) {
      this.logger.error(
        `Failed to set tenant context for tenant ${tenantId}: ${(error as any)?.message}`,
      );
      throw new ForbiddenException('Unable to establish tenant context');
    }

    // Attach tenant ID to request for downstream use
    request.tenantId = tenantId;

    return true;
  }
}
