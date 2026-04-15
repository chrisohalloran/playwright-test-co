// Search page - find and filter test results
export function createSearchPage(container) {
  container.innerHTML = `
    <div id="search-page" class="search-page">
      <h1>Search Results</h1>
      <div class="search-bar">
        <input type="text" id="search-input" placeholder="Search tests..." />
        <button id="search-btn">Search</button>
      </div>
      <div id="search-results" class="search-results">
        <p class="empty-state">Enter a query to search test results</p>
      </div>
    </div>
  `;

  const input = container.querySelector('#search-input');
  const btn = container.querySelector('#search-btn');
  const results = container.querySelector('#search-results');

  const allResults = [
    { name: 'login.spec.ts', status: 'passed' },
    { name: 'dashboard.spec.ts', status: 'passed' },
    { name: 'settings.spec.ts', status: 'failed' },
    { name: 'search.spec.ts', status: 'passed' },
  ];

  btn.addEventListener('click', () => {
    const query = input.value.toLowerCase();
    const filtered = query
      ? allResults.filter(r => r.name.includes(query))
      : allResults;

    if (filtered.length === 0) {
      results.innerHTML = '<p class="empty-state">No results found</p>';
    } else {
      results.innerHTML = filtered
        .map(r => `<div class="result-item ${r.status}">${r.name} — ${r.status}</div>`)
        .join('');
    }
  });
}
