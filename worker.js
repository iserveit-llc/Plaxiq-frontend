export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Keep your API route if you need it locally inside this worker
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
    console.log("assetName",env.ASSETS)
    // 2. REMOVED the old "/" and "Not Found" overrides.
    // Instead, pass all navigation and asset requests straight to your React build code.
    return await env.ASSETS.fetch(request);
  }
}
