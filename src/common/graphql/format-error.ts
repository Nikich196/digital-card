import { GraphQLFormattedError } from 'graphql';

/**
 * Errors caused by the client should say what is wrong; errors caused by the
 * server should say nothing at all. A public endpoint that echoes a database
 * message or a stack trace hands an attacker a free map of the system.
 *
 * The allow-list is explicit rather than inverted: a new internal failure mode
 * is then masked by default, which is the safe direction to be wrong in.
 */
const CLIENT_ERROR_CODES = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_USER_INPUT',
  'BAD_REQUEST',
  'NOT_FOUND',
  'PERSISTED_QUERY_NOT_FOUND',
  'PERSISTED_QUERY_NOT_SUPPORTED',
]);

export function formatError(formatted: GraphQLFormattedError): GraphQLFormattedError {
  const code = formatted.extensions?.code;

  if (typeof code === 'string' && CLIENT_ERROR_CODES.has(code)) {
    return {
      message: formatted.message,
      locations: formatted.locations,
      path: formatted.path,
      extensions: { code },
    };
  }

  // Код остаётся даже у замаскированной ошибки: без него клиент не может
  // отличить сбой сервера от своей ошибки и не знает, имеет ли смысл повтор.
  return {
    message: 'Internal server error',
    path: formatted.path,
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  };
}
