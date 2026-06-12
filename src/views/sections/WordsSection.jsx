function WordsSection({ words }) {
  return (
    <section className="section wordsSection" id="words">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{words.title}</h2>
          <p className="muted">{words.description}</p>
        </div>
        <div className="wordsWrap reveal">
          <div
            className="wordsCard"
            id="wordsCarousel"
            aria-label="Words of Love carousel"
          >
            <div className="wordsTrack" id="wordsTrack"></div>
          </div>
          <div
            className="wordsDots"
            id="wordsDots"
            aria-label="Carousel pagination"
          ></div>
        </div>
      </div>
    </section>
  );
}

export default WordsSection;
