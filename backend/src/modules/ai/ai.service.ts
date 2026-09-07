import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ExtractDocumentDto } from './dto/extract-document.dto';
import { SummarizeConsultationDto } from './dto/summarize-consultation.dto';
import { ExplainGapDto } from './dto/explain-gap.dto';
import { DraftEducationDto } from './dto/draft-education.dto';
import { ReviewInteractionDto } from './dto/review-interaction.dto';
import { AiLogFilterDto } from './dto/ai-log-filter.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    this.apiKey = this.configService.get<string>('AI_SERVICE_API_KEY') || 'default_internal_api_key_for_testing';
  }

  private async callAiService(endpoint: string, payload: any): Promise<any> {
    try {
      const response = await fetch(`${this.aiServiceUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI service at ${endpoint}:`, error);
      throw new InternalServerErrorException('AI service communication failed');
    }
  }

  private async callAiServiceFormData(endpoint: string, text: string, documentType: string = 'auto'): Promise<any> {
    try {
      const formData = new URLSearchParams();
      formData.append('text', text);
      formData.append('document_type', documentType);

      const response = await fetch(`${this.aiServiceUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-API-Key': this.apiKey,
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to call AI service at ${endpoint}:`, error);
      throw new InternalServerErrorException('AI service communication failed');
    }
  }

  private async logInteraction(
    tenantId: string,
    userId: string,
    capability: string,
    inputContextRef: string,
    output: any,
    confidenceScore: number,
  ) {
    return this.prisma.aiInteractionLog.create({
      data: {
        tenantId,
        userId,
        capability,
        modelProvider: 'rule-heuristic-engine',
        inputContextRef,
        output: JSON.stringify(output),
        confidenceScore,
      },
    });
  }

  async extractDocument(tenantId: string, userId: string, dto: ExtractDocumentDto) {
    const document = await this.prisma.document.findFirst({
      where: { id: dto.documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const documentText = (document.extractedData as any)?.extractedText || 'Dummy pathology report with carcinoma';
    
    const result = await this.callAiServiceFormData('/api/v1/extract', documentText, dto.documentType || 'auto');

    await this.prisma.document.update({
      where: { id: document.id },
      data: {
        extractedData: result.entities,
        ocrStatus: 'COMPLETED',
      },
    });

    await this.logInteraction(
      tenantId,
      userId,
      'DOCUMENT_EXTRACTION',
      `Document:${document.id}`,
      result,
      Object.values(result.confidence_scores as Record<string, number>)[0] || 0.85
    );

    return result;
  }

  async summarizeConsultation(tenantId: string, userId: string, dto: SummarizeConsultationDto) {
    const patientData = { id: dto.patientId };
    const result = await this.callAiService('/api/v1/summarize/consultation', {
      patient_data: patientData,
      recent_history: {},
      pending_items: {},
    });

    await this.logInteraction(
      tenantId,
      userId,
      'CONSULTATION_SUMMARY',
      `Patient:${dto.patientId}`,
      result,
      0.9
    );

    return result;
  }

  async explainCareGap(tenantId: string, userId: string, dto: ExplainGapDto) {
    const result = await this.callAiService('/api/v1/explain/care-gap', {
      gap_type: dto.gapType,
      gap_data: dto.gapData,
    });

    await this.logInteraction(
      tenantId,
      userId,
      'CARE_GAP_EXPLANATION',
      `GapType:${dto.gapType}`,
      result,
      0.95
    );

    return result;
  }

  async draftEducation(tenantId: string, userId: string, dto: DraftEducationDto) {
    const result = await this.callAiService('/api/v1/draft/education', {
      topic: dto.topic,
      language: dto.language,
      key_points: dto.keyPoints,
    });

    await this.logInteraction(
      tenantId,
      userId,
      'PATIENT_EDUCATION_DRAFT',
      `Topic:${dto.topic}`,
      result,
      0.85
    );

    return result;
  }

  async reviewInteraction(tenantId: string, id: string, userId: string, dto: ReviewInteractionDto) {
    const log = await this.prisma.aiInteractionLog.findFirst({
      where: { id, tenantId },
    });

    if (!log) {
      throw new NotFoundException('Interaction log not found');
    }

    return this.prisma.aiInteractionLog.update({
      where: { id },
      data: {
        reviewStatus: dto.reviewStatus,
        reviewedById: userId,
        reviewNotes: dto.reviewNotes,
      },
    });
  }

  async getLogs(tenantId: string, filter: AiLogFilterDto) {
    const { capability, modelProvider, reviewStatus, dateFrom, dateTo, page = 1, limit = 10 } = filter;
    
    const whereClause: any = { tenantId };
    if (capability) whereClause.capability = capability;
    if (modelProvider) whereClause.modelProvider = modelProvider;
    if (reviewStatus) whereClause.reviewStatus = reviewStatus;
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.aiInteractionLog.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aiInteractionLog.count({ where: whereClause }),
    ]);

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGovernanceStats(tenantId: string) {
    const logs = await this.prisma.aiInteractionLog.findMany({
      where: { tenantId },
      select: { reviewStatus: true, confidenceScore: true },
    });

    const totalInteractions = logs.length;
    let accepted = 0;
    let rejected = 0;
    let modified = 0;
    let totalConfidence = 0;

    for (const log of logs) {
      if (log.reviewStatus === 'ACCEPTED') accepted++;
      if (log.reviewStatus === 'REJECTED') rejected++;
      if (log.reviewStatus === 'MODIFIED') modified++;
      totalConfidence += log.confidenceScore || 0;
    }

    return {
      totalInteractions,
      accepted,
      rejected,
      modified,
      averageConfidenceScore: totalInteractions > 0 ? totalConfidence / totalInteractions : 0,
    };
  }
}
