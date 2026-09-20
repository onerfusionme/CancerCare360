import { Injectable, ConflictException, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

export const SYSTEM_RESOURCES = [
  { resource: 'DASHBOARD', label: 'Executive Dashboard & Clinical KPIs' },
  { resource: 'PATIENT', label: 'Patients Directory & Longitudinal Records' },
  { resource: 'SECOND_OPINION', label: 'Second Opinion Hub & Consensus Review' },
  { resource: 'CARE_CIRCLES', label: 'CareCircles (Family Connect & Peer Support)' },
  { resource: 'CARE_RELIEF', label: 'CareRelief (Financial Aid & Cost Estimates)' },
  { resource: 'CARE_GAPS', label: 'Care Gaps & Follow-Up Protocol Tasks' },
  { resource: 'APPOINTMENT', label: 'Appointments & Clinic Flow Board' },
  { resource: 'CONSULTATION', label: 'Consultation Briefing & Readiness Card' },
  { resource: 'INVESTIGATION', label: 'Investigations & Diagnostic Pathology/Imaging' },
  { resource: 'JOURNEY', label: 'Treatment Journeys & Chemo/Radiation Protocols' },
  { resource: 'DOCUMENT', label: 'Clinical Documents & Patient Records' },
  { resource: 'CAMPAIGN', label: 'Outreach Programs & Screening Campaigns' },
  { resource: 'EDUCATION', label: 'Patient Cancer Education Library' },
  { resource: 'ANALYTICS', label: 'Analytics, Continuity & Practice Growth' },
  { resource: 'ADMIN_SETTINGS', label: 'Super Admin Settings, RBAC & User Management' },
];

export const SYSTEM_ACTIONS = [
  { action: 'READ', label: 'View / Read Only' },
  { action: 'CREATE', label: 'Create New Records' },
  { action: 'UPDATE', label: 'Edit & Update' },
  { action: 'DELETE', label: 'Delete Records' },
  { action: 'ALL', label: 'Full Management' },
];

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensurePermissionsSeeded();
  }

  public async ensurePermissionsSeeded() {
    for (const res of SYSTEM_RESOURCES) {
      for (const act of SYSTEM_ACTIONS) {
        await this.prisma.permission.upsert({
          where: {
            resource_action: {
              resource: res.resource,
              action: act.action,
            },
          },
          update: {
            description: `${act.label} on ${res.label}`,
          },
          create: {
            resource: res.resource,
            action: act.action,
            description: `${act.label} on ${res.label}`,
          },
        });
      }
    }
  }

  public async getAvailablePermissionsCatalog() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    return {
      resources: SYSTEM_RESOURCES,
      actions: SYSTEM_ACTIONS,
      permissions,
    };
  }

  public async findAll(tenantId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null }],
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.userRoles,
      permissions: r.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`),
      detailedPermissions: r.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  public async findById(tenantId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null }],
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.userRoles,
      permissions: role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`),
      detailedPermissions: role.rolePermissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  public async create(tenantId: string, dto: CreateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
        OR: [{ tenantId }, { tenantId: null }],
      },
    });

    if (existing) {
      throw new ConflictException(`Role with name "${dto.name}" already exists`);
    }

    const permissionIds = await this.resolvePermissionIds(dto.permissions);

    const createdRoleId = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          tenantId,
          name: dto.name.toUpperCase().replace(/\s+/g, '_'),
          description: dto.description || `Custom role: ${dto.name}`,
          isSystem: false,
        },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pId) => ({
            roleId: role.id,
            permissionId: pId,
          })),
        });
      }

      return role.id;
    });

    return this.findById(tenantId, createdRoleId);
  }

  public async update(tenantId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.findById(tenantId, id);

    if (role.isSystem && dto.name && dto.name !== role.name) {
      throw new BadRequestException('System role identifier cannot be renamed');
    }

    const permissionIds = dto.permissions ? await this.resolvePermissionIds(dto.permissions) : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: dto.name ? dto.name.toUpperCase().replace(/\s+/g, '_') : undefined,
          description: dto.description,
        },
      });

      if (permissionIds !== null) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((pId) => ({
              roleId: id,
              permissionId: pId,
            })),
          });
        }
      }
    });

    return this.findById(tenantId, id);
  }

  public async delete(tenantId: string, id: string) {
    const role = await this.findById(tenantId, id);

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete default system role');
    }

    if (role.userCount > 0) {
      throw new BadRequestException(`Cannot delete role "${role.name}" because it is assigned to ${role.userCount} user(s). Reassign them first.`);
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    await this.prisma.role.delete({ where: { id } });

    return { success: true, message: `Role ${role.name} deleted successfully` };
  }

  private async resolvePermissionIds(permissionKeysOrIds: string[]): Promise<string[]> {
    if (!permissionKeysOrIds || permissionKeysOrIds.length === 0) {
      return [];
    }

    const ids: string[] = [];

    for (const key of permissionKeysOrIds) {
      if (key.includes(':')) {
        const [resource, action] = key.split(':');
        const perm = await this.prisma.permission.findUnique({
          where: { resource_action: { resource, action } },
        });
        if (perm) {
          ids.push(perm.id);
        }
      } else {
        // UUID provided directly
        const perm = await this.prisma.permission.findUnique({ where: { id: key } });
        if (perm) {
          ids.push(perm.id);
        }
      }
    }

    return Array.from(new Set(ids));
  }
}
