import { useEffect, useMemo, useState } from "react";

const WEDDING_TARGET_TIME = new Date("2026-12-10T00:00:00+05:30").getTime();

function getCountdownParts() {
  const now = Date.now();
  const diff = WEDDING_TARGET_TIME - now;
  const total = Math.max(0, diff);

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor(total / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(total / (1000 * 60)) % 60,
    seconds: Math.floor(total / 1000) % 60,
    isCompleted: diff <= 0,
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(() => getCountdownParts());
  const hearts = useMemo(() => Array.from({ length: 18 }), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div
        className={`weddingCountdown ${
          timeLeft.isCompleted ? "weddingCountdown--completed" : ""
        }`}
      >
        <div className="weddingCountdown__grid" aria-label="Wedding countdown">
          <div className="weddingCountdown__card">
            <span className="weddingCountdown__number">
              {timeLeft.isCompleted ? "00" : timeLeft.days}
            </span>
            <span className="weddingCountdown__label">Days</span>
          </div>

          <div className="weddingCountdown__card">
            <span className="weddingCountdown__number">
              {pad2(timeLeft.hours)}
            </span>
            <span className="weddingCountdown__label">Hours</span>
          </div>

          <div className="weddingCountdown__card">
            <span className="weddingCountdown__number">
              {pad2(timeLeft.minutes)}
            </span>
            <span className="weddingCountdown__label">Minutes</span>
          </div>

          <div className="weddingCountdown__card">
            <span className="weddingCountdown__number">
              {pad2(timeLeft.seconds)}
            </span>
            <span className="weddingCountdown__label">Seconds</span>
          </div>
        </div>

        {timeLeft.isCompleted && (
          <div className="weddingCountdownComplete">
            <div className="weddingCountdownComplete__card">
              <div
                className="weddingCountdownComplete__icons"
                aria-hidden="true"
              >
                <span>♡</span>
                <span>✦</span>
                <span>♡</span>
              </div>

              <p className="weddingCountdownComplete__eyebrow">
                The wait is over
              </p>

              <h3 className="weddingCountdownComplete__title">
                Today We Celebrate Love
              </h3>

              <p className="weddingCountdownComplete__text">
                Our forever begins today. Thank you for being part of this
                beautiful celebration.
              </p>
            </div>

            <div
              className="weddingCountdownComplete__hearts"
              aria-hidden="true"
            >
              {hearts.map((_, index) => (
                <span key={index}>♡</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .weddingCountdown,
        .weddingCountdown * {
          box-sizing: border-box;
        }

        .weddingCountdown {
          width: min(1120px, 100%);
          margin: 0 auto;
          position: relative;
        }

        .weddingCountdown__grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(150px, 1fr));
          gap: clamp(18px, 3vw, 46px);
          align-items: stretch;
          justify-content: center;
        }

        .weddingCountdown__card {
          min-height: 138px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 22px 18px;
          border: 1px solid rgba(17, 24, 39, 0.08);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow:
            0 20px 48px rgba(17, 24, 39, 0.08),
            0 8px 18px rgba(190, 81, 3, 0.055);
          backdrop-filter: blur(10px);
        }

        .weddingCountdown__number {
          color: #111827;
          font-family: var(--font-gilda, serif);
          font-size: clamp(3.2rem, 6vw, 4.5rem);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: 0.02em;
        }

        .weddingCountdown__label {
          margin-top: 12px;
          color: rgba(17, 24, 39, 0.68);
          font-family: var(--font-montserrat, sans-serif);
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .weddingCountdownComplete {
          width: 100%;
          position: relative;
          margin-top: clamp(34px, 5vw, 54px);
          padding: 0 0 8px;
          display: flex;
          justify-content: center;
        }

        .weddingCountdownComplete__card {
          position: relative;
          z-index: 2;
          width: min(700px, 100%);
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(34px, 5vw, 54px) clamp(24px, 5vw, 64px);
          border: 1px solid rgba(190, 81, 3, 0.14);
          border-radius: 26px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(255, 245, 236, 0.98),
              rgba(255, 255, 255, 0.98) 54%,
              rgba(255, 249, 244, 0.96)
            );
          box-shadow:
            0 30px 76px rgba(17, 24, 39, 0.11),
            0 16px 34px rgba(190, 81, 3, 0.08);
          text-align: center;
          overflow: hidden;
          animation: weddingCountdownReveal 700ms ease both;
        }

        .weddingCountdownComplete__card::before {
          content: "";
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(190, 81, 3, 0.07);
          border-radius: 21px;
          pointer-events: none;
        }

        .weddingCountdownComplete__icons {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 20px;
          color: #d46f35;
          font-size: clamp(1.25rem, 2.5vw, 1.55rem);
          line-height: 1;
        }

        .weddingCountdownComplete__icons span {
          display: inline-block;
          animation: weddingCountdownSparkle 1.8s ease-in-out infinite;
        }

        .weddingCountdownComplete__icons span:nth-child(2) {
          animation-delay: 0.18s;
        }

        .weddingCountdownComplete__icons span:nth-child(3) {
          animation-delay: 0.36s;
        }

        .weddingCountdownComplete__eyebrow {
          margin: 0 0 18px;
          color: #c95c1c;
          font-family: var(--font-montserrat, sans-serif);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.34em;
          text-transform: uppercase;
        }

        .weddingCountdownComplete__title {
          max-width: 620px;
          margin: 0;
          color: #1f2937;
          font-family: var(--font-gilda, serif);
          font-size: clamp(2.65rem, 5.6vw, 4.15rem);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: 0.01em;
        }

        .weddingCountdownComplete__text {
          max-width: 540px;
          margin: 22px auto 0;
          color: #737b8c;
          font-size: clamp(1rem, 1.7vw, 1.14rem);
          line-height: 1.75;
        }

        .weddingCountdownComplete__hearts {
          position: absolute;
          inset: -20px 0 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .weddingCountdownComplete__hearts span {
          position: absolute;
          bottom: -34px;
          color: rgba(190, 81, 3, 0.34);
          opacity: 0;
          animation: weddingCountdownHeartFloat 6s ease-in forwards;
        }

        .weddingCountdownComplete__hearts span:nth-child(1) { left: 8%; font-size: 18px; animation-delay: 0s; --x: -18px; }
        .weddingCountdownComplete__hearts span:nth-child(2) { left: 14%; font-size: 22px; animation-delay: .14s; --x: 18px; }
        .weddingCountdownComplete__hearts span:nth-child(3) { left: 20%; font-size: 20px; animation-delay: .28s; --x: -24px; }
        .weddingCountdownComplete__hearts span:nth-child(4) { left: 27%; font-size: 25px; animation-delay: .42s; --x: 20px; }
        .weddingCountdownComplete__hearts span:nth-child(5) { left: 34%; font-size: 18px; animation-delay: .56s; --x: -18px; }
        .weddingCountdownComplete__hearts span:nth-child(6) { left: 40%; font-size: 24px; animation-delay: .7s; --x: 24px; }
        .weddingCountdownComplete__hearts span:nth-child(7) { left: 47%; font-size: 20px; animation-delay: .84s; --x: -24px; }
        .weddingCountdownComplete__hearts span:nth-child(8) { left: 54%; font-size: 27px; animation-delay: .98s; --x: 18px; }
        .weddingCountdownComplete__hearts span:nth-child(9) { left: 60%; font-size: 19px; animation-delay: 1.12s; --x: -18px; }
        .weddingCountdownComplete__hearts span:nth-child(10) { left: 66%; font-size: 24px; animation-delay: 1.26s; --x: 22px; }
        .weddingCountdownComplete__hearts span:nth-child(11) { left: 72%; font-size: 21px; animation-delay: 1.4s; --x: -22px; }
        .weddingCountdownComplete__hearts span:nth-child(12) { left: 78%; font-size: 26px; animation-delay: 1.54s; --x: 20px; }
        .weddingCountdownComplete__hearts span:nth-child(13) { left: 84%; font-size: 18px; animation-delay: 1.68s; --x: -18px; }
        .weddingCountdownComplete__hearts span:nth-child(14) { left: 90%; font-size: 24px; animation-delay: 1.82s; --x: 18px; }
        .weddingCountdownComplete__hearts span:nth-child(15) { left: 18%; font-size: 21px; animation-delay: 1.96s; --x: -24px; }
        .weddingCountdownComplete__hearts span:nth-child(16) { left: 38%; font-size: 26px; animation-delay: 2.1s; --x: 22px; }
        .weddingCountdownComplete__hearts span:nth-child(17) { left: 58%; font-size: 20px; animation-delay: 2.24s; --x: -20px; }
        .weddingCountdownComplete__hearts span:nth-child(18) { left: 82%; font-size: 25px; animation-delay: 2.38s; --x: 24px; }

        @keyframes weddingCountdownReveal {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes weddingCountdownSparkle {
          0%,
          100% {
            opacity: 0.7;
            transform: translateY(0) scale(1);
          }

          50% {
            opacity: 1;
            transform: translateY(-5px) scale(1.12);
          }
        }

        @keyframes weddingCountdownHeartFloat {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
          }

          12% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translateY(-420px) translateX(var(--x, 0px)) rotate(18deg) scale(1.18);
          }
        }

        @media (max-width: 900px) {
          .weddingCountdown {
            width: min(560px, 100%);
          }

          .weddingCountdown__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }

          .weddingCountdownComplete__card {
            width: min(560px, 100%);
          }
        }

        @media (max-width: 520px) {
          .weddingCountdown {
            width: min(340px, 100%);
          }

          .weddingCountdown__grid {
            gap: 14px;
          }

          .weddingCountdown__card {
            min-height: 108px;
            padding: 18px 10px;
            border-radius: 18px;
          }

          .weddingCountdown__number {
            font-size: clamp(2.85rem, 15vw, 4rem);
          }

          .weddingCountdown__label {
            margin-top: 8px;
            font-size: 0.78rem;
          }

          .weddingCountdownComplete {
            margin-top: 30px;
          }

          .weddingCountdownComplete__card {
            width: min(340px, 100%);
            min-height: auto;
            padding: 34px 22px;
            border-radius: 24px;
          }

          .weddingCountdownComplete__card::before {
            inset: 10px;
            border-radius: 20px;
          }

          .weddingCountdownComplete__icons {
            margin-bottom: 16px;
          }

          .weddingCountdownComplete__eyebrow {
            margin-bottom: 16px;
            font-size: 0.74rem;
            letter-spacing: 0.26em;
          }

          .weddingCountdownComplete__title {
            max-width: 290px;
            font-size: clamp(2.3rem, 10vw, 3rem);
            line-height: 1.15;
          }

          .weddingCountdownComplete__text {
            max-width: 286px;
            margin-top: 20px;
            font-size: 0.98rem;
            line-height: 1.75;
          }
        }

        @media (max-width: 380px) {
          .weddingCountdown {
            width: min(310px, 100%);
          }

          .weddingCountdown__grid {
            gap: 12px;
          }

          .weddingCountdown__card {
            min-height: 102px;
            padding: 16px 8px;
          }

          .weddingCountdown__number {
            font-size: clamp(2.45rem, 14vw, 3.5rem);
          }

          .weddingCountdownComplete__card {
            width: min(310px, 100%);
            padding: 30px 18px;
          }

          .weddingCountdownComplete__title {
            max-width: 270px;
            font-size: clamp(2.05rem, 9vw, 2.55rem);
          }

          .weddingCountdownComplete__text {
            max-width: 260px;
            font-size: 0.94rem;
          }
        }
      `}</style>
    </>
  );
}

export default CountdownTimer;
