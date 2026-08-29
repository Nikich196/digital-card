import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { PUBLIC_DIR } from './common/public-dir';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  // The built-in query console lives in public/. Serving it here means a
  // container behaves like the deployed instance: / is the console, /graphql
  // is Apollo Sandbox. Static files are matched before routes, but nothing in
  // public/ shares a path with the API.
  app.useStaticAssets(PUBLIC_DIR);

  // Prisma keeps its own connection pool; without this the process can exit
  // while queries are still in flight.
  app.enableShutdownHooks();

  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.listen(port, '0.0.0.0');

  const log = new Logger('Bootstrap');
  log.log(`Query console:  http://localhost:${port}/`);
  log.log(`Apollo Sandbox: http://localhost:${port}/graphql`);
}

void bootstrap();
