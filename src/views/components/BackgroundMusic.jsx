import { useBackgroundMusicViewModel } from "../../viewmodels/music/useBackgroundMusicViewModel";

function BackgroundMusic() {
  useBackgroundMusicViewModel();

  return (
    <audio
      id="bgMusic"
      src="assets/audio/AThousandYears.mp3"
      preload="none"
      loop
    />
  );
}

export default BackgroundMusic;
