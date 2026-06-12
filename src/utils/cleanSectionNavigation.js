const SECTION_ROUTES = {
  "/": null,
  "/details": "details",
  "/rsvp": "rsvp",
  "/gallery": "gallery",
  "/countdown": "countdownSection",
  "/countdown-section": "countdownSection",
  "/couple": "couple",
  "/timeline": "timeline",
  "/words": "words",
  "/seat-finder": "seatFinder",
  "/contact": "contact",
};

const HASH_ROUTE_ALIASES = {
  countdownSection: "/countdown",
  details: "/details",
  rsvp: "/rsvp",
  gallery: "/gallery",
  couple: "/couple",
  timeline: "/timeline",
  words: "/words",
  seatFinder: "/seat-finder",
  contact: "/contact",
};

function getCleanPath(pathname) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  return Object.prototype.hasOwnProperty.call(SECTION_ROUTES, cleanPath)
    ? cleanPath
    : null;
}

function getSectionIdForPath(pathname) {
  const cleanPath = getCleanPath(pathname);
  return cleanPath ? SECTION_ROUTES[cleanPath] : undefined;
}

function scrollToSection(sectionId, behavior = "smooth") {
  if (!sectionId) {
    window.scrollTo({ top: 0, behavior });
    return true;
  }

  const section = document.getElementById(sectionId);
  if (!section) return false;

  section.scrollIntoView({ behavior, block: "start" });
  return true;
}

function normalizeOldHashUrl() {
  const hash = window.location.hash.replace("#", "");
  const cleanPath = HASH_ROUTE_ALIASES[hash];

  if (!cleanPath) return false;

  window.history.replaceState({ sectionPath: cleanPath }, "", cleanPath);
  scrollToSection(SECTION_ROUTES[cleanPath], "auto");
  return true;
}

function handleCurrentCleanPath(behavior = "auto") {
  const sectionId = getSectionIdForPath(window.location.pathname);

  if (sectionId === undefined) return false;

  window.requestAnimationFrame(() => {
    scrollToSection(sectionId, behavior);
  });

  return true;
}

function navigateToCleanSection(pathname) {
  const cleanPath = getCleanPath(pathname);
  if (!cleanPath) return false;

  window.history.pushState({ sectionPath: cleanPath }, "", cleanPath);
  scrollToSection(SECTION_ROUTES[cleanPath], "smooth");
  return true;
}

export function initCleanSectionNavigation() {
  normalizeOldHashUrl();
  handleCurrentCleanPath("auto");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const url = new URL(link.getAttribute("href"), window.location.origin);
    const isSameOrigin = url.origin === window.location.origin;
    const cleanPath = getCleanPath(url.pathname);

    if (!isSameOrigin || !cleanPath || url.hash) return;

    event.preventDefault();
    navigateToCleanSection(cleanPath);
  });

  window.addEventListener("popstate", () => {
    handleCurrentCleanPath("smooth");
  });

  window.addEventListener("wedding:invite-opened", () => {
    handleCurrentCleanPath("smooth");
  });
}
