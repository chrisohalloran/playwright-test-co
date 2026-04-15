// Dashboard component - displays user metrics and recent activity
export function createDashboard(container) {
  container.innerHTML = `
    <div id="dashboard" class="dashboard">
      <h1>Dashboard</h1>
      <div class="metrics">
        <div class="metric-card" id="total-tests">
          <span class="metric-value">0</span>
          <span class="metric-label">Total Tests</span>
        </div>
        <div class="metric-card" id="pass-rate">
          <span class="metric-value">0%</span>
          <span class="metric-label">Pass Rate</span>
        </div>
        <div class="metric-card" id="avg-duration">
          <span class="metric-value">0s</span>
          <span class="metric-label">Avg Duration</span>
        </div>
      </div>
      <div class="recent-runs" id="recent-runs">
        <h2>Recent Runs</h2>
        <ul id="runs-list"></ul>
      </div>
    </div>
  `;

  // Simulate loading data
  setTimeout(() => {
    container.querySelector('#total-tests .metric-value').textContent = '142';
    container.querySelector('#pass-rate .metric-value').textContent = '94%';
    container.querySelector('#avg-duration .metric-value').textContent = '3.2s';

    const runsList = container.querySelector('#runs-list');
    const runs = [
      { name: 'PR #42 - Fix login', status: 'passed', tests: 5 },
      { name: 'PR #41 - Update nav', status: 'failed', tests: 12 },
      { name: 'PR #40 - Add search', status: 'passed', tests: 8 },
    ];
    runs.forEach(run => {
      const li = document.createElement('li');
      li.className = `run-item ${run.status}`;
      li.textContent = `${run.name} — ${run.tests} tests — ${run.status}`;
      runsList.appendChild(li);
    });
  }, 300);
}
