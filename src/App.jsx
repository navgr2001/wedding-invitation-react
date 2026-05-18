import { useWeddingInteractions } from "./hooks/useWeddingInteractions";
import "./styles/style.css";
import BackgroundIcons from "./components/BackgroundIcons";
import EnvelopeIntro from "./components/EnvelopeIntro";
import Topbar from "./components/Topbar";
import WeddingPage from "./components/WeddingPage";
import Footer from "./components/Footer";
import GalleryLightbox from "./components/GalleryLightbox";
import BackgroundMusic from "./components/BackgroundMusic";
import FloatingControls from "./components/FloatingControls";

function App() {
  useWeddingInteractions();

  return (
    <>
      <BackgroundIcons />
      <EnvelopeIntro />
      <Topbar />
      <WeddingPage />
      <Footer />
      <GalleryLightbox />
      <BackgroundMusic />
      <FloatingControls />
    </>
  );
}

export default App;
