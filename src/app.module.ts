import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { Module } from '@nestjs/common';
import { join } from 'node:path';

import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { LoaderFactory } from './common/dataloader/loader.factory';
import { PrismaModule } from './common/prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
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
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        sortSchema: true,
        playground: false,
        introspection: config.get<boolean>('GRAPHQL_PLAYGROUND', true),
        // Apollo Sandbox is served at /graphql, as the task asks.
        plugins: config.get<boolean>('GRAPHQL_PLAYGROUND', true)
          ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
          : [],
        // A fresh loader set per request: the cache must not outlive it.
        context: () => ({ loaders: loaderFactory.create() }),
      }),
    }),
    ProfileModule,
  ],
})
export class AppModule {}
