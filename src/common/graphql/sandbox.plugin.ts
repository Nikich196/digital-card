import type { ApolloServerPlugin } from '@apollo/server';

/**
 * Serves Apollo Sandbox at /graphql.
 *
 * Apollo's own landing-page plugin pulls its shell from
 * apollo-server-landing-page.cdn.apollographql.com, which is not reachable
 * everywhere — where it is blocked the page renders "Sandbox cannot be loaded;
 * it appears that you might be offline" and the endpoint looks broken even
 * though the API is fine. This renders the same Sandbox directly from the
 * embeddable bundle instead, which is a single script and one less host to
 * depend on.
 *
 * The fallback below matters for the same reason: if the bundle does not load,
 * the visitor gets a working link to the built-in console rather than a dead
 * page.
 */
const SANDBOX_BUNDLE =
  'https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js';

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apollo Sandbox — Digital Card API</title>
<style>
  html, body { margin: 0; height: 100%; background: #14181f; }
  #sandbox, #sandbox > iframe { width: 100%; height: 100%; border: 0; }
  #fallback {
    display: none;
    max-width: 34rem;
    margin: 0 auto;
    padding: 4rem 1.5rem;
    color: #e6e6e6;
    font: 15px/1.6 ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  #fallback a { color: #6dbfa5; }
</style>
</head>
<body>
<div id="sandbox"></div>
<div id="fallback">
  <h1>Apollo Sandbox не загрузился</h1>
  <p>
    Скрипт песочницы тянется с CDN Apollo, и сюда он не дошёл — обычно это
    блокировка на стороне сети, а не сбой сервиса.
  </p>
  <p>
    API работает: тот же запрос можно выполнить во встроенной консоли на
    <a href="/">главной странице</a> — она не зависит от внешних ресурсов.
    Либо напрямую: <code>POST /graphql</code>.
  </p>
</div>
<script src="${SANDBOX_BUNDLE}"></script>
<script>
  var mounted = false;
  try {
    if (window.EmbeddedSandbox) {
      new window.EmbeddedSandbox({
        target: '#sandbox',
        initialEndpoint: window.location.origin + '/graphql',
        hideCookieToggle: true,
        initialState: {
          document: [
            '{',
            '  profile {',
            '    name',
            '    description',
            '    skills { name }',
            '    experience { company position }',
            '    projects { name }',
            '  }',
            '}',
          ].join('\\n'),
        },
      });
      mounted = true;
    }
  } catch (error) {
    mounted = false;
  }
  if (!mounted) {
    document.getElementById('sandbox').style.display = 'none';
    document.getElementById('fallback').style.display = 'block';
  }
</script>
</body>
</html>`;

export function sandboxLandingPage(): ApolloServerPlugin {
  return {
    async serverWillStart() {
      return {
        async renderLandingPage() {
          return { html: PAGE };
        },
      };
    },
  };
}
