import * as Joi from 'joi';

/**
 * Fail fast on a bad environment: a missing DATABASE_URL should stop the
 * container at boot, not surface as a confusing error on the first query.
 */
export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  // Only needed for migrations; the running application never uses it.
  DIRECT_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).optional(),
  PORT: Joi.number().port().default(3000),
  GRAPHQL_PLAYGROUND: Joi.boolean().default(true),
  LOG_QUERIES: Joi.boolean().default(false),
  MAX_QUERY_DEPTH: Joi.number().integer().min(1).max(50).default(8),
});
