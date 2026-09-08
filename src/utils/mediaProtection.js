const BLOCKED_SHORTCUT_KEYS = new Set(["s", "u", "p"]);

export function enableMediaProtection() {
  const preventDefault = (event) => {
    event.preventDefault();
  };

  const handleKeyDown = (event) => {
    const key = event.key?.toLowerCase();

    // Ctrl/Cmd + S  -> Save page
    // Ctrl/Cmd + U  -> View source
    // Ctrl/Cmd + P  -> Print
    if ((event.ctrlKey || event.metaKey) && BLOCKED_SHORTCUT_KEYS.has(key)) {
      event.preventDefault();
      return;
    }

    // Common DevTools shortcuts.
    if (
      event.key === "F12" ||
      ((event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        ["i", "j", "c"].includes(key))
    ) {
      event.preventDefault();
    }

    /*
     * PrintScreen cannot be reliably blocked by a website.
     * Preventing the browser event here is only a deterrent.
     */
    if (event.key === "PrintScreen") {
      event.preventDefault();
    }
  };

  const handleDragStart = (event) => {
    if (
      event.target instanceof HTMLImageElement ||
      event.target instanceof HTMLVideoElement
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

  document.addEventListener("contextmenu", preventDefault);
  document.addEventListener("dragstart", handleDragStart);
  document.addEventListener("selectstart", handleSelectStart);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("contextmenu", preventDefault);
    document.removeEventListener("dragstart", handleDragStart);
    document.removeEventListener("selectstart", handleSelectStart);
    document.removeEventListener("keydown", handleKeyDown);
  };
}
