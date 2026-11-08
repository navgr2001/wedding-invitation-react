# Shalom & Dewmini Wedding Invitation — React Version

This is the React/Vite migration of the original HTML, CSS, and JavaScript wedding invitation website.

## What was preserved

- Existing wording/content
- Existing images, icons, audio, and video
- Existing CSS animation classes and JavaScript interactions
- RSVP Google Apps Script integration
- Countdown, envelope intro, music start, gallery lightbox, and words carousel behavior

## Tech stack

- React
- Vite
- Modern ES modules
- CSS preserved from the original project
- Netlify-ready build configuration

## Setup in VS Code

1. Extract this project folder.
2. Open the folder in VS Code.
3. Open a terminal in VS Code.
4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

6. Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173
```

## Build for production

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Deploy to Netlify

Use these settings:

- Build command: `npm run build`
- Publish directory: `dist`

The included `netlify.toml` already contains these settings.


## Windows npm install fix

If npm tries to download from an internal registry or Vite is not recognized, run:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
npm run dev
```

## RSVP delivery (reliable Netlify gateway)

This version sends production RSVPs through the same-origin Netlify Function
`/.netlify/functions/rsvp` and expects **JSON** from the updated Apps Script
when `transport=json` is provided. The original hidden iframe is a fallback
for plain Vite local development; to test the production transport locally,
use `netlify dev` with Netlify CLI.

**Mandatory deployment order:**
1. Replace the Google Apps Script with `apps-script/doGet.gs`, save, then
   **Deploy > Manage deployments > Edit > New version > Deploy**. Keep the
   *existing* `/exec` deployment URL if updating the same deployment.
2. Deploy this entire project to Netlify, including `netlify/functions/rsvp.mjs`
   and `netlify.toml`; a static-only deployment will not work.
3. If the Apps Script deployment URL changed, set `RSVP_APPS_SCRIPT_URL` in
   Netlify environment variables to the exact new `/exec` URL (server-only),
   **and** update `src/models/weddingContent.js` for the local fallback.
4. Check `https://YOUR-SITE.netlify.app/.netlify/functions/rsvp?requestId=invalid`:
   a JSON response is expected (400 invalid request ID); a 404 or HTML means
   the Netlify function is not deployed.
5. Submit with a fresh guest name, verify exactly one Google Sheet row with
   matching Request ID column, and verify the website shows success.

Never interpret a timeout or an unavailable confirmation service as success:
the Apps Script may have written the row. Use the unique request ID to check.
