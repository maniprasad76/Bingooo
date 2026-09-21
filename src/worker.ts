/**
 * Cloudflare Worker Edge Gateway for Bingooo
 * Provides edge health probes and proxies requests to the Bingooo production storefront.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health probe endpoint
    if (url.pathname === '/health' || url.pathname === '/edge-health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'bingooo-edge',
          region: 'auto',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache',
          },
        },
      );
    }

    // Proxy request to the live customer storefront
    const targetUrl = new URL(url.pathname + url.search, 'https://bingooo-frontend.vercel.app');
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });

    return fetch(proxyRequest);
  },
};
