import * as Joi from 'joi';

/**
 * Fail fast on a bad environment: a missing DATABASE_URL should stop the
 * container at boot, not surface as a confusing error on the first query.
 */
export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  PORT: Joi.number().port().default(3000),
  GRAPHQL_PLAYGROUND: Joi.boolean().default(true),
  LOG_QUERIES: Joi.boolean().default(false),
});
