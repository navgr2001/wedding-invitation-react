// Same-origin RSVP gateway: avoids iframe / cross-origin response ambiguity.
// Set RSVP_APPS_SCRIPT_URL in Netlify environment variables after deploying
// the new Apps Script version. Falls back to the current published URL.
const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyDZ8T3Qru7FGbVZOLm8TE4Eb47nD7p8YzHvfROR2Er40cwbC9B_Fhthbimj8eDdUB2cw/exec";
const REQUEST_ID = /^rsvp_[0-9]{10,17}_[a-z0-9]{6,20}$/;
const NAME = /^[\p{L}\p{M}\p{N} &.]+$/u;
const json = (payload, statusCode = 200) => new Response(JSON.stringify(payload), {
  status: statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

export default async (request) => {
  const url = new URL(request.url);
  if (request.method !== "POST" && request.method !== "GET") {
    return json({ status: "error", message: "Method not allowed." }, 405);
  }
  let body = {};
  if (request.method === "POST") {
    try { body = await request.json(); } catch { return json({ status: "error", message: "Invalid request." }, 400); }
  }
  const requestId = String(request.method === "GET" ? url.searchParams.get("requestId") || "" : body.requestId || "");
  if (!REQUEST_ID.test(requestId)) return json({ status: "error", requestId, message: "Invalid request ID." }, 400);

  if (request.method === "POST") {
    const name = String(body.name ?? "");
    const attendance = String(body.attendance ?? "");
    const guests = Number(body.guests);
    const message = String(body.message ?? "");
    if (name.length < 1 || name.length > 50 || !NAME.test(name.trim()) ||
        !["Yes, I'll be there", "Sorry, I can't make it"].includes(attendance) ||
        !Number.isInteger(guests) || guests < 1 || guests > 10 || message.length > 320) {
      return json({ status: "error", requestId, message: "Please check the RSVP fields and try again." }, 400);
    }
  }

  const appUrl = process.env.RSVP_APPS_SCRIPT_URL || DEFAULT_SCRIPT_URL;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(appUrl)) {
    return json({ status: "unavailable", requestId, message: "RSVP service configuration is invalid." }, 503);
  }
  const target = new URL(appUrl);
  const isPost = request.method === "POST";
  if (!isPost) {
    target.searchParams.set("action", "rsvpStatus");
    target.searchParams.set("requestId", requestId);
  } else {
    target.searchParams.set("transport", "json");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10500);
  try {
    const upstream = await fetch(target, {
      method: isPost ? "POST" : "GET",
      headers: isPost ? { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" } : {},
      body: isPost ? new URLSearchParams(Object.entries({ ...body, requestId }).map(([k, v]) => [k, String(v ?? "")])) : undefined,
      redirect: "follow",
      signal: controller.signal,
    });
    if (!upstream.ok) return json({ status: "unavailable", requestId, message: "RSVP confirmation endpoint unavailable." }, 503);
    let payload;
    try { payload = await upstream.json(); }
    catch { return json({ status: "unavailable", requestId, message: "Apps Script deployment is not returning JSON. Deploy the updated doGet.gs as a new version." }, 503); }
    if (payload.requestId !== requestId || !["success", "duplicate", "error", "pending", "unavailable"].includes(payload.status)) {
      return json({ status: "unavailable", requestId, message: "Unexpected RSVP confirmation response." }, 503);
    }
    return json({ status: payload.status, requestId, message: payload.message || "" });
  } catch {
    // Unknown: Google may have committed the row even when its reply was lost.
    return json({ status: "pending", requestId, message: "Checking whether the RSVP was saved." });
  } finally { clearTimeout(timer); }
};
