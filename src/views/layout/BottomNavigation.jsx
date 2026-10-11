import { useEffect, useState } from "react";

const TABS = [
  { id: "home", label: "Home" },
  { id: "details", label: "Details" },
  { id: "rsvp", label: "RSVP" },
  { id: "gallery", label: "Gallery" },
  { id: "guest-upload", label: "Share" },
];

function TabIcon({ id }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (id) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3.5 10 8.5-7 8.5 7V20h-6v-6H9v6H3.5z" />
        </svg>
      );

    case "details":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M8.5 9h7M8.5 13h7M8.5 17H13" />
        </svg>
      );

    case "rsvp":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4.5 7 7.5 6 7.5-6" />
          <path d="m9.3 16 1.6 1.5 3.5-3.5" />
        </svg>
      );

    case "gallery":
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <circle cx="9" cy="9.5" r="1.5" />
          <path d="m5.5 17 4.5-4.5 2.9 2.8 2-2 3.5 3.7" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <path d="M12 16V4m0 0L8 8m4-4 4 4" />
          <path d="M4.5 14.5v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5" />
        </svg>
      );
  }
}

function BottomNavigation() {
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    let frame = 0;

    const updateActive = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const threshold = window.innerHeight * 0.35;
        let current = "home";

        for (const tab of TABS.slice(1)) {
          const element = document.getElementById(tab.id);

          if (element && element.getBoundingClientRect().top <= threshold) {
            current = tab.id;
          }
        }

        setActiveId(current);
      });
    };

    updateActive();

    window.addEventListener("scroll", updateActive, {
      passive: true,
    });

    window.addEventListener("resize", updateActive);

    window.addEventListener("wedding:invite-opened", updateActive);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      window.removeEventListener("wedding:invite-opened", updateActive);
    };
  }, []);

  const navigate = (id) => {
    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setActiveId(id);
      return;
    }

    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setActiveId(id);
  };

  return (
    <nav className="bottomNav" aria-label="Mobile wedding navigation">
      <div className="bottomNav__inner">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`bottomNav__tab${
              activeId === tab.id ? " bottomNav__tab--active" : ""
            }`}
            onClick={() => navigate(tab.id)}
            aria-label={
              tab.id === "guest-upload" ? "Share your moments" : tab.label
            }
            aria-current={activeId === tab.id ? "location" : undefined}
          >
            <span className="bottomNav__icon">
              <TabIcon id={tab.id} />
            </span>

            <span className="bottomNav__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;
