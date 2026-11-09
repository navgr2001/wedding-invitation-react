// Netlify RSVP gateway. POST confirmation is recovered by looking up the
// request ID after Google Sheets writes the row, even if the POST reply is lost.
const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyDZ8T3Qru7FGbVZOLm8TE4Eb47nD7p8YzHvfROR2Er40cwbC9B_Fhthbimj8eDdUB2cw/exec";
const ID_PATTERN = /^rsvp_[0-9]{10,17}_[a-z0-9]{6,20}$/;
const NAME_PATTERN = /^[\p{L}\p{M}\p{N} &.]+$/u;
const VALID_STATUS = new Set(["success", "duplicate", "error", "pending", "unavailable"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function json(value, code = 200) {
  return new Response(JSON.stringify(value), {
    status: code,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function scriptRequest(scriptUrl, method, params, timeoutMs = 8000) {
  const url = new URL(scriptUrl);
  let body;
  if (method === "POST") {
    url.searchParams.set("transport", "json");
    body = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v ?? "")]));
  } else {
    url.searchParams.set("action", "rsvpStatus");
    url.searchParams.set("requestId", params.requestId);
    url.searchParams.set("t", String(Date.now()));
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      body,
      headers: method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" } : {},
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Apps Script HTTP " + response.status);
    const raw = await response.text();
    let payload;
    try { payload = JSON.parse(raw); }
    catch { throw new Error("Apps Script returned non-JSON; redeploy Code.gs and check access permissions"); }
    if (payload.requestId !== params.requestId || !VALID_STATUS.has(payload.status)) {
      throw new Error("Apps Script response does not match the Request ID");
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function verifySaved(scriptUrl, requestId, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const result = await scriptRequest(scriptUrl, "GET", { requestId }, 4500);
      if (result.status === "success") return result;
      // GET 'pending' is not a failure; allow the row to become visible.
    } catch (error) {
      // A failed read is not proof the POST failed.
      if (i === tries - 1) console.warn("RSVP status check:", error.message);
    }
    if (i < tries - 1) await sleep(400 + i * 400);
  }
  return null;
}

export default async function handler(request) {
  const reqUrl = new URL(request.url);
  if (!["POST", "GET"].includes(request.method)) {
    return json({ status: "error", message: "Method not allowed" }, 405);
  }
  let params;
  if (request.method === "POST") {
    try { params = await request.json(); }
    catch { return json({ status: "error", message: "Invalid JSON request" }, 400); }
  } else {
    params = { requestId: reqUrl.searchParams.get("requestId") };
  }
  const requestId = String(params?.requestId ?? "");
  if (!ID_PATTERN.test(requestId)) {
    return json({ status: "error", requestId, message: "Invalid request ID" }, 400);
  }
  if (request.method === "POST") {
    const name = String(params.name ?? "");
    const attendance = String(params.attendance ?? "");
    const guests = Number(params.guests);
    const message = String(params.message ?? "");
    if (!name.trim() || name.length > 50 || !NAME_PATTERN.test(name) ||
        !["Yes, I'll be there", "Sorry, I can't make it"].includes(attendance) ||
        !Number.isInteger(guests) || guests < 1 || guests > 10 || message.length > 320) {
      return json({ status: "error", requestId, message: "Please check the RSVP fields." }, 400);
    }
  }

  const scriptUrl = (process.env.RSVP_APPS_SCRIPT_URL || DEFAULT_SCRIPT_URL).trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(scriptUrl)) {
    return json({ status: "unavailable", requestId, message: "RSVP_APPS_SCRIPT_URL is invalid." }, 503);
  }

  if (request.method === "GET") {
    try {
      const result = await scriptRequest(scriptUrl, "GET", { requestId }, 6500);
      return json(result);
    } catch (error) {
      console.error("RSVP GET:", error.message);
      return json({ status: "unavailable", requestId, message: "Unable to read the confirmation endpoint." }, 503);
    }
  }

  try {
    const result = await scriptRequest(scriptUrl, "POST", params, 9500);
    if (["success", "duplicate", "error"].includes(result.status)) {
      return json(result);
    }
  } catch (error) {
    console.warn("RSVP POST response could not be read:", error.message);
  }
  // Google may already have committed the row. Verify the unique ID, not name.
  const found = await verifySaved(scriptUrl, requestId, 3);
  if (found) return json(found);
  return json({
    status: "pending",
    requestId,
    message: "The submission was sent, but Google has not confirmed its final status.",
  });
}
