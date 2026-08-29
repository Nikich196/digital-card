import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // LOG_QUERIES makes every SQL statement visible. It is how the N+1
    // behaviour of the resolvers can be checked: one query per collection,
    // not one per parent row.
    super({ log: process.env.LOG_QUERIES === 'true' ? [{ emit: 'event', level: 'query' }] : [] });
  }

  async onModuleInit(): Promise<void> {
    if (process.env.LOG_QUERIES === 'true') {
      // @ts-expect-error — the event name is only typed when log config is static.
      this.$on('query', (event: { query: string; duration: number }) => {
        this.logger.debug(`${event.duration}ms  ${event.query}`);
      });
    }
    await this.$connect();
  }
}
