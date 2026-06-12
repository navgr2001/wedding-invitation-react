import { useEffect } from "react";

export function useBackgroundMusicViewModel() {
  useEffect(() => {
    const audio = document.getElementById("bgMusic");
    if (!audio) return undefined;

    let shouldResumeWhenVisible = false;
    let hasUserStartedMusic = false;

    const notifyMusicState = () => {
      window.dispatchEvent(
        new CustomEvent("wedding:music-state", {
          detail: {
            muted: audio.muted,
            paused: audio.paused,
          },
        }),
      );
    };

    const pauseMusicForLeavingPage = () => {
      if (!audio.paused) {
        shouldResumeWhenVisible = true;
        audio.pause();
        notifyMusicState();
      }
    };

    const resumeMusicWhenUserReturns = async () => {
      if (!shouldResumeWhenVisible) return;
      if (audio.muted) return;
      if (!hasUserStartedMusic) return;

      shouldResumeWhenVisible = false;

      try {
        await audio.play();
        notifyMusicState();
      } catch (error) {
        console.warn("Music resume blocked:", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseMusicForLeavingPage();
      } else {
        resumeMusicWhenUserReturns();
      }
    };

    const handlePageHide = () => {
      pauseMusicForLeavingPage();
    };

    const handlePageShow = () => {
      resumeMusicWhenUserReturns();
    };

    const handleAudioPlay = () => {
      hasUserStartedMusic = true;
      notifyMusicState();
    };

    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", notifyMusicState);
    audio.addEventListener("volumechange", notifyMusicState);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", notifyMusicState);
      audio.removeEventListener("volumechange", notifyMusicState);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);
}
