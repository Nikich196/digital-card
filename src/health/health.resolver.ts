import { Query, Resolver } from '@nestjs/graphql';

import { Health } from './health.model';
import { PrismaService } from '../common/prisma/prisma.service';

/**
 * Exposed through GraphQL rather than a separate HTTP route so that the whole
 * surface of the service stays in one schema.
 */
@Resolver(() => Health)
export class HealthResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => Health, { description: 'Service and database health.' })
  async health(): Promise<Health> {
    const startedAt = process.hrtime.bigint();
    await this.prisma.$queryRaw`SELECT 1`;
    const elapsedNs = Number(process.hrtime.bigint() - startedAt);

    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      databaseLatencyMs: Math.round(elapsedNs / 1e6),
    };
  }
}
