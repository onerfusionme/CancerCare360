import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { MailerService } from '../../common/mailer/mailer.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(tenantId: string, createUserDto: CreateUserDto) {
    const { roleIds, password, sendEmail = true, ...userData } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: userData.email.toLowerCase().trim() } },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${userData.email} already exists in this hospital`);
    }

    // Generate temporary password if not provided
    const rawPassword = password && password.trim().length >= 6
      ? password.trim()
      : `Care@${Math.random().toString(36).slice(-6).toUpperCase()}!`;

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Resolve role IDs (could be role IDs or role names like "ADMIN", "ONCOLOGIST")
    const resolvedRoleIds = await this.resolveRoleIds(tenantId, roleIds);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true },
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          email: userData.email.toLowerCase().trim(),
          password: hashedPassword,
          tenantId,
          keycloakId: uuidv4(),
          status: UserStatus.ACTIVE,
        },
      });

      if (resolvedRoleIds.length > 0) {
        await tx.userRole.createMany({
          data: resolvedRoleIds.map((roleId) => ({
            userId: newUser.id,
            roleId,
            departmentId: userData.departmentId,
          })),
        });
      }

      return newUser;
    });

    // Determine primary role name for the email template
    const userWithRoles = await this.findById(tenantId, user.id);
    const primaryRoleName = userWithRoles.userRoles?.[0]?.role?.name?.replace(/_/g, ' ') || 'Clinical Staff';

    let emailDispatchResult: any = null;
    if (sendEmail) {
      try {
        emailDispatchResult = await this.mailerService.sendUserCredentialsEmail({
          to: user.email,
          name: `${user.firstName} ${user.lastName}`,
          roleName: primaryRoleName,
          password: rawPassword,
          tenantName: tenant?.name,
        });

        // Record notification in DB
        await this.prisma.notification.create({
          data: {
            tenantId,
            recipientId: user.id,
            recipientType: 'USER',
            channel: 'EMAIL',
            subject: emailDispatchResult.subject,
            body: `Onboarding credentials sent to ${user.email} with role ${primaryRoleName}.`,
            status: 'SENT',
          } as any,
        });
      } catch (err) {
        console.error('Failed to dispatch onboarding email:', err);
      }
    }

    return {
      ...userWithRoles,
      temporaryPassword: rawPassword,
      emailDispatched: !!emailDispatchResult,
      emailChannel: emailDispatchResult?.channel,
    };
  }

  async findAll(tenantId: string, query: PaginationQueryDto & { departmentId?: string; roleId?: string; search?: string }) {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc', departmentId, roleId, search } = query;

    const where: any = { tenantId };
    if (departmentId) where.departmentId = departmentId;
    if (roleId) {
      where.userRoles = { some: { roleId } };
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        department: { select: { id: true, name: true, type: true } },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    const data = users.map((u) => {
      const { password, keycloakId, ...safe } = u;
      const roles = u.userRoles.map((ur) => ur.role.name);
      const permissions = u.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`)
      );
      return {
        ...safe,
        roles,
        permissions: Array.from(new Set(permissions)),
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, keycloakId, ...safe } = user;
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`))
    );

    return {
      ...safe,
      roles,
      permissions: Array.from(new Set(permissions)),
      userRoles: user.userRoles,
    };
  }

  async resendCredentials(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId },
      include: {
        userRoles: { include: { role: true } },
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const newTempPassword = `Care@${Math.random().toString(36).slice(-6).toUpperCase()}!`;
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    const primaryRole = user.userRoles?.[0]?.role?.name?.replace(/_/g, ' ') || 'Staff Member';

    const dispatchResult = await this.mailerService.sendUserCredentialsEmail({
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      roleName: primaryRole,
      password: newTempPassword,
      tenantName: user.tenant?.name,
    });

    // Record notification in DB
    await this.prisma.notification.create({
      data: {
        tenantId,
        recipientId: user.id,
        recipientType: 'USER',
        channel: 'EMAIL',
        subject: dispatchResult.subject,
        body: `Credentials resent to ${user.email}.`,
        status: 'SENT',
      } as any,
    });

    return {
      success: true,
      message: `Credentials re-sent to ${user.email}`,
      temporaryPassword: newTempPassword,
      channel: dispatchResult.channel,
    };
  }

  async update(tenantId: string, id: string, updateUserDto: UpdateUserDto) {
    await this.findById(tenantId, id);
    const { roleIds, ...userData } = updateUserDto;

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id },
          data: userData,
        });
      }

      if (roleIds) {
        const resolvedRoleIds = await this.resolveRoleIds(tenantId, roleIds);
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: resolvedRoleIds.map((roleId) => ({
            userId: id,
            roleId,
            departmentId: userData.departmentId || null,
          })),
        });
      }

      return this.findById(tenantId, id);
    });
  }

  async toggleStatus(tenantId: string, userId: string, status: UserStatus) {
    await this.findById(tenantId, userId);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return { success: true, status: updated.status };
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    try {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      const deleted = await this.prisma.user.delete({ where: { id } });
      return { success: true, message: 'User deleted successfully', data: deleted };
    } catch (err) {
      // If foreign keys prevent hard delete (e.g. appointments assigned), mark inactive
      const updated = await this.prisma.user.update({
        where: { id },
        data: { status: UserStatus.INACTIVE },
      });
      return { success: true, message: 'User archived as inactive due to linked records', data: updated };
    }
  }

  private async resolveRoleIds(tenantId: string, roleIdsOrNames: string[]): Promise<string[]> {
    if (!roleIdsOrNames || roleIdsOrNames.length === 0) return [];

    const resolvedIds: string[] = [];

    for (const item of roleIdsOrNames) {
      // Check if it's already a valid UUID
      const roleById = await this.prisma.role.findFirst({
        where: { id: item, OR: [{ tenantId }, { tenantId: null }] },
      });
      if (roleById) {
        resolvedIds.push(roleById.id);
        continue;
      }

      // Check by role name (e.g. "ONCOLOGIST", "ADMIN")
      const roleByName = await this.prisma.role.findFirst({
        where: {
          name: { equals: item, mode: 'insensitive' },
          OR: [{ tenantId }, { tenantId: null }],
        },
      });
      if (roleByName) {
        resolvedIds.push(roleByName.id);
      }
    }

    return Array.from(new Set(resolvedIds));
  }
}
