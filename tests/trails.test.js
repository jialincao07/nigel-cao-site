import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RUNS, CATEGORIES, DIFFICULTY, filterRuns, renderRuns, escapeHtml, resultLabel } from '../src/trails.js';

const titles = (runs) => runs.map((r) => r.title);

test('with no filters, every run is shown', () => {
  assert.equal(filterRuns(RUNS).length, RUNS.length);
  assert.equal(filterRuns(RUNS, { category: 'all', query: '' }).length, RUNS.length);
});

test('category filter only shows runs from that trail', () => {
  const research = filterRuns(RUNS, { category: 'research' });
  assert.ok(research.length > 0);
  assert.ok(research.every((r) => r.category === 'research'));
});

test('search is case-insensitive and checks titles, summaries and tags', () => {
  assert.deepEqual(titles(filterRuns(RUNS, { query: 'SUGAR' })), ['Sugar Shield']);
  assert.deepEqual(titles(filterRuns(RUNS, { query: 'regression' })), ['Mapping Influence']);
  assert.deepEqual(titles(filterRuns(RUNS, { query: 'piano' })), ['Seattle Youth Music Festival']);
});

test('category and search combine', () => {
  assert.deepEqual(titles(filterRuns(RUNS, { category: 'tech', query: 'typescript' })), ['Uplift']);
  assert.equal(filterRuns(RUNS, { category: 'research', query: 'typescript' }).length, 0);
});

test('edge case: extra spaces in a search are ignored', () => {
  assert.equal(filterRuns(RUNS, { query: '   ' }).length, RUNS.length);
  assert.deepEqual(titles(filterRuns(RUNS, { query: '  board   regression ' })), ['Mapping Influence']);
});

test('edge case: unknown category falls back to all runs', () => {
  assert.equal(filterRuns(RUNS, { category: 'snowboarding' }).length, RUNS.length);
});

test('edge case: a search with no matches shows the empty state', () => {
  const none = filterRuns(RUNS, { query: 'zzz-no-match' });
  assert.equal(none.length, 0);
  const html = renderRuns(none);
  assert.match(html, /No runs match/);
  assert.match(html, /role="status"/);
});

test('reset: going back to defaults restores the full map', () => {
  const narrowed = filterRuns(RUNS, { category: 'service', query: 'books' });
  assert.equal(narrowed.length, 1);
  assert.equal(filterRuns(RUNS, { category: 'all', query: '' }).length, RUNS.length);
});

test('render shows one card per run with its difficulty', () => {
  const html = renderRuns(RUNS);
  assert.equal((html.match(/<article/g) || []).length, RUNS.length);
  assert.match(html, /Black diamond/);
});

test('render escapes text so content cannot inject HTML', () => {
  assert.equal(escapeHtml('<b>"A&B"</b>'), '&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;');
  const html = renderRuns([{ ...RUNS[0], title: '<script>alert(1)</script>' }]);
  assert.ok(!html.includes('<script>'));
});

test('every run has valid data', () => {
  const ids = CATEGORIES.map((c) => c.id);
  for (const run of RUNS) {
    assert.ok(ids.includes(run.category), `${run.title} has a bad category`);
    assert.ok(run.difficulty in DIFFICULTY, `${run.title} has a bad difficulty`);
    assert.ok(run.tags.length > 0, `${run.title} needs tags`);
  }
});

test('result label wording', () => {
  assert.equal(resultLabel(7, 7), 'Showing all 7 runs');
  assert.equal(resultLabel(2, 7), 'Showing 2 of 7 runs');
  assert.equal(resultLabel(0, 7), 'Showing 0 of 7 runs');
});
