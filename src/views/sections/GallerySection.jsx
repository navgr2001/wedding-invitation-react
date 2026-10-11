import { useState } from "react";

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

        <div aria-label="Photo gallery" className="gallery" id="galleryGrid">
          {gallery.photos.map((photo, index) => (
            <GalleryPhoto key={photo.src} photo={photo} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
