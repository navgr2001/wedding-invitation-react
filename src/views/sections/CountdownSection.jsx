import CountdownTimer from "../components/CountdownTimer";

function CountdownSection({ countdown }) {
  return (
    <section className="section section--alt" id="countdownSection">
      <div className="container">
        <div className="sectionHeader reveal">
          <h2 className="h2 timelineTitleV2">{countdown.title}</h2>
          <p className="muted countdownTagline">{countdown.tagline}</p>
        </div>
        <CountdownTimer />
      </div>
    </section>
  );
}

export default CountdownSection;
