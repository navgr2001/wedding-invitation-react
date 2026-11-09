# RSVP confirmation fix — deploy both sides

## Root cause
The old frontend used a hidden Google iframe plus browser-side confirmation polling. Google Apps Script could save the Sheet row but the browser could miss the reply. The old Netlify gateway also treated a lost/non-JSON POST reply as uncertain even when the row had already been saved.

## This release
- `netlify/functions/rsvp.mjs` submits via server-side POST. If the POST response cannot be read, it verifies the Request ID by a server-side GET to the Apps Script status endpoint.
- `src/viewmodels/wedding/useWeddingInteractions.js` reads the gateway JSON, shows a green success message only upon a matching saved Request ID, and does NOT issue a second POST after an uncertain outcome. Instead the button becomes **Check RSVP Status**.
- `vite.config.js` serves the same gateway during `npm run dev`, so local browser tests no longer use iframe confirmation.
- Existing `apps-script/doGet.gs` already includes `action=rsvpStatus`, `transport=json`, and sixth-column Request ID handling; this source is included unchanged for deployment consistency.

## Deploy
1. In Google Apps Script, replace the contents of Code.gs with the supplied `apps-script/doGet.gs`. Save and deploy a **new version** of your existing Web app deployment. Verify **Execute as: Me** and appropriate **Who has access** permissions.
2. In Netlify, deploy the whole repository with functions included. Build command `npm run build`, publish `dist`, functions directory `netlify/functions`. **Do not manually upload only the dist folder.**
3. In Netlify environment variables, set `RSVP_APPS_SCRIPT_URL` to your current Google Apps Script `/exec` URL. The gateway contains a fallback URL, but the environment variable overrides it. If the environment variable points to an OLD deployment, update it and trigger a new Netlify deploy.
4. Verify `https://YOUR-SITE.netlify.app/.netlify/functions/rsvp?requestId=invalid` returns JSON `{ "status": "error" ... }`. HTML means the function is not deployed.
5. Verify `https://YOUR-SCRIPT/exec?action=rsvpStatus&requestId=invalid` returns JSON with a requestId/status, not `{ok:true,items:...}`. Otherwise Code.gs was not redeployed correctly.
6. Submit one fresh test RSVP and check column F (Request ID) in the sheet. The site must show the success message after a matching confirmation.

## Local dev
`npm run dev` now has the same `/ .netlify/functions/rsvp` backend (without the space); it is served by the Vite gateway plugin. Do not run multiple development servers on the same port.

## Safety
A saved Google Sheets row and a browser confirmation are different events. This design recovers lost POST replies by exact Request ID rather than showing an unverified success. If the backend status endpoint is not deployed, the form will still say it cannot confirm the save. Do not change that into automatic success.
