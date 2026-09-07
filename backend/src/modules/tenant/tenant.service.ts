import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    return this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        status: createTenantDto.status || ('ACTIVE' as any),
        settings: createTenantDto.settings as any,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const total = await this.prisma.tenant.count();
    const data = await this.prisma.tenant.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findById(id);

    if (updateTenantDto.slug) {
      const existing = await this.prisma.tenant.findFirst({
        where: { slug: updateTenantDto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Slug is already in use by another tenant');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto as any,
    });
  }
}
