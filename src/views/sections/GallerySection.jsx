import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 600;
const ROWS_BEFORE_EXPAND = 5;

/** Preserve fallback image loading for older and newer mobile browsers. */
function GalleryPhoto({ photo, index }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [
    ...new Set([photo.smallSrc, photo.src, photo.fullSrc].filter(Boolean)),
  ];
  const activeSource = sources[Math.min(sourceIndex, sources.length - 1)];
  const hasFailed = sourceIndex >= sources.length;

  return (
    <button
      type="button"
      aria-label={`Open photo ${index + 1}`}
      className="gallery__item"
      data-src={photo.fullSrc || photo.src}
      onContextMenu={(event) => event.preventDefault()}
    >
      {hasFailed ? (
        <span
          className="gallery__fallback"
          role="img"
          aria-label="Photo unavailable"
        >
          Photo temporarily unavailable
        </span>
      ) : (
        <img
          src={activeSource}
          alt={photo.alt}
          loading={index < 6 ? "eager" : "lazy"}
          fetchPriority={index < 2 ? "high" : "auto"}
          decoding="async"
          draggable={false}
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
          onError={() => setSourceIndex((current) => current + 1)}
        />
      )}
    </button>
  );
}

function GallerySection({ gallery }) {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
      : false,
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onChange = (event) => setIsMobile(event.matches);
    setIsMobile(media.matches);
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    // Older Safari versions use the legacy MediaQueryList event API.
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  const previewCount = ROWS_BEFORE_EXPAND * (isMobile ? 3 : 4);
  const photos = gallery.photos || [];
  const hasMore = photos.length > previewCount;
  const visiblePhotos = expanded ? photos : photos.slice(0, previewCount);

  return (
    <section
      className="section section--alt"
      id="gallery"
      data-protected-media="true"
    >
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{gallery.title}</h2>
          <p className="muted">{gallery.description}</p>
        </div>

        {/* Keep the masonry container visible: do not apply scroll reveal to it. */}
        <div aria-label="Photo gallery" className="gallery" id="galleryGrid">
          {visiblePhotos.map((photo, index) => (
            <GalleryPhoto key={photo.src} photo={photo} index={index} />
          ))}
        </div>

        {hasMore && (
          <div className="galleryMore">
            <button
              className={`galleryMore__button${expanded ? " galleryMore__button--expanded" : ""}`}
              type="button"
              aria-controls="galleryGrid"
              aria-expanded={expanded}
              onClick={() => {
                setExpanded((value) => !value);
                if (expanded) {
                  document.getElementById("gallery")?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "auto"
                      : "smooth",
                    block: "start",
                  });
                }
              }}
            >
              <span>{expanded ? "Show Less" : "See More Moments"}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <p className="galleryMore__caption">
              {expanded
                ? "A little glimpse of our story"
                : `Explore ${photos.length - previewCount} more memories`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default GallerySection;
