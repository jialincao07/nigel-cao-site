# Nigel Cao: Personal Site ⛷️

**Live site:** https://jialincao07.github.io/nigel-cao-site/

My personal website for the NOBE capstone. It's themed around skiing at Alpental, Washington, where I ski. As you scroll, a skier carves down the run on the right side of the page. The altimeter drops from the summit (5,420 ft) to the base lodge (3,140 ft), and each section of the site is a gate you clear on the way down.

## Interactive features

1. **The ski run (scroll-driven).** The skier's position, lean, tracks, altitude and "gates cleared" counter all update as you scroll. Clearing the last gate shows a "Run complete" message with a button back to the summit. If your device is set to reduce motion, the skier still moves but stops tilting and animating.
2. **Trail map (filterable gallery).** My projects are rated like ski runs (● green, ■ blue, ◆ black diamond for how hard they were). You can filter by category (Research, Ventures, Service, Tech), search by keyword, see an empty state when nothing matches, and reset the map.

## Project structure

```
index.html          page content
styles.css          all styling
src/slope.js        pure math for the ski run (position, lean, altitude, gates)
src/trails.js       experience data + filter / render logic
src/app.js          connects the logic above to the page (scroll, clicks, typing)
tests/              automated tests (Node's built-in test runner)
scripts/check.js    quality checks (syntax, accessibility basics, broken links)
scripts/build.js    copies the site into dist/ for deployment
.github/workflows/  CI/CD pipeline
```

The logic lives in `slope.js` and `trails.js` and never touches the page directly, so it can be tested in Node without a browser. `app.js` is a thin layer that reads the scroll position or the filter state, calls those functions, and updates the page.

## Setup

You only need [Node.js](https://nodejs.org) 20 or newer. There are **no packages to install**.

```bash
git clone https://github.com/jialincao07/nigel-cao-site.git
cd nigel-cao-site
npm start          # serves the site at http://localhost:3000
```

You can also open `index.html` through any static server, such as VS Code's Live Server. It uses JavaScript modules, so double-clicking the file won't work.

## Tests

```bash
npm run check      # quality checks
npm test           # 24 unit tests
npm run build      # builds dist/
```

The tests cover normal use and edge cases:

| Area | Normal use | Edge cases |
| --- | --- | --- |
| Scroll progress | 0 at top, 0.5 halfway, 1 at bottom | overscroll / iOS bounce, page shorter than the screen (no divide-by-zero) |
| Skier | starts at summit, ends at base, leans into turns | never leaves the panel, even with out-of-range input |
| Altimeter & gates | 5,420 ft → 3,140 ft, gates count up | no gates, sections past the end of the page |
| Trail map filter | category filter, case-insensitive search, both combined | extra spaces, unknown category, **no results → empty state**, **reset** |
| Rendering | one card per run with its difficulty | HTML in content is escaped |

## CI/CD and deployment

The pipeline is in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

1. **Every pull request** runs the `verify` job: quality checks, then tests, then build.
2. **Merge gate:** `main` is protected. A PR can't be merged until `verify` passes.
3. **After a merge**, `verify` runs again on `main`. If it passes, the `deploy` job publishes `dist/` to **GitHub Pages**.
4. **Live site:** the site always reflects the latest `main` commit that passed.

Nothing deploys unless the tests pass, because `deploy` depends on `verify` (`needs: verify`).

### Evidence

- Failed check, then the fix: _see PR link below_
- Main deployment: _see Actions run link below_

## AI use and limitations

I built this with help from Claude (Anthropic's AI coding assistant). Claude generated the first version of the code, tests, workflow and this README from my resume, my answers about design and content, and the capstone requirements. I chose the skiing/Alpental theme, the content and the style. I reviewed the code and can explain how each part works.

**Limitations:**

- The tests cover the logic (`slope.js`, `trails.js`) but not the browser wiring in `app.js`. I checked that part by hand in a browser. Browser tests (e.g. Playwright) would be a good next step.
- The skier follows a fixed curve, not the real Alpental trail map.
- Fonts load from Google Fonts. Without internet the site falls back to system fonts.
