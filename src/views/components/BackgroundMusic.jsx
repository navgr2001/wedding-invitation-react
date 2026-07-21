import { useBackgroundMusicViewModel } from "../../viewmodels/music/useBackgroundMusicViewModel";

function BackgroundMusic() {
  useBackgroundMusicViewModel();

  return (
    <audio
      id="bgMusic"
      src="assets/audio/EdSheeranPerfect.mp3"
      preload="none"
      loop
    />
  );
}

export default BackgroundMusic;
