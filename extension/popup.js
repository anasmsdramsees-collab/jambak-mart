/* ═══════════════════════════════════════════
   جمبك مارت — Popup Script
═══════════════════════════════════════════ */

const SITE_ORIGINS = [
  'https://anasmsdramsees-collab.github.io',
  'http://localhost:4501',
  'http://localhost:3000',
  'http://127.0.0.1:4501'
];

const BASE_URLS = {
  admin:  '/jambak-mart/admin.html',
  vendor: '/jambak-mart/vendor.html',
  auth:   '/jambak-mart/auth.html',
  app:    '/jambak-mart/index.html'
};

let currentTabId  = null;
let currentOrigin = null;
let dbData = null;

const STATUS_MAP = {
  new:              ['s-new',       'جديد'],
  accepted:         ['s-accepted',  'مقبول'],
  preparing:        ['s-preparing', 'جاري التحضير'],
  out_for_delivery: ['s-out',       'في الطريق'],
  delivered:        ['s-delivered', 'مكتمل'],
  cancelled:        ['s-cancelled', 'ملغي']
};

const APP_LABELS = {
  mart:'جمبك مارت', market:'جمبك ماركت', hyper:'هايبر مول',
  foodz:'جمبك فودز', service:'جمبك سيرفيس'
};

/* ── Find active jambak tab ── */
async function findJambakTab() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.url) continue;
    for (const origin of SITE_ORIGINS) {
      if (tab.url.startsWith(origin)) {
        return { tabId: tab.id, origin };
      }
    }
  }
  return null;
}

/* ── Send message to content script ── */
function sendToContent(msg) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(currentTabId, msg, (res) => {
      if (chrome.runtime.lastError) resolve(null);
      else resolve(res);
    });
  });
}

/* ── Load data ── */
async function loadData() {
  showLoading(true);
  const found = await findJambakTab();
  if (!found) {
    showNoConn();
    return;
  }
  currentTabId  = found.tabId;
  currentOrigin = found.origin;
  updateLinks();

  const res = await sendToContent({ type: 'GET_DATA' });
  if (!res || !res.ok) { showNoConn(); return; }

  dbData = res.data;
  showLoading(false);
  setStatus(true);
  renderAll();
}

/* ── Render everything ── */
function renderAll() {
  renderOverview();
  renderOrders();
  renderVendors();
}

function renderOverview() {
  const { orders = [], vendors = [] } = dbData;
  const today = new Date().toDateString();
  const newOrders     = orders.filter(o => o.status === 'new');
  const todayOrders   = orders.filter(o => new Date(o.placedAt).toDateString() === today);
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const revenue       = orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0);

  set('k-new-orders',     newOrders.length);
  set('k-pending-vendors',pendingVendors.length);
  set('k-orders-today',   todayOrders.length);
  set('k-revenue',        revenue > 999 ? (revenue/1000).toFixed(1)+'K' : revenue);
}

function renderOrders() {
  const { orders = [], vendors = [] } = dbData;
  const active = orders
    .filter(o => !['delivered','cancelled'].includes(o.status))
    .sort((a,b) => b.placedAt - a.placedAt)
    .slice(0, 15);

  const badge = document.getElementById('orders-badge');
  const newCount = active.filter(o=>o.status==='new').length;
  badge.textContent = newCount;
  badge.style.display = newCount > 0 ? '' : 'none';

  const list = document.getElementById('orders-list');
  if (!active.length) {
    list.innerHTML = '<div class="empty"><div class="ei">📭</div><p>لا توجد طلبات نشطة</p></div>';
    return;
  }
  list.innerHTML = active.map(o => {
    const [cls, label] = STATUS_MAP[o.status] || ['s-new','جديد'];
    const v = vendors.find(x=>x.storeId===o.storeId||x.uid===o.storeId);
    const items = o.items.slice(0,2).map(i=>`${i.name} ×${i.qty}`).join(' · ');
    const more  = o.items.length > 2 ? ` +${o.items.length-2}` : '';
    const time  = relTime(o.placedAt);

    let acts = '';
    if (o.status === 'new')       acts = `<button class="oa oa-acc" data-id="${o.orderId}" data-s="accepted">قبول ✓</button><button class="oa oa-no" data-id="${o.orderId}" data-s="cancelled">رفض</button>`;
    if (o.status === 'accepted')  acts = `<button class="oa oa-acc" data-id="${o.orderId}" data-s="preparing">تحضير 🔥</button>`;
    if (o.status === 'preparing') acts = `<button class="oa oa-ok" data-id="${o.orderId}" data-s="out_for_delivery">إرسال 🚴</button>`;
    if (o.status === 'out_for_delivery') acts = `<button class="oa oa-ok" data-id="${o.orderId}" data-s="delivered">تسليم ✅</button>`;

    return `<div class="order-card">
      <div class="order-head">
        <div>
          <div class="order-id">#${o.orderId} <span style="font-size:10px;color:#aaa;font-weight:400">· ${v?.storeName||''}</span></div>
          <div class="order-time">${o.customerName||'زبون'} · ${time}</div>
        </div>
        <span class="sbadge ${cls}">${label}</span>
      </div>
      <div class="order-items">${items}${more}</div>
      <div class="order-foot">
        <div class="order-total">${o.total.toLocaleString()} SDG</div>
        <div class="order-acts">${acts}</div>
      </div>
    </div>`;
  }).join('');

  // Attach action listeners
  list.querySelectorAll('[data-id]').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = '...';
      await sendToContent({ type:'SET_ORDER_STATUS', orderId:btn.dataset.id, status:btn.dataset.s });
      await loadData();
    };
  });
}

