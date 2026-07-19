function GallerySection({ gallery }) {
  return (
    <section className="section section--alt" id="gallery">
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
          {gallery.photos.map((photo, index) => (
            <button
              aria-label={`Open photo ${index + 1}`}
              className="gallery__item"
              data-src={photo.src}
              key={photo.src}
            >
              <img alt={photo.alt} loading="lazy" decoding="async" src={photo.src} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
