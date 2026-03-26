// ============================================================
// app.js - Shared Utilities for Dinesh Hotel Billing System
// ============================================================

// ── Toast Notifications ──
const Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error');   },
  info(msg)    { this.show(msg, 'info');    }
};

// ── Sidebar Toggle (Mobile) ──
function initSidebar() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!hamburger || !sidebar) return;
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ── Live Clock ──
function initClock() {
  const el = document.getElementById('current-time');
  if (!el) return;
  const update = () => {
    el.textContent = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  update();
  setInterval(update, 1000);
}

// ── Format Currency ──
function formatCurrency(amount) {
  return '₹' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ── Format Date ──
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ── Date Helpers ──
const DateUtils = {
  today() { return new Date().toISOString().slice(0, 10); },
  yesterday() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  },
  weekStart() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  },
  monthStart() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  },
  yearStart() {
    return `${new Date().getFullYear()}-01-01`;
  }
};

// ── Custom Confirm Dialog (replaces browser confirm) ──────────────────────
// Usage: confirmAction('Delete this item?').then(ok => { if(ok) doIt(); });
function confirmAction(message, title = 'Are you sure?', confirmText = 'Yes', cancelText = 'Cancel') {
  return new Promise((resolve) => {
    // Remove existing
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();

    // Inject styles once
    if (!document.getElementById('confirm-modal-style')) {
      const style = document.createElement('style');
      style.id = 'confirm-modal-style';
      style.textContent = `
        #confirm-modal {
          position: fixed;
          inset: 0;
          z-index: 99998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .cm-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          animation: cmFade 0.2s ease;
        }
        .cm-box {
          position: relative;
          background: #fff;
          border-radius: 18px;
          padding: 32px 28px 26px;
          width: 100%;
          max-width: 300px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
          animation: cmSlide 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cm-icon { font-size: 36px; margin-bottom: 12px; }
        .cm-title {
          font-size: 17px; font-weight: 700;
          color: #1a1a2e; margin: 0 0 8px;
        }
        .cm-msg {
          font-size: 13px; color: #777;
          margin: 0 0 24px; line-height: 1.6;
        }
        .cm-actions { display: flex; gap: 10px; }
        .cm-cancel {
          flex: 1; padding: 11px 8px;
          border: 2px solid #e8e8e8;
          background: #f8f8f8; color: #555;
          font-size: 13px; font-weight: 600;
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .cm-cancel:hover { background: #eee; border-color: #ccc; }
        .cm-ok {
          flex: 1; padding: 11px 8px;
          border: none;
          background: linear-gradient(135deg, #E8621A, #cf5516);
          color: #fff; font-size: 13px; font-weight: 600;
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
          box-shadow: 0 4px 12px rgba(232,98,26,0.3);
        }
        .cm-ok:hover {
          background: linear-gradient(135deg, #cf5516, #b84a12);
          transform: translateY(-1px);
        }
        @keyframes cmFade  { from{opacity:0} to{opacity:1} }
        @keyframes cmSlide {
          from { transform: translateY(20px) scale(0.95); opacity:0; }
          to   { transform: translateY(0)    scale(1);    opacity:1; }
        }
      `;
      document.head.appendChild(style);
    }

    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.innerHTML = `
      <div class="cm-overlay" id="cm-overlay"></div>
      <div class="cm-box">
        <div class="cm-icon">⚠️</div>
        <div class="cm-title">${title}</div>
        <p class="cm-msg">${message}</p>
        <div class="cm-actions">
          <button class="cm-cancel" id="cm-cancel">${cancelText}</button>
          <button class="cm-ok"     id="cm-ok">${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = (result) => {
      modal.remove();
      resolve(result);
    };

    document.getElementById('cm-overlay').addEventListener('click', () => close(false));
    document.getElementById('cm-cancel').addEventListener('click', () => close(false));
    document.getElementById('cm-ok').addEventListener('click',     () => close(true));
  });
}

// ── Show Loading ──
function showLoading(containerId, message = 'Loading...') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `
    <div class="loading-spinner"></div>
    <p style="text-align:center;color:var(--text-light);
      font-size:.85rem;margin-top:8px;">${message}</p>`;
}

// ── Set Active Nav ──
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href && path.includes(href.replace('../','').replace('.html','')))
      item.classList.add('active');
  });
}

