// ============================================================
// sidebar.js - Shared Sidebar HTML injector
// ============================================================

function renderSidebar(activePage) {
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'billing', icon: '🧾', label: 'New Billing', href: 'billing.html' },
    { id: 'history', icon: '📋', label: 'Bill History', href: 'history.html' },
    { id: 'menu', icon: '🍛', label: 'Menu Management', href: 'menu.html' },
    { id: 'reports', icon: '📈', label: 'Reports & Profit', href: 'reports.html' },
    { id: 'settings', icon: '⚙️', label: 'Settings', href: 'settings.html' },
  ];

  const navHtml = nav.map(item => `
    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-icon">🍽️</div>
          <div class="logo-text">
            <h2>Dinesh Hotel</h2>
            <span>Admin Panel</span>
          </div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Main Menu</div>
        ${navHtml}
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">👤</div>
          <div class="user-details">
            <div class="user-name" id="user-email">Admin</div>
            <div class="user-role">Administrator</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm w-full" id="logout-btn">
          🚪 Sign Out
        </button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;
}

function injectSidebar(activePage) {
  const target = document.getElementById('sidebar-container');
  if (target) {
    target.innerHTML = renderSidebar(activePage);
    // attach logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to sign out?')) {
          await Auth.signOut();
        }
      });
    }
    // re-init sidebar toggle
    initSidebar();
    loadUserInfo();
  }
}
