// Settings panel - user preferences and configuration
export function createSettingsPanel(container) {
  container.innerHTML = `
    <div id="settings" class="settings">
      <h1>Settings</h1>
      <form id="settings-form">
        <div class="setting-group">
          <label for="project-name">Project Name</label>
          <input type="text" id="project-name" value="My Project" />
        </div>
        <div class="setting-group">
          <label for="timeout">Test Timeout (ms)</label>
          <input type="number" id="timeout" value="30000" min="1000" step="1000" />
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="parallel" checked />
            Run tests in parallel
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="headless" checked />
            Headless mode
          </label>
        </div>
        <button type="submit" id="save-settings">Save Settings</button>
        <p id="save-status" style="display:none" class="success">Settings saved!</p>
      </form>
    </div>
  `;

  const form = container.querySelector('#settings-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = container.querySelector('#save-status');
    status.style.display = 'block';
    setTimeout(() => { status.style.display = 'none'; }, 2000);
  });
}
