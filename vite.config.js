import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rsvpHandler from "./netlify/functions/rsvp.mjs";

// Serve the same RSVP gateway during `npm run dev`, without iframe fallbacks.
// Production Netlify uses netlify/functions/rsvp.mjs directly.
function localRsvpGateway() {
  return {
    name: "local-rsvp-gateway",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/.netlify/functions/rsvp")) return next();
        try {
          let body = "";
          if (req.method === "POST") {
            for await (const chunk of req) body += chunk.toString();
          }
          const request = new Request("http://localhost" + req.url, {
            method: req.method,
            headers: { "content-type": req.headers["content-type"] || "application/json" },
            ...(req.method === "POST" ? { body } : {}),
          });
          const response = await rsvpHandler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          console.error("Local RSVP gateway failed:", error);
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ status: "unavailable", message: "Local RSVP gateway failed." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localRsvpGateway()],
  publicDir: "public",
});
