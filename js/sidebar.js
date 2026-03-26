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
          <img src="/images/logo.png"
               alt="Logo"
               style="width:44px;height:44px;object-fit:contain;border-radius:10px;">
          <div class="logo-text">
            <h2>${APP_CONFIG.Dinesh Hotel}</h2>
            <span>${APP_CONFIG.Admin Panel}</span>
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

// ── Custom Logout Modal ──────────────────────────────────────────────────────
function showLogoutModal() {
  // Remove existing if any
  const existing = document.getElementById('logout-modal');
  if (existing) existing.remove();

  // Inject styles once
  if (!document.getElementById('logout-modal-style')) {
    const style = document.createElement('style');
    style.id = 'logout-modal-style';
    style.textContent = `
      #logout-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .lo-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        animation: loFadeIn 0.2s ease;
      }
      .lo-box {
        position: relative;
        background: #ffffff;
        border-radius: 20px;
        padding: 40px 32px 32px;
        width: 100%;
        max-width: 320px;
        text-align: center;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
        animation: loSlideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .lo-icon-wrap {
        width: 72px;
        height: 72px;
        background: #fff5f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
        font-size: 32px;
        border: 3px solid #fde4d4;
      }
      .lo-title {
        font-size: 20px;
        font-weight: 700;
        color: #1a1a2e;
        margin: 0 0 8px;
        font-family: inherit;
      }
      .lo-msg {
        font-size: 14px;
        color: #888;
        margin: 0 0 28px;
        line-height: 1.6;
      }
      .lo-actions {
        display: flex;
        gap: 10px;
      }
      .lo-cancel {
        flex: 1;
        padding: 13px 10px;
        border: 2px solid #e8e8e8;
        background: #f8f8f8;
        color: #555;
        font-size: 14px;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .lo-cancel:hover {
        border-color: #ccc;
        background: #efefef;
      }
      .lo-confirm {
        flex: 1;
        padding: 13px 10px;
        border: none;
        background: linear-gradient(135deg, #E8621A, #cf5516);
        color: #fff;
        font-size: 14px;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        box-shadow: 0 4px 14px rgba(232,98,26,0.35);
      }
      .lo-confirm:hover {
        background: linear-gradient(135deg, #cf5516, #b84a12);
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(232,98,26,0.45);
      }
      .lo-confirm:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      @keyframes loFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes loSlideUp {
        from { transform: translateY(24px) scale(0.95); opacity: 0; }
        to   { transform: translateY(0) scale(1);       opacity: 1; }
      }
      @keyframes loSlideDown {
        from { transform: translateY(0) scale(1);       opacity: 1; }
        to   { transform: translateY(24px) scale(0.95); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Build modal
  const modal = document.createElement('div');
  modal.id = 'logout-modal';
  modal.innerHTML = `
    <div class="lo-overlay" id="lo-overlay"></div>
    <div class="lo-box" id="lo-box">
      <div class="lo-icon-wrap">🚪</div>
      <div class="lo-title">Sign Out?</div>
      <p class="lo-msg">You will be logged out and<br>returned to the login page.</p>
      <div class="lo-actions">
        <button class="lo-cancel" id="lo-cancel-btn">Cancel</button>
        <button class="lo-confirm" id="lo-confirm-btn">Yes, Sign Out</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on overlay click
  document.getElementById('lo-overlay').addEventListener('click', closeLogoutModal);
  document.getElementById('lo-cancel-btn').addEventListener('click', closeLogoutModal);

  // Confirm sign out
  document.getElementById('lo-confirm-btn').addEventListener('click', async () => {
    const btn = document.getElementById('lo-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Signing out...';
    try {
      await Auth.logout();
    } catch (e) {
      window.location.href = '/index.html';
    }
  });
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  const box   = document.getElementById('lo-box');
  if (!modal) return;
  if (box) {
    box.style.animation = 'loSlideDown 0.2s ease forwards';
  }
  setTimeout(() => {
    if (modal) modal.remove();
  }, 200);
}

// ── Inject Sidebar ───────────────────────────────────────────────────────────
function injectSidebar(activePage) {
  const target = document.getElementById('sidebar-container');
  if (target) {
    target.innerHTML = renderSidebar(activePage);

    // Attach logout → custom modal (no browser confirm)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => showLogoutModal());
    }

    // Re-init sidebar toggle
    initSidebar();
    loadUserInfo();
  }
}
