import { useCountdownViewModel } from "../../viewmodels/countdown/useCountdownViewModel";

function CountdownTimer() {
  const {
    timeLeft,
    hearts,
    displayDays,
    displayHours,
    displayMinutes,
    displaySeconds,
  } = useCountdownViewModel();

  return (
    <div
      className={`weddingCountdown ${
        timeLeft.isCompleted ? "weddingCountdown--completed" : ""
      }`}
    >
      <div className="weddingCountdown__grid" aria-label="Wedding countdown">
        <CountdownCard value={displayDays} label="Days" />
        <CountdownCard value={displayHours} label="Hours" />
        <CountdownCard value={displayMinutes} label="Minutes" />
        <CountdownCard value={displaySeconds} label="Seconds" />
      </div>

      {timeLeft.isCompleted && <CountdownComplete hearts={hearts} />}
    </div>
  );
}

function CountdownCard({ value, label }) {
  return (
    <div className="weddingCountdown__card">
      <span className="weddingCountdown__number">{value}</span>
      <span className="weddingCountdown__label">{label}</span>
    </div>
  );
}

function CountdownComplete({ hearts }) {
  return (
    <div className="weddingCountdownComplete">
      <div className="weddingCountdownComplete__card">
        <div className="weddingCountdownComplete__icons" aria-hidden="true">
          <span>♡</span>
          <span>✦</span>
          <span>♡</span>
        </div>

        <p className="weddingCountdownComplete__eyebrow">The wait is over</p>

        <h3 className="weddingCountdownComplete__title">
          Today We Celebrate Love
        </h3>

        <p className="weddingCountdownComplete__text">
          Our forever begins today. Thank you for being part of this beautiful
          celebration.
        </p>
      </div>

      <div className="weddingCountdownComplete__hearts" aria-hidden="true">
        {hearts.map((_, index) => (
          <span key={index}>♡</span>
        ))}
      </div>
    </div>
  );
}

export default CountdownTimer;
