import { useEffect, useState } from "react";

function FloatingControls() {
  const [isInsideWebsite, setIsInsideWebsite] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const checkIntroScreen = () => {
      const introScreen = document.getElementById("envelopeIntro");
      setIsInsideWebsite(!introScreen);
    };

    checkIntroScreen();

    const observer = new MutationObserver(checkIntroScreen);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 360);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    const audio = document.getElementById("bgMusic");
    if (!audio) return undefined;

    const syncMusicState = () => {
      setIsMuted(audio.muted);
    };

    const handleMusicState = (event) => {
      if (typeof event.detail?.muted === "boolean") {
        setIsMuted(event.detail.muted);
      } else {
        syncMusicState();
      }
    };

    syncMusicState();

    audio.addEventListener("volumechange", syncMusicState);
    window.addEventListener("wedding:music-state", handleMusicState);

    return () => {
      audio.removeEventListener("volumechange", syncMusicState);
      window.removeEventListener("wedding:music-state", handleMusicState);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = document.getElementById("bgMusic");
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);

    if (!audio.muted && audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.warn("Music play blocked:", error);
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
