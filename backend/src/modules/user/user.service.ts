import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createUserDto: CreateUserDto) {
    const { roleIds, ...userData } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: userData.email } },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in the tenant');
    }

    // In a real scenario, we would create the user in Keycloak first and get the ID.
    // For this, we'll generate a UUID for keycloakId.
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          tenantId,
          keycloakId: uuidv4(),
          status: UserStatus.ACTIVE,
        },
      });

      if (roleIds && roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
            departmentId: userData.departmentId,
          })),
        });
      }

      return user;
    });
  }

  async findAll(tenantId: string, query: PaginationQueryDto & { departmentId?: string; roleId?: string }) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', departmentId, roleId } = query;

    const where: any = { tenantId };
    if (departmentId) where.departmentId = departmentId;
    if (roleId) {
      where.userRoles = { some: { roleId } };
    }

    const total = await this.prisma.user.count({ where });
    const data = await this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        department: { select: { id: true, name: true } },
        userRoles: { include: { role: { select: { id: true, name: true } } } },
      },
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
        userRoles: { include: { role: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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
        // Simple full replacement strategy for roles
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: id,
            roleId,
            departmentId: userData.departmentId || null,
          })),
        });
      }

      return this.findById(tenantId, id);
    });
  }

  async assignRole(tenantId: string, userId: string, roleId: string, departmentId?: string) {
    await this.findById(tenantId, userId);
    // Add logic to check if role exists
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        departmentId,
      },
    });
  }

  async removeRole(tenantId: string, userId: string, roleId: string) {
    return this.prisma.userRole.deleteMany({
      where: { userId, roleId },
    });
  }
}
