import { useEffect, useState } from "react";

const TABS = [
  { id: "seatFinder", label: "Seat" },
  { id: "details", label: "Details" },
  { id: "rsvp", label: "RSVP" },
  { id: "gallery", label: "Gallery" },
  { id: "guest-upload", label: "Share" },
];

function TabIcon({ id }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (id) {
    case "seatFinder":
      return (
        <svg {...props}>
          <circle cx="12" cy="6" r="2" />
          <path d="M7 11h10v5H7zM5 16h14M7 16v5M17 16v5M5 13v3M19 13v3" />
        </svg>
      );

    case "details":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
          <path d="m9 15 2 2 4-4" />
        </svg>
      );

    case "rsvp":
      return (
        <svg {...props}>
          <path d="M20.8 8.6c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a5 5 0 0 1 8.8-3.2 5 5 0 0 1 8.8 3.2z" />
        </svg>
      );

    case "gallery":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.5" />
          <path d="m4 17 5-5 4 4 3-3 4 4" />
        </svg>
      );

    case "guest-upload":
      return (
        <svg {...props}>
          <path d="M12 16V3m0 0L7 8m5-5 5 5" />
          <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
        </svg>
      );

    default:
      return null;
  }
}

export default function BottomNavigation() {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let frameId = null;

    const updateActiveTab = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;

        const threshold = window.innerHeight * 0.35;

        // No active tab by default
        let current = null;

        // Detect the section currently being viewed
        for (const tab of TABS) {
          const section = document.getElementById(tab.id);

          if (!section) continue;

          const rect = section.getBoundingClientRect();

          if (rect.top <= threshold && rect.bottom > threshold) {
            current = tab.id;
            break;
          }
        }

        setActiveId(current);
      });
    };

    updateActiveTab();

    window.addEventListener("scroll", updateActiveTab, {
      passive: true,
    });

    window.addEventListener("resize", updateActiveTab);

    window.addEventListener("wedding:invite-opened", updateActiveTab);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", updateActiveTab);

      window.removeEventListener("resize", updateActiveTab);

      window.removeEventListener("wedding:invite-opened", updateActiveTab);
    };
  }, []);

  const handleNavigation = (id) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const behavior = reducedMotion ? "auto" : "smooth";

    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior,
      block: "start",
    });

    setActiveId(id);
  };

  return (
    <nav className="bottomNav" aria-label="Wedding invitation navigation">
      <div className="bottomNav__inner">
        {TABS.map((tab) => {
          const isActive = activeId === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              className={[
                "bottomNav__tab",
                isActive ? "bottomNav__tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleNavigation(tab.id)}
              aria-label={
                tab.id === "seatFinder" ? "Find your seat" : tab.label
              }
              aria-current={isActive ? "location" : undefined}
            >
              <span className="bottomNav__icon">
                <TabIcon id={tab.id} />
              </span>

              <span className="bottomNav__label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
