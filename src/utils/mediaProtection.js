const BLOCKED_SHORTCUT_KEYS = new Set(["s", "u", "p"]);

export function enableMediaProtection() {
  const preventDefault = (event) => {
    event.preventDefault();
  };

  const handleKeyDown = (event) => {
    const key = event.key?.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && BLOCKED_SHORTCUT_KEYS.has(key)) {
      event.preventDefault();
      return;
    }

    if (
      event.key === "F12" ||
      ((event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        ["i", "j", "c"].includes(key))
    ) {
      event.preventDefault();
      return;
    }

    if (event.key === "PrintScreen") {
      event.preventDefault();
    }
  };

  const handleDragStart = (event) => {
    const target = event.target;

    if (
      target instanceof HTMLImageElement ||
      target instanceof HTMLVideoElement ||
      target?.closest?.("[data-protected-media='true']")
    ) {
      event.preventDefault();
    }
  };

  const handleSelectStart = (event) => {
    const target = event.target;

    if (
      target instanceof HTMLImageElement ||
      target instanceof HTMLVideoElement ||
      target?.closest?.("[data-protected-media='true']")
    ) {
      event.preventDefault();
    }
  };

  const handleTouchStart = (event) => {
    const target = event.target;

    if (
      target instanceof HTMLImageElement ||
      target instanceof HTMLVideoElement ||
      target?.closest?.("[data-protected-media='true']")
    ) {
      /*
       * Do not call preventDefault here globally,
       * because that can break scrolling on mobile.
       *
       * Long-press save is discouraged through
       * CSS -webkit-touch-callout: none.
       */
    }
  };

  document.addEventListener("contextmenu", preventDefault);
  document.addEventListener("dragstart", handleDragStart);
  document.addEventListener("selectstart", handleSelectStart);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });

  return () => {
    document.removeEventListener("contextmenu", preventDefault);
    document.removeEventListener("dragstart", handleDragStart);
    document.removeEventListener("selectstart", handleSelectStart);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("touchstart", handleTouchStart);
  };
}
