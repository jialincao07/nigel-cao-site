import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUMMIT_FT,
  BASE_FT,
  clamp,
  scrollProgress,
  trailPoint,
  trailSamples,
  skierLean,
  altitudeAt,
  gatesCleared,
  gateStop,
} from '../src/slope.js';

test('scroll progress goes from 0 at the top to 1 at the bottom', () => {
  // 3000px page, 1000px screen: 2000px of scrolling.
  assert.equal(scrollProgress(0, 3000, 1000), 0);
  assert.equal(scrollProgress(1000, 3000, 1000), 0.5);
  assert.equal(scrollProgress(2000, 3000, 1000), 1);
});

test('edge case: overscroll (e.g. iOS bounce) stays between 0 and 1', () => {
  assert.equal(scrollProgress(-80, 3000, 1000), 0);
  assert.equal(scrollProgress(2300, 3000, 1000), 1);
});

test('edge case: a page shorter than the screen counts as finished, not NaN', () => {
  assert.equal(scrollProgress(0, 800, 1000), 1);
  assert.equal(scrollProgress(0, 1000, 1000), 1);
});

test('clamp handles NaN', () => {
  assert.equal(clamp(NaN), 0);
  assert.equal(clamp(0.3), 0.3);
});

test('skier starts at the summit and finishes at the base', () => {
  const start = trailPoint(0);
  const end = trailPoint(1);
  assert.equal(start.y, 4);
  assert.equal(end.y, 96);
  assert.ok(end.y > start.y);
});

test('skier always stays inside the slope panel', () => {
  for (let t = -0.5; t <= 1.5; t += 0.01) {
    const { x, y } = trailPoint(t);
    assert.ok(x >= 0 && x <= 100, `x out of bounds at t=${t}`);
    assert.ok(y >= 0 && y <= 100, `y out of bounds at t=${t}`);
  }
});

test('skier leans into turns and never past 35 degrees', () => {
  assert.equal(skierLean(0), 35);
  for (let t = 0; t <= 1; t += 0.05) assert.ok(Math.abs(skierLean(t)) <= 35);
});

test('tracks only cover the part of the run already skied', () => {
  const tracks = trailSamples(0.5);
  assert.deepEqual(tracks[0], trailPoint(0));
  assert.deepEqual(tracks.at(-1), trailPoint(0.5));
  assert.equal(trailSamples(0).length, 2);
});

test('altimeter reads Alpental summit at the top and base at the bottom', () => {
  assert.equal(altitudeAt(0), SUMMIT_FT);
  assert.equal(altitudeAt(1), BASE_FT);
  assert.equal(altitudeAt(0.5), 4280);
  assert.equal(altitudeAt(2), BASE_FT);
});

test('gates count up as the skier passes them', () => {
  const stops = [0.2, 0.5, 0.8, 1];
  assert.equal(gatesCleared(0, stops), 0);
  assert.equal(gatesCleared(0.5, stops), 2);
  assert.equal(gatesCleared(1, stops), 4);
});

test('edge case: no gates means nothing to clear', () => {
  assert.equal(gatesCleared(1, []), 0);
});

test('a gate sits where its section reaches the upper screen', () => {
  // Section top at 1400px, screen 1000px: gate when scrollY = 1000.
  assert.equal(gateStop(1400, 3000, 1000), 0.5);
  // Sections near the top or past the end are clamped onto the run.
  assert.equal(gateStop(100, 3000, 1000), 0);
  assert.equal(gateStop(5000, 3000, 1000), 1);
});
