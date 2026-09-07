import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Patient } from '@prisma/client';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(SearchService.name);
  private readonly PATIENT_INDEX = 'patients';

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('elasticsearch.node');
    this.client = new Client({ node: node || 'http://localhost:9200' });
  }

  async onModuleInit() {
    try {
      await this.initIndices();
      this.logger.log('Elasticsearch connected and indices initialized');
    } catch (err) {
      this.logger.warn('Could not connect to Elasticsearch on startup. Is it running?', err);
    }
  }

  private async initIndices() {
    const exists = await this.client.indices.exists({ index: this.PATIENT_INDEX });
    if (!exists) {
      await this.client.indices.create({
        index: this.PATIENT_INDEX,
        body: {
          mappings: {
            properties: {
              tenantId: { type: 'keyword' },
              id: { type: 'keyword' },
              mrn: { type: 'keyword' },
              firstName: { type: 'text', analyzer: 'standard' },
              lastName: { type: 'text', analyzer: 'standard' },
              phone: { type: 'text' },
              email: { type: 'text' },
              status: { type: 'keyword' },
            },
          },
        },
      });
    }
  }

  async indexPatient(patient: Patient) {
    try {
      await this.client.index({
        index: this.PATIENT_INDEX,
        id: patient.id,
        body: {
          tenantId: patient.tenantId,
          id: patient.id,
          mrn: patient.mrn,
          firstName: patient.firstName,
          lastName: patient.lastName,
          phone: patient.phone,
          email: patient.email,
          status: patient.status,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to index patient ${patient.id}`, err);
    }
  }

  async searchPatients(tenantId: string, query: string) {
    try {
      const response = await this.client.search({
        index: this.PATIENT_INDEX,
        body: {
          query: {
            bool: {
              must: [
                { term: { tenantId } }
              ],
              should: [
                { match: { firstName: { query, fuzziness: 'AUTO' } } },
                { match: { lastName: { query, fuzziness: 'AUTO' } } },
                { term: { mrn: query } },
                { term: { phone: query } }
              ],
              minimum_should_match: 1
            }
          }
        }
      });
      
      return response.hits.hits.map(hit => hit._source);
    } catch (err) {
      this.logger.error('Failed to search patients', err);
      return [];
    }
  }

  async removePatientIndex(tenantId: string, id: string) {
    try {
      await this.client.delete({
        index: this.PATIENT_INDEX,
        id,
      });
    } catch (err) {
      this.logger.error(`Failed to remove patient ${id} from index`, err);
    }
  }
}