// ══════════════════════════════════════════════════════════
// ── printBill — used by billing.html AND history.html ──
// Shows hotel LOGO + NAME on every printed receipt
// ══════════════════════════════════════════════════════════
function printBill(
  bill,
  items,
  hotelName = 'Dinesh Hotel',
  footer    = 'Thank You! Visit Again'
) {
  const receipt = document.getElementById('print-receipt');
  if (!receipt) return;

  const date = bill.bill_date
    ? formatDate(bill.bill_date)
    : formatDate(new Date().toISOString().slice(0, 10));
  const time = bill.bill_time
    ? bill.bill_time.slice(0, 5)
    : new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
      });
  const total = items.reduce((s, i) => s + Number(i.line_total), 0);

  const itemsHtml = items.map(item => `
    <div class="r-item">
      <span class="r-iname">${item.item_name}</span>
      <span class="r-iqty">${item.quantity}</span>
      <span class="r-irate">${Number(item.selling_price).toFixed(0)}</span>
      <span class="r-iamt">${Number(item.line_total).toFixed(0)}</span>
    </div>`).join('');

  receipt.innerHTML = `
    <style>
      @media print {
        body > * { display: none !important; }
        #print-receipt { display: block !important; }
      }
      #print-receipt .receipt {
        width: 80mm; margin: 0 auto;
        font-family: 'Courier New', monospace;
        font-size: 12px; color: #000;
      }
      #print-receipt .r-header { text-align: center; margin-bottom: 8px; }
      #print-receipt .r-logo   { width: 70px; height: 70px;
                                  object-fit: contain; margin-bottom: 4px; }
      #print-receipt .r-name   { font-size: 20px; font-weight: bold;
                                  letter-spacing: 1px; margin-bottom: 2px; }
      #print-receipt .r-sub    { font-size: 11px; color: #555; margin-bottom: 4px; }
      #print-receipt .r-div    { border-top: 1px dashed #000; margin: 6px 0; }
      #print-receipt .r-meta   { font-size: 11px; margin: 2px 0; }
      #print-receipt .r-ih,
      #print-receipt .r-item   { display: flex; font-size: 12px; margin: 3px 0; }
      #print-receipt .r-ih     { font-weight: bold; font-size: 11px; }
      #print-receipt .r-iname  { flex: 2; }
      #print-receipt .r-iqty,
      #print-receipt .r-irate,
      #print-receipt .r-iamt   { flex: 1; text-align: right; }
      #print-receipt .r-total  { display: flex; justify-content: space-between;
                                  font-weight: bold; font-size: 15px; margin: 6px 0; }
      #print-receipt .r-footer { text-align: center; font-size: 11px;
                                  margin-top: 10px; font-style: italic; }
    </style>

    <div class="receipt">

      <!-- HOTEL LOGO + NAME -->
      <div class="r-header">
        <img src="images/logo.png"
             alt="${hotelName}"
             class="r-logo"
             onerror="this.style.display='none'">
        <div class="r-name">${hotelName}</div>
        <div class="r-sub">Restaurant &amp; Hotel</div>
      </div>

      <div class="r-div"></div>

      <div class="r-meta">Bill No : <strong>${bill.bill_number}</strong></div>
      <div class="r-meta">Date    : ${date}</div>
      <div class="r-meta">Time    : ${time}</div>

      <div class="r-div"></div>

      <div class="r-ih">
        <span class="r-iname">Item</span>
        <span class="r-iqty">Qty</span>
        <span class="r-irate">Rate</span>
        <span class="r-iamt">Amt</span>
      </div>

      <div class="r-div"></div>

      ${itemsHtml}

      <div class="r-div"></div>

      <div class="r-total">
        <span>TOTAL</span>
        <span>₹${total.toFixed(2)}</span>
      </div>

      <div class="r-div"></div>

      <div class="r-footer">${footer}</div>
    </div>
  `;

  setTimeout(() => window.print(), 350);
}

// ── Load User Info in Sidebar ──
async function loadUserInfo() {
  try {
    const user = await Auth.getUser();
    if (!user) return;
    const nameEl = document.getElementById('user-email');
    if (nameEl) nameEl.textContent = user.email;
  } catch (e) {}
}

// ── Init Page ──
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initClock();
  setActiveNav();
  loadUserInfo();
});
