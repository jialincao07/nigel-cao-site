// The Trail Map: my experiences as ski runs, plus the filter logic.

export const CATEGORIES = [
  { id: 'all', label: 'All runs' },
  { id: 'research', label: 'Research' },
  { id: 'ventures', label: 'Ventures' },
  { id: 'service', label: 'Service' },
  { id: 'tech', label: 'Tech' },
];

// Difficulty is how hard the run was for me, ski-rating style.
export const DIFFICULTY = {
  green: { symbol: '●', label: 'Green circle' },
  blue: { symbol: '■', label: 'Blue square' },
  black: { symbol: '◆', label: 'Black diamond' },
};

export const RUNS = [
  {
    title: 'Mapping Influence',
    org: 'Summer Research Academy, UC Santa Barbara',
    when: '2025',
    category: 'research',
    difficulty: 'black',
    summary:
      'Built a Fortune 500 dataset on boards, earnings and market cap, then used regression to test whether board-network centrality predicts return on assets. Presented to 300+ peers and faculty.',
    tags: ['finance', 'regression', 'data'],
  },
  {
    title: 'Indigenous Allyship in Practice',
    org: 'Independent research with Prof. Bo Zhao, University of Washington',
    when: '2025',
    category: 'research',
    difficulty: 'black',
    summary:
      'Published in the International Journal of Arts, Humanities & Social Science. Proposes a six-step framework for ethical engagement with the Yakama Nation.',
    tags: ['published', 'case study'],
  },
  {
    title: 'Sugar Shield',
    org: 'CEO & Co-founder',
    when: '2025 – 2026',
    category: 'ventures',
    difficulty: 'blue',
    summary:
      'Led a team of four developing a gum that curbs sugar cravings. Built the business plan and pitch for the Conrad Innovation Challenge and the Diamond Challenge.',
    tags: ['startup', 'pitch', 'business plan'],
  },
  {
    title: 'Yakama Empowerment Project',
    org: 'Co-founder',
    when: '2024 – 2026',
    category: 'service',
    difficulty: 'blue',
    summary:
      'Nonprofit promoting literacy for the Yakama people. Book drives at three schools collected 1,000+ books for the tribal library, later expanded to Southeast Asia with a Singapore partner.',
    tags: ['nonprofit', 'literacy'],
  },
  {
    title: 'Seattle Youth Music Festival',
    org: 'Co-founder',
    when: '2022 – 2026',
    category: 'service',
    difficulty: 'green',
    summary:
      'Annual recitals pairing youth musicians with seniors. Grew the audience from 100 to 180, doubled performers to 40+, and secured a $500 sponsorship.',
    tags: ['music', 'events', 'piano'],
  },
  {
    title: 'Uplift',
    org: 'App Developer',
    when: '2025 – Present',
    category: 'tech',
    difficulty: 'blue',
    summary:
      'Journaling app that surfaces emotional trends from entries to support teen mental health. Built by a team of three with Next.js, TypeScript and Tailwind on Vercel.',
    tags: ['web app', 'typescript', 'mental health'],
  },
  {
    title: 'Drone Obstacle Course',
    org: 'Technology Student Association',
    when: '2024 – 2026',
    category: 'tech',
    difficulty: 'green',
    summary:
      'Six-person team that built a drone to fly through a pipe course and retrieve objects. Qualified at regionals and advanced to state.',
    tags: ['hardware', 'engineering'],
  },
];

// Filter runs by category and a free-text search. An unknown category is
// treated as "all" so a bad value never hides everything.
export function filterRuns(runs, { category = 'all', query = '' } = {}) {
  const known = CATEGORIES.some((c) => c.id === category);
  const cat = known ? category : 'all';
  const words = String(query).toLowerCase().trim().split(/\s+/).filter(Boolean);

  return runs.filter((run) => {
    if (cat !== 'all' && run.category !== cat) return false;
    const haystack = [run.title, run.org, run.summary, ...run.tags].join(' ').toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// HTML for the run cards, or a friendly empty state when nothing matches.
export function renderRuns(runs) {
  if (runs.length === 0) {
    return '<p class="empty" role="status">No runs match that search. Try another trail or reset the map.</p>';
  }
  return runs
    .map((run) => {
      const d = DIFFICULTY[run.difficulty];
      return `<article class="run run--${run.difficulty}">
  <div class="run__top">
    <span class="run__badge" title="${d.label}"><span aria-hidden="true">${d.symbol}</span> ${d.label}</span>
    <span class="run__when">${escapeHtml(run.when)}</span>
  </div>
  <h3>${escapeHtml(run.title)}</h3>
  <p class="run__org">${escapeHtml(run.org)}</p>
  <p>${escapeHtml(run.summary)}</p>
  <ul class="run__tags">${run.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
</article>`;
    })
    .join('\n');
}

export function resultLabel(count, total) {
  if (count === total) return `Showing all ${total} runs`;
  return `Showing ${count} of ${total} run${total === 1 ? '' : 's'}`;
}
