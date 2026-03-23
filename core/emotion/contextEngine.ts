import { ContextFeatures } from "./types";

let switches = 0;
let pointerMovements: number[] = [];
let scrollEvents: number[] = [];
let idleStart = Date.now();

export function registerAppSwitch() {
  switches++;
}

export function registerPointerMove(dist: number) {
  pointerMovements.push(dist);
}

export function registerScroll(speed: number) {
  scrollEvents.push(speed);
}

export function computeContextFeatures(): ContextFeatures {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;

  return {
    appSwitchRate: switches,
    idleTime: (Date.now() - idleStart) / 1000,
    scrollSpeed: avg(scrollEvents),
    pointerJitter: avg(pointerMovements),
  };
}
