// Pure math for the scrolling ski run. No DOM access here, so every
// function can be unit tested in Node.

// Alpental, WA: summit and base elevation in feet.
export const SUMMIT_FT = 5420;
export const BASE_FT = 3140;

// How many left/right turns the skier carves on the way down.
const TURNS = 2.5;

export function clamp(value, min = 0, max = 1) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

// How far down the page the visitor is, from 0 (top) to 1 (bottom).
// A page that fits on one screen counts as fully scrolled.
export function scrollProgress(scrollY, scrollHeight, viewportHeight) {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= 0) return 1;
  return clamp(scrollY / scrollable);
}

// Point on the trail at progress t, in percent of the slope panel
// (x: 0-100 across, y: 0-100 down).
export function trailPoint(t) {
  const p = clamp(t);
  return {
    x: 50 + 30 * Math.sin(p * Math.PI * 2 * TURNS),
    y: 4 + p * 92,
  };
}

// Lean angle in degrees: the skier tilts into each turn.
export function skierLean(t) {
  return Math.round(35 * Math.cos(clamp(t) * Math.PI * 2 * TURNS));
}

// Evenly spaced points along the trail, used to draw it and the tracks.
export function trailSamples(upTo = 1, count = 120) {
  const end = clamp(upTo);
  const steps = Math.max(1, Math.round(count * end));
  const points = [];
  for (let i = 0; i <= steps; i++) points.push(trailPoint((end * i) / steps));
  return points;
}

// Current altitude in feet for progress t.
export function altitudeAt(t) {
  return Math.round(SUMMIT_FT - clamp(t) * (SUMMIT_FT - BASE_FT));
}

// Number of gates the skier has passed. `stops` are progress values (0-1).
export function gatesCleared(progress, stops) {
  return stops.filter((stop) => progress >= stop - 0.0001).length;
}

// Where a section's gate sits on the run: the progress at which the
// section's top reaches the upper part of the screen.
export function gateStop(sectionTop, scrollHeight, viewportHeight) {
  return scrollProgress(sectionTop - viewportHeight * 0.4, scrollHeight, viewportHeight);
}
