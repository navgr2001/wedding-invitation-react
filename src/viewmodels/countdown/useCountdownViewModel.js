import { useEffect, useMemo, useState } from "react";
import { weddingContent } from "../../models/weddingContent";

const WEDDING_TARGET_TIME = new Date(weddingContent.countdown.targetIso).getTime();

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

export function useCountdownViewModel() {
  const [timeLeft, setTimeLeft] = useState(() => getCountdownParts());
  const hearts = useMemo(() => Array.from({ length: 18 }), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getCountdownParts());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return {
    timeLeft,
    hearts,
    displayDays: timeLeft.isCompleted ? "00" : timeLeft.days,
    displayHours: pad2(timeLeft.hours),
    displayMinutes: pad2(timeLeft.minutes),
    displaySeconds: pad2(timeLeft.seconds),
  };
}
