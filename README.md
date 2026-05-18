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
