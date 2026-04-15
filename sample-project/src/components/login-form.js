// Login form component - handles user authentication UI
export function createLoginForm(container) {
  container.innerHTML = `
    <form id="login-form" class="login-form">
      <h2>Sign In</h2>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="••••••••" />
      </div>
      <button type="submit" id="login-btn">Sign In</button>
      <p id="login-error" class="error" style="display:none"></p>
    </form>
  `;

  const form = container.querySelector('#login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    // Simulate login
    document.querySelector('#login-btn').textContent = 'Signing in...';
    setTimeout(() => {
      window.location.hash = '#dashboard';
    }, 500);
  });

  function showError(msg) {
    const errorEl = container.querySelector('#login-error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }
}
