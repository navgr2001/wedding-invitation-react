import { useEffect } from "react";

function BackgroundMusic() {
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

    const handleAudioPause = () => {
      notifyMusicState();
    };

    const handleAudioVolumeChange = () => {
      notifyMusicState();
    };

    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);
    audio.addEventListener("volumechange", handleAudioVolumeChange);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      audio.removeEventListener("play", handleAudioPlay);
      audio.removeEventListener("pause", handleAudioPause);
      audio.removeEventListener("volumechange", handleAudioVolumeChange);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return (
    <audio
      id="bgMusic"
      src="assets/audio/AThousandYears.mp3"
      preload="auto"
      loop
    />
  );
}

export default BackgroundMusic;
