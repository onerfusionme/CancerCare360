import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const keycloakUrl = configService.get<string>('keycloak.authServerUrl');
    const realm = configService.get<string>('keycloak.realm');
    
    // In a real scenario, you'd use jwks-rsa to dynamically fetch the public key from Keycloak.
    // For this boilerplate, we'll assume a standard JWT setup with a secret or PEM.
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-default-key-change-me',
    });
  }

  async validate(payload: any) {
    // payload represents the decoded JWT
    const { sub, email, tenant_id } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      include: {
        userRoles: {
          include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in system');
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    return {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      tenantId: user.tenantId,
      roles,
      permissions,
    };
  }
}
