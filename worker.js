export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle specific API route paths
    if (url.pathname === "/api/data") {
      return new Response(JSON.stringify({
        success: true,
        message: "Backend connected successfully"
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 2. Try to fetch the static asset (JS, CSS, Images, etc.)
    let response = await env.ASSETS.fetch(request);

    // 3. SPA Fallback: If a user refreshes a clean React Router route (no dot extension like .js/.png)
    // and it returns a 404, gracefully serve the index.html template instead.
    if (response.status === 404 && !url.pathname.includes('.')) {
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  }
};
