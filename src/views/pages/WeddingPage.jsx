import CountdownSection from "../sections/CountdownSection";
import CoupleSection from "../sections/CoupleSection";
import FinalCtaSection from "../sections/FinalCtaSection";
import GallerySection from "../sections/GallerySection";
import HeroSection from "../sections/HeroSection";
import RsvpSection from "../sections/RsvpSection";
import SeatFinderSection from "../sections/SeatFinderSection";
import TimelineSection from "../sections/TimelineSection";
import WeddingDetailsSection from "../sections/WeddingDetailsSection";
import WordsSection from "../sections/WordsSection";

function WeddingPage({ content }) {
  return (
    <main id="home">
      <HeroSection hero={content.hero} />
      <CountdownSection countdown={content.countdown} />
      <SeatFinderSection seatFinder={content.seatFinder} />
      <CoupleSection couple={content.couple} section={content.coupleSection} />
      <WeddingDetailsSection weddingDetails={content.weddingDetails} />
      <TimelineSection timeline={content.timeline} />
      <RsvpSection rsvp={content.rsvp} />
      <WordsSection words={content.words} />
      <GallerySection gallery={content.gallery} />
      <FinalCtaSection finalCta={content.finalCta} />
    </main>
  );
}

export default WeddingPage;