function renderVendors() {
  const { vendors = [] } = dbData;
  const pending = vendors.filter(v => v.status === 'pending');
  const active  = vendors.filter(v => v.status === 'active').slice(0,8);

  const badge = document.getElementById('vendors-badge');
  badge.textContent = pending.length;
  badge.style.display = pending.length > 0 ? '' : 'none';

  // Pending
  const pendingList = document.getElementById('vendors-list');
  if (!pending.length) {
    pendingList.innerHTML = '<div class="empty"><div class="ei">✅</div><p>لا يوجد تجار في الانتظار</p></div>';
  } else {
    pendingList.innerHTML = pending.map(v => `<div class="vendor-card">
      <div class="vendor-info">
        <div class="vendor-name">${v.storeName}</div>
        <div class="vendor-meta">${v.phone} · ${APP_LABELS[v.appType]||v.appType}</div>
      </div>
      <div class="vendor-acts">
        <button class="va-ok" data-uid="${v.uid}" data-s="active">موافقة</button>
        <button class="va-no" data-uid="${v.uid}" data-s="suspended">رفض</button>
      </div>
    </div>`).join('');
    pendingList.querySelectorAll('[data-uid]').forEach(btn => {
      btn.onclick = async () => {
        btn.disabled = true;
        await sendToContent({ type:'SET_VENDOR_STATUS', uid:btn.dataset.uid, status:btn.dataset.s });
        await loadData();
      };
    });
  }

  // Active
  const activeList = document.getElementById('active-vendors-list');
  activeList.innerHTML = active.length ? active.map(v => `<div class="vendor-card">
    <div class="vendor-info">
      <div class="vendor-name">${v.storeName}</div>
      <div class="vendor-meta">${APP_LABELS[v.appType]||v.appType} · ${v.phone}</div>
    </div>
    <span class="sbadge" style="background:#E8F5E9;color:#2E7D32;flex-shrink:0">نشط</span>
  </div>`).join('') : '<div class="empty"><div class="ei">🏪</div><p>لا يوجد تجار نشطون بعد</p></div>';
}

/* ── Tabs ── */
function switchTab(name) {
  ['overview','orders','vendors'].forEach(t => {
    document.getElementById('panel-'+t).classList.toggle('active', t===name);
    document.getElementById('t-'+t).classList.toggle('active', t===name);
  });
}

/* ── Links ── */
function updateLinks() {
  const origin = currentOrigin || 'https://anasmsdramsees-collab.github.io';
  const isGH = origin.includes('github.io');
  document.getElementById('link-admin').href  = isGH ? origin+BASE_URLS.admin  : origin+'/admin.html';
  document.getElementById('link-vendor').href = isGH ? origin+BASE_URLS.vendor : origin+'/vendor.html';
  document.getElementById('link-auth').href   = isGH ? origin+BASE_URLS.auth   : origin+'/auth.html';
  document.getElementById('link-app').href    = isGH ? origin+BASE_URLS.app    : origin+'/index.html';
  document.getElementById('open-site-link').href = 'https://anasmsdramsees-collab.github.io/jambak-mart/';
}

/* ── UI helpers ── */
function showLoading(show) {
  document.getElementById('loading-state').style.display  = show ? 'flex' : 'none';
  document.getElementById('no-conn-state').style.display = 'none';
  ['overview','orders','vendors'].forEach(t => document.getElementById('panel-'+t).classList.remove('active'));
  if (!show) document.getElementById('panel-overview').classList.add('active');
}

function showNoConn() {
  document.getElementById('loading-state').style.display  = 'none';
  document.getElementById('no-conn-state').style.display = 'block';
  ['overview','orders','vendors'].forEach(t => document.getElementById('panel-'+t).classList.remove('active'));
  setStatus(false);
}

function setStatus(online) {
  document.getElementById('status-dot').className  = 'status-dot' + (online ? '' : ' off');
  document.getElementById('status-text').textContent = online ? 'متصل' : 'غير متصل';
}

function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function relTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)   return 'الآن';
  if (diff < 3600000) return Math.floor(diff/60000) + ' د';
  if (diff < 86400000)return Math.floor(diff/3600000) + ' س';
  return new Date(ts).toLocaleDateString('ar-EG',{month:'short',day:'numeric'});
}

async function refresh() {
  await loadData();
}

// Open site link
document.getElementById('open-site-link').addEventListener('click', e => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://anasmsdramsees-collab.github.io/jambak-mart/' });
});

// Init
updateLinks();
loadData();
