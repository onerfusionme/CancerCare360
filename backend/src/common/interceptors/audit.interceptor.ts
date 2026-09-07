import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    // Only audit mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap((data) => {
          // Fire and forget audit log creation (non-blocking)
          this.logAudit({
            tenantId: user?.tenantId || request.tenantId || null,
            userId: user?.id || null,
            action: `${method} ${url}`,
            resourceType: url.split('/')[2] || 'unknown', // e.g. /api/v1/patients -> patients
            resourceId: request.params?.id || data?.id || null,
            previousValue: null, // Hard to capture previous state generically without specific module logic
            newValue: body,
            ipAddress: ip,
            userAgent,
          }).catch((err) => {
            console.error('Failed to write audit log', err);
          });
        }),
      );
    }
    return next.handle();
  }

  private async logAudit(data: any) {
    await this.prisma.auditLog.create({ data });
  }
}
