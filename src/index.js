const MAX_UID = 100000;
const KV_KEY = "count";

async function fetchUidStatus(uid) {
  const res = await fetch(`https://www.mfuns.net/member/${uid}`, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MfunsUserCountBot/1.0)"
    },
    redirect: "manual"
  });
  return res.status;
}

async function isValidUid(uid) {
  await new Promise(r => setTimeout(r, 500));
  try {
    const status = await fetchUidStatus(uid);
    return status === 200;
  } catch {
    return false;
  }
}

async function findMaxUid() {
  let low = 1;
  let high = MAX_UID;
  let maxValid = 0;

  if (await isValidUid(high)) {
    return high;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const valid = await isValidUid(mid);

    if (valid) {
      maxValid = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return maxValid;
}

async function updateCount(env) {
  const maxUid = await findMaxUid();
  const remaining = MAX_UID - maxUid;

  await env.kv_MfunsUserCount.put(KV_KEY, String(remaining));

  return remaining;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/user-count") {
      const raw = await env.kv_MfunsUserCount.get(KV_KEY);
      const remaining = raw === null ? 0 : Number(raw);

      return Response.json({
        remaining,
        maxUid: MAX_UID - remaining,
        total: MAX_UID
      });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(updateCount(env));
  }
};