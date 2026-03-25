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
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};

// ── Sidebar Toggle (Mobile) ──
function initSidebar() {
  const hamburger = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

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
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Date helpers ──
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

// ── Confirm Dialog ──
function confirmAction(message) {
  return confirm(message);
}

// ── Show/hide loading ──
function showLoading(containerId, message = 'Loading...') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="loading-spinner"></div><p style="text-align:center;color:var(--text-light);font-size:.85rem;margin-top:8px;">${message}</p>`;
}

// ── Set active nav item ──
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href') || '';
    if (href && path.includes(href.replace('../', '').replace('.html', ''))) {
      item.classList.add('active');
    }
  });
}

// ── Print Bill ──
function printBill(bill, items, hotelName = 'Dinesh Hotel', footer = 'Thank You! Visit Again') {
  const receipt = document.getElementById('print-receipt');
  if (!receipt) return;

  const date = bill.bill_date ? formatDate(bill.bill_date) : formatDate(DateUtils.today());
  const time = bill.bill_time ? bill.bill_time.slice(0, 5) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let itemsHtml = items.map(item => `
    <div class="receipt-item">
      <span class="receipt-item-name">${item.item_name}</span>
      <span class="receipt-item-qty">${item.quantity}</span>
      <span class="receipt-item-rate">${Number(item.selling_price).toFixed(0)}</span>
      <span class="receipt-item-amt">${Number(item.line_total).toFixed(0)}</span>
    </div>
  `).join('');

  receipt.innerHTML = `
    <div class="receipt">
      <div class="receipt-header">
        <div style="text-align:center;margin-bottom:6px;">
  <img src="/images/logo.png" 
       alt="Logo"
       style="width:60px;height:60px;
              object-fit:contain;"
       onerror="this.style.display='none'">
</div>
<div class="receipt-hotel-name">${hotelName}</div>
```

---

## 📋 Logo Size Recommendation

| Where | Size |
|-------|------|
| Login page | 80x80 px |
| Sidebar | 44x44 px |
| Print receipt | 60x60 px |

---

## ✅ Best Logo Format
```
Format  → PNG
Background → Transparent (best!)
Size → 500x500 px minimum
Color → Any color
```

---

## 🎯 Quick Summary
```
Step 1 → Create logo on Canva (free)
Step 2 → Download as PNG
Step 3 → Upload to GitHub images folder
Step 4 → Update index.html (login page)
Step 5 → Update sidebar.js (all pages)
Step 6 → Update app.js (print receipt)
Step 7 → Commit all changes
Step 8 → Wait 2 minutes → Vercel deploys
Step 9 → Logo shows everywhere! ✅
```

---

## 💡 Pro Tip for Selling to Customers
```
When selling to new customer:
1. Ask them for their logo
2. If no logo → create on Canva free
3. Upload their logo to their GitHub
4. Change hotel name everywhere
5. Professional website ready! ✅
        <div class="receipt-tagline">Restaurant & Hotel</div>
      </div>
      <hr class="receipt-divider">
      <div class="receipt-meta">
        <div>Bill No : <strong>${bill.bill_number}</strong></div>
        <div>Date    : ${date}</div>
        <div>Time    : ${time}</div>
      </div>
      <hr class="receipt-divider">
      <div class="receipt-items-header">
        <span style="flex:1">Item</span>
        <span style="width:30px;text-align:center">Qty</span>
        <span style="width:45px;text-align:right">Rate</span>
        <span style="width:50px;text-align:right">Amt</span>
      </div>
      ${itemsHtml}
      <div class="receipt-total">
        <span>TOTAL</span>
        <span>Rs. ${Number(bill.total).toFixed(0)}</span>
      </div>
      <hr class="receipt-divider">
      <div class="receipt-footer">
        <div style="font-weight:700">${footer}</div>
        <div style="margin-top:4px;font-size:10px">Powered by Dinesh Hotel System</div>
      </div>
    </div>
  `;

  receipt.style.display = 'block';
  window.print();
  receipt.style.display = 'none';
}

// ── Set user info in sidebar ──
async function loadUserInfo() {
  try {
    const user = await Auth.getUser();
    if (!user) return;
    const nameEl = document.getElementById('user-email');
    if (nameEl) nameEl.textContent = user.email;
  } catch (e) {}
}

// ── Init page ──
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initClock();
  setActiveNav();
  loadUserInfo();
});
