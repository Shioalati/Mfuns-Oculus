export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/user-count") {
      return Response.json({ count: 13946});
    }

    return env.ASSETS.fetch(request);
  }
};