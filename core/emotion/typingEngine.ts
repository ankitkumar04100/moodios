import { TypingFeatures } from "./types";

let lastTimestamp = 0;
let flightTimes: number[] = [];
let holdTimes: number[] = [];
let pauseTimes: number[] = [];

export function handleKeyDown() {
  const now = performance.now();
  if (lastTimestamp !== 0) {
    flightTimes.push(now - lastTimestamp);
  }
  lastTimestamp = now;
}

export function handleKeyUp() {
  const now = performance.now();
  holdTimes.push(now - lastTimestamp);
}

export function computeTypingFeatures(): TypingFeatures {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;

  return {
    averageFlightTime: avg(flightTimes),
    averageHoldTime: avg(holdTimes),
    burstiness: avg(flightTimes) < 80 ? 1 : 0,
    pauseFrequency: pauseTimes.length,
  };
}
