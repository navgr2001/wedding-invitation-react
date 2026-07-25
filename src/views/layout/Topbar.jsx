import { useEffect, useRef, useState } from "react";

const DetailsIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <rect
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
      width="14"
      x="5"
      y="4"
    />

    <path
      d="M8 8h8M8 12h8M8 16h5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.6"
    />
  </svg>
);

const RsvpIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <rect
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
      width="16"
      x="4"
      y="6"
    />

    <path
      d="m5 7 7 5 7-5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />

    <path
      d="m9.5 15 1.5 1.5 3.5-3.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const GalleryIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <rect
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.6"
      width="16"
      x="4"
      y="5"
    />

    <circle cx="9" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />

    <path
      d="m6.5 17 4.1-4.1 2.5 2.4 1.9-1.9 2.5 3.6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    aria-hidden="true"
    className="navToggle__icon navToggle__icon--menu"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 7.5h14M5 12h14M5 16.5h14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    aria-hidden="true"
    className="navToggle__icon navToggle__icon--close"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      d="m7 7 10 10M17 7 7 17"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
    <path
      d="m9 6 6 6-6 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    />
  </svg>
);

const NAVIGATION_ITEMS = [
  {
    label: "Details",
    description: "Wedding information",
    sectionId: "details",
    icon: DetailsIcon,
  },
  {
    label: "RSVP",
    description: "Confirm your attendance",
    sectionId: "rsvp",
    icon: RsvpIcon,
  },
  {
    label: "Gallery",
    description: "View our memories",
    sectionId: "gallery",
    icon: GalleryIcon,
  },
];

function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationRef = useRef(null);
  const toggleRef = useRef(null);

  const closeNavigationMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    closeNavigationMenu();

    window.requestAnimationFrame(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const scrollToTop = () => {
    closeNavigationMenu();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeNavigationMenu();
      toggleRef.current?.focus();
    };

    const handlePointerDown = (event) => {
      if (!isMenuOpen) {
        return;
      }

      const clickedInsideNavigation = navigationRef.current?.contains(
        event.target,
      );

      const clickedToggle = toggleRef.current?.contains(event.target);

      if (!clickedInsideNavigation && !clickedToggle) {
        closeNavigationMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        closeNavigationMenu();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="topbar" id="topbar">
      <button
        aria-label="Go to the top of the wedding invitation"
        className="topbarBrand"
        onClick={scrollToTop}
        type="button"
      >
        <img
          alt="Shalom and Dewmini wedding logo"
          className="topbarBrand__logo"
          decoding="async"
          height="493"
          src="/assets/branding/wedding-logo.png"
          width="643"
        />
      </button>

      <nav
        aria-label="Primary navigation"
        className={`nav ${isMenuOpen ? "isOpen" : ""}`}
        id="nav"
        ref={navigationRef}
      >
        <div aria-hidden="true" className="nav__mobileHeader">
          <span className="nav__mobileEyebrow">Wedding Menu</span>

          <span className="nav__mobileTitle">Explore our day</span>
        </div>

        <div className="nav__items">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="nav__link"
                key={item.sectionId}
                onClick={() => scrollToSection(item.sectionId)}
                type="button"
              >
                <span aria-hidden="true" className="nav__icon">
                  <Icon />
                </span>

                <span className="nav__content">
                  <span className="nav__label">{item.label}</span>

                  <span className="nav__description">{item.description}</span>
                </span>

                <span aria-hidden="true" className="nav__arrow">
                  <ArrowIcon />
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <button
        aria-controls="nav"
        aria-expanded={isMenuOpen}
        aria-label={
          isMenuOpen ? "Close navigation menu" : "Open navigation menu"
        }
        className="navToggle"
        onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
        ref={toggleRef}
        type="button"
      >
        <MenuIcon />
        <CloseIcon />
      </button>
    </header>
  );
}

export default Topbar;
