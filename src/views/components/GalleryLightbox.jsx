function GalleryLightbox() {
  return (
    <div aria-hidden="true" className="lightbox" id="lightbox">
      <button
        aria-label="Close photo"
        className="lightbox__close"
        id="lightboxClose"
      >
        <svg
          fill="none"
          height="20"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="20"
        >
          <path d="M18 6 6 18"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
      <img alt="" className="lightbox__img" id="lightboxImg" />
    </div>
  );
}

export default GalleryLightbox;
