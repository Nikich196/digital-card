import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Prisma keeps its own connection pool; without this the process can exit
  // while queries are still in flight.
  app.enableShutdownHooks();

  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');

  new Logger('Bootstrap').log(`GraphQL sandbox: http://localhost:${port}/graphql`);
}

void bootstrap();
