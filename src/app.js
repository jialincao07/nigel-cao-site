// Wires the pure logic in slope.js and trails.js to the page.
import {
  scrollProgress,
  trailPoint,
  trailSamples,
  skierLean,
  altitudeAt,
  gatesCleared,
  gateStop,
} from './slope.js';
import { RUNS, CATEGORIES, filterRuns, renderRuns, resultLabel } from './trails.js';

const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Ski run ---------- */

const skier = $('.skier');
const trail = $('.slope__trail');
const tracks = $('.slope__tracks');
const gatesLayer = $('.slope__gates');
const sections = [...document.querySelectorAll('[data-gate]')];
const altitudeEl = $('[data-altitude]');
const gatesEl = $('[data-gates]');
const finish = $('[data-finish]');

$('[data-gates-total]').textContent = sections.length;

const toPoints = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');
trail.setAttribute('points', toPoints(trailSamples(1)));

let stops = [];

function measureGates() {
  const height = document.documentElement.scrollHeight;
  stops = sections.map((s) => gateStop(s.offsetTop, height, window.innerHeight));
  gatesLayer.innerHTML = stops
    .map((stop, i) => {
      const p = trailPoint(stop);
      return `<span class="gate" data-i="${i}" style="left:${p.x}%;top:${p.y}%"></span>`;
    })
    .join('');
}

function update() {
  const progress = scrollProgress(
    window.scrollY,
    document.documentElement.scrollHeight,
    window.innerHeight,
  );
  const p = trailPoint(progress);
  skier.style.left = `${p.x}%`;
  skier.style.top = `${p.y}%`;
  skier.style.setProperty('--lean', `${reduceMotion.matches ? 0 : skierLean(progress)}deg`);
  tracks.setAttribute('points', toPoints(trailSamples(progress)));

  altitudeEl.textContent = altitudeAt(progress).toLocaleString('en-US');
  const cleared = gatesCleared(progress, stops);
  if (gatesEl.textContent !== String(cleared)) gatesEl.textContent = cleared;

  gatesLayer.querySelectorAll('.gate').forEach((g, i) => g.classList.toggle('is-cleared', i < cleared));
  sections.forEach((s, i) => s.classList.toggle('is-cleared', i < cleared));
  finish.hidden = cleared < sections.length;
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    update();
    ticking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  measureGates();
  update();
});

$('[data-summit]').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  $('#top').focus({ preventScroll: true });
});

/* ---------- Trail map ---------- */

const chips = $('.chips');
const search = $('#run-search');
const runsEl = $('[data-runs]');
const countEl = $('[data-result-count]');
const state = { category: 'all', query: '' };

chips.innerHTML = CATEGORIES.map(
  (c) => `<button type="button" class="chip" data-category="${c.id}" aria-pressed="${c.id === 'all'}">${c.label}</button>`,
).join('');

function renderMap() {
  const results = filterRuns(RUNS, state);
  runsEl.innerHTML = renderRuns(results);
  countEl.textContent = resultLabel(results.length, RUNS.length);
  chips.querySelectorAll('.chip').forEach((chip) => {
    chip.setAttribute('aria-pressed', String(chip.dataset.category === state.category));
  });
  // The page height changes with the results, so gate positions move.
  measureGates();
  update();
}

chips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.category = chip.dataset.category;
  renderMap();
});

search.addEventListener('input', () => {
  state.query = search.value;
  renderMap();
});

$('[data-reset]').addEventListener('click', () => {
  state.category = 'all';
  state.query = '';
  search.value = '';
  renderMap();
  search.focus();
});

renderMap();
window.addEventListener('load', () => {
  measureGates();
  update();
});
