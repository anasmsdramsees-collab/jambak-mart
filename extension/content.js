/* ═══════════════════════════════════════════
   جمبك مارت — Content Script
   Reads localStorage and relays to popup
═══════════════════════════════════════════ */

function readDB() {
  const parse = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || fallback); } catch { return JSON.parse(fallback); } };
  return {
    session:  parse('jambak_auth_session',  'null'),
    vendors:  parse('jambak_vendors',       '[]'),
    orders:   parse('jambak_orders',        '[]'),
    products: parse('jambak_products_override', '[]'),
    settings: parse('jambak_admin_settings','{}'),
  };
}

function writeOrderStatus(orderId, status) {
  try {
    const orders = JSON.parse(localStorage.getItem('jambak_orders') || '[]');
    const i = orders.findIndex(o => o.orderId === orderId);
    if (i !== -1) { orders[i].status = status; orders[i].updatedAt = Date.now(); localStorage.setItem('jambak_orders', JSON.stringify(orders)); return true; }
  } catch {}
  return false;
}

function writeVendorStatus(uid, status) {
  try {
    const vendors = JSON.parse(localStorage.getItem('jambak_vendors') || '[]');
    const i = vendors.findIndex(v => v.uid === uid);
    if (i !== -1) { vendors[i].status = status; localStorage.setItem('jambak_vendors', JSON.stringify(vendors)); return true; }
  } catch {}
  return false;
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === 'GET_DATA') {
    reply({ ok: true, data: readDB() });
  } else if (msg.type === 'SET_ORDER_STATUS') {
    reply({ ok: writeOrderStatus(msg.orderId, msg.status) });
  } else if (msg.type === 'SET_VENDOR_STATUS') {
    reply({ ok: writeVendorStatus(msg.uid, msg.status) });
  }
  return true; // keep async channel open
});

// Notify background of new orders count for badge
function pingBadge() {
  try {
    const orders = JSON.parse(localStorage.getItem('jambak_orders') || '[]');
    const newCount = orders.filter(o => o.status === 'new').length;
    const vendors = JSON.parse(localStorage.getItem('jambak_vendors') || '[]');
    const pendingCount = vendors.filter(v => v.status === 'pending').length;
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', newOrders: newCount, pendingVendors: pendingCount });
  } catch {}
}

pingBadge();
setInterval(pingBadge, 10000);

// Watch localStorage changes
const origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  origSetItem(key, value);
  if (key === 'jambak_orders' || key === 'jambak_vendors') pingBadge();
};
