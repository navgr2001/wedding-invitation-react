import BackgroundIcons from "./components/BackgroundIcons";
import BackgroundMusic from "./components/BackgroundMusic";
import EnvelopeIntro from "./components/EnvelopeIntro";
import FloatingControls from "./components/FloatingControls";
import GalleryLightbox from "./components/GalleryLightbox";

import Footer from "./layout/Footer";
import Topbar from "./layout/Topbar";
import BottomNavigation from "./layout/BottomNavigation";

import WeddingPage from "./pages/WeddingPage";

function WeddingInvitationView({ content }) {
  return (
    <>
      <BackgroundIcons />

      <EnvelopeIntro />

      <Topbar />

      <BottomNavigation />

      <WeddingPage content={content} />

      <Footer footer={content.footer} />

      <GalleryLightbox />

      <BackgroundMusic />

      <FloatingControls />
    </>
  );
}

export default WeddingInvitationView;
