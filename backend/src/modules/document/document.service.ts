import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { ScanStatus, OcrStatus, VerificationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(tenantId: string, userId: string, file: Express.Multer.File, dto: UploadDocumentDto) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const objectName = `${fileId}${ext}`;
    const storageKey = path.join(this.uploadDir, objectName);
    const storageBucket = 'local-fs';

    // Save to local filesystem
    fs.writeFileSync(storageKey, file.buffer);

    const isImageOrPdf = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';

    if (dto.patientId) {
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, tenantId },
      });
      if (!patient) {
        throw new BadRequestException('Selected patient was not found in this organization');
      }
    }

    if (dto.journeyId) {
      const journey = await this.prisma.careJourney.findFirst({
        where: { id: dto.journeyId, tenantId },
      });
      if (!journey) {
        throw new BadRequestException('Selected care journey was not found in this organization');
      }
    }

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        patientId: dto.patientId || null,
        journeyId: dto.journeyId || null,
        documentType: dto.documentType,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storageKey: objectName, // Store relative object name
        storageBucket,
        virusScanStatus: ScanStatus.PENDING,
        ocrStatus: isImageOrPdf ? OcrStatus.PENDING : OcrStatus.NOT_APPLICABLE,
        verificationStatus: VerificationStatus.PENDING,
        source: dto.source,
        provenance: dto.provenance,
        uploadedById: typeof userId === 'object' && userId !== null ? (userId as any).id : userId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      ...document,
      fileSize: Number(document.fileSize),
    };
  }

  async findAll(tenantId: string, filterDto: DocumentFilterDto) {
    const { page = 1, limit = 10, patientId, journeyId, documentType, verificationStatus, dateFrom, dateTo } = filterDto;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(patientId && { patientId }),
      ...(journeyId && { journeyId }),
      ...(documentType && { documentType }),
      ...(verificationStatus && { verificationStatus }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        include: {
          uploadedBy: { select: { firstName: true, lastName: true } },
          verifiedBy: { select: { firstName: true, lastName: true } },
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    const serializedData = data.map((doc) => ({
      ...doc,
      fileSize: Number(doc.fileSize),
    }));

    return {
      data: serializedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id, tenantId },
      include: {
        uploadedBy: true,
        verifiedBy: true,
        patient: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return {
      ...document,
      fileSize: Number(document.fileSize),
    };
  }

  async getSignedUrl(tenantId: string, id: string) {
    const document = await this.findById(tenantId, id);
    const url = `/api/v1/documents/files/${document.storageKey}`;
    return { url };
  }

  async updateVerification(tenantId: string, id: string, userId: string, status: VerificationStatus, notes?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return this.prisma.document.update({
      where: { id, tenantId },
      data: {
        verificationStatus: status,
        verifiedById: typeof userId === 'object' && userId !== null ? (userId as any).id : userId,
        verifiedAt: new Date(),
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const filePath = path.join(this.uploadDir, document.storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.document.delete({
      where: { id, tenantId },
    });
  }
}
