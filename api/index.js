/**
 * Serverless entry point for Vercel.
 *
 * Nest is booted once per warm instance and the Express instance it wraps is
 * reused, so only the first request after a cold start pays for initialisation.
 * The compiled application is required from dist/ rather than compiled here:
 * decorator metadata survives the project's own tsc build, which the bundler's
 * transpiler does not reliably reproduce.
 */
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');

const { AppModule } = require('../dist/src/app.module');

const server = express();
let bootstrapped = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  app.enableCors();
  await app.init();
}

module.exports = async (req, res) => {
  if (!bootstrapped) {
    bootstrapped = bootstrap();
  }
  await bootstrapped;
  return server(req, res);
};
