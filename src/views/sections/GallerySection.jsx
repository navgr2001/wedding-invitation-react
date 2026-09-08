import { useState } from "react";

function GallerySection({ gallery }) {
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageError = (src) => {
    setFailedImages((currentFailedImages) => {
      const nextFailedImages = new Set(currentFailedImages);
      nextFailedImages.add(src);

      return nextFailedImages;
    });
  };

  const visiblePhotos = gallery.photos.filter(
    (photo) => !failedImages.has(photo.src),
  );

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

        <div
          aria-label="Photo gallery"
          className="gallery reveal"
          id="galleryGrid"
        >
          {visiblePhotos.map((photo, index) => (
            <button
              type="button"
              aria-label={`Open photo ${index + 1}`}
              className="gallery__item"
              data-src={photo.fullSrc || photo.src}
              key={photo.src}
              onContextMenu={(event) => event.preventDefault()}
            >
              <img
                src={photo.src}
                srcSet={
                  photo.smallSrc
                    ? `${photo.smallSrc} 480w, ${photo.src} 960w`
                    : undefined
                }
                sizes="(max-width: 680px) 48vw, (max-width: 900px) 32vw, 24vw"
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                draggable="false"
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
                onError={() => handleImageError(photo.src)}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
