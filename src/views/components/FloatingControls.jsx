import { useFloatingControlsViewModel } from "../../viewmodels/controls/useFloatingControlsViewModel";

function FloatingControls() {
  const {
    isInsideWebsite,
    showBackToTop,
    isMuted,
    toggleMusic,
    scrollToTop,
  } = useFloatingControlsViewModel();

  return (
    <div
      className={`floatingControls ${
        isInsideWebsite ? "" : "floatingControls--hidden"
      }`}
      aria-label="Website controls"
    >
      <button
        type="button"
        className="floatingControls__btn floatingControls__btn--music"
        onClick={toggleMusic}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
        aria-pressed={isMuted}
      >
        <img src="assets/img/icons/musicnote.png" alt="" aria-hidden="true" />
      </button>

      <button
        type="button"
        className={`floatingControls__btn floatingControls__btn--top ${
          showBackToTop ? "" : "floatingControls__btn--hidden"
        }`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <img src="assets/img/icons/back-to-top.png" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}

export default FloatingControls;
