import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { join } from 'node:path';

import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { HealthModule } from './health/health.module';
import { LoaderFactory } from './common/dataloader/loader.factory';
import { PrismaModule } from './common/prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { depthLimit } from './common/graphql/depth-limit.rule';
import { formatError } from './common/graphql/format-error';
import { sandboxLandingPage } from './common/graphql/sandbox.plugin';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataLoaderModule],
      inject: [ConfigService, LoaderFactory],
      useFactory: (config: ConfigService, loaderFactory: LoaderFactory) => ({
        // On Vercel the filesystem is read-only, so the schema is kept in
        // memory; locally it is written out to be committed and reviewed.
        autoSchemaFile: process.env.VERCEL ? true : join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        playground: false,
        introspection: config.get<boolean>('GRAPHQL_PLAYGROUND', true),
        // Apollo Sandbox is served at /graphql, as the task asks.
        plugins: config.get<boolean>('GRAPHQL_PLAYGROUND', true) ? [sandboxLandingPage()] : [],
        // The endpoint is public, so an arbitrarily deep query is rejected at
        // validation time — before any row is read.
        validationRules: [depthLimit(config.get<number>('MAX_QUERY_DEPTH', 8))],
        formatError,
        // A fresh loader set per request: the cache must not outlive it.
        context: () => ({ loaders: loaderFactory.create() }),
      }),
    }),
    ProfileModule,
    HealthModule,
  ],
})
export class AppModule {}
