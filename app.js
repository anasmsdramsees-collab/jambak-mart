/* ═══════════════════════════════════════
   جمبك مارت — App Logic
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   جمبك مارت v2 — Stores Data
   ═══════════════════════════════════════ */
const STORES = [
  {
    id:'s1', name:'الانفال ماركت', type:'سوبر ماركت',
    emoji:'🏪', color:'#1a6b3a',
    rating:4.8, time:'25-40', delivery:500, featured:true,
    cats:['grocery','dairy','produce','bak','drinks','house','care']
  },
  {
    id:'s2', name:'جمبك مارت', type:'بقالة متكاملة',
    emoji:'🛒', color:'#3B0F8C',
    rating:4.9, time:'20-35', delivery:500, featured:true,
    cats:['bak','dairy','produce','meat','grocery','drinks','snacks','house','care','frozen']
  },
  {
    id:'s3', name:'سنا مارت', type:'سوبر ماركت',
    emoji:'🏬', color:'#c7501e',
    rating:4.6, time:'30-45', delivery:500, featured:false,
    cats:['grocery','dairy','bak','drinks','snacks','house']
  },
  {
    id:'s4', name:'التسامح', type:'بقالة',
    emoji:'🛍️', color:'#1565c0',
    rating:4.5, time:'35-50', delivery:400, featured:false,
    cats:['grocery','bak','dairy','drinks']
  },
  {
    id:'s5', name:'الجزيرة للخضار والفاكهة', type:'خضار وفاكهة',
    emoji:'🥬', color:'#2e7d32',
    rating:4.7, time:'25-40', delivery:300, featured:false,
    cats:['produce']
  },
  {
    id:'s6', name:'مسلخ النور', type:'لحوم وسمك',
    emoji:'🥩', color:'#b71c1c',
    rating:4.6, time:'30-50', delivery:600, featured:false,
    cats:['meat']
  },
  {
    id:'s7', name:'المجمدات الممتازة', type:'مجمدات',
    emoji:'❄️', color:'#0277bd',
    rating:4.4, time:'40-55', delivery:500, featured:false,
    cats:['frozen','drinks']
  },
];

function renderStoreList(containerId, stores) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!stores || stores.length === 0) {
    el.innerHTML = `<div class="empty"><div class="ei">🏪</div><h3>لا توجد متاجر</h3><p>لا توجد متاجر تطابق بحثك</p></div>`;
    return;
  }
  el.innerHTML = stores.map(s => `
    <a href="store.html#id=${s.id}" class="store-card">
      <div class="store-logo" style="background:${s.color}22">
        <span style="font-size:28px">${s.emoji}</span>
      </div>
      <div class="store-info">
        <div class="store-name">${s.name}</div>
        <div class="store-type">${s.type}</div>
        <div class="store-meta">
          <span class="express-tag">⚡ في ${s.time.split('-')[0]} د</span>
          <span class="m">⭐ ${s.rating}</span>
          <span class="m">🛵 ${s.delivery.toLocaleString()} SDG</span>
        </div>
      </div>
      <button class="store-fav" onclick="event.preventDefault()" title="المفضلة">🤍</button>
    </a>`).join('');
}

window.STORES = STORES;
window.renderStoreList = renderStoreList;

// ── Cart State ──
const CART_KEY = 'jambak_mart_cart';

let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function getCartItem(id) {
  return cart.find(i => i.id === id);
}

function addToCart(product) {
  const existing = getCartItem(product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  showToast('✅ تمت الإضافة إلى السلة', 'success');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateQty(id, delta) {
  const item = getCartItem(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();

  // header badges (old & new class names)
  document.querySelectorAll('.cart-badge,.bn-badge,.cbadge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('show', count > 0);
    el.classList.toggle('on', count > 0);
  });

  // floating cart bar
  const cartBar = document.getElementById('cart-bar');
  if (cartBar) {
    cartBar.classList.toggle('show', count > 0);
    const cbCount = document.getElementById('cb-count');
    if (cbCount) cbCount.textContent = count;
    const cbTotal = document.getElementById('cb-total');
    if (cbTotal) cbTotal.textContent = total.toLocaleString() + ' SDG';
  }

  // orders badge
  document.querySelectorAll('.bn-dot').forEach(el => {
    el.classList.toggle('on', count > 0);
    el.textContent = count > 0 ? count : '';
  });

  // render cart items if on cart page
  const cartList = document.getElementById('cart-list');
  if (cartList) renderCartList(cartList);

  const cartTotal = document.getElementById('cart-total');
  if (cartTotal) cartTotal.textContent = total.toLocaleString() + ' SDG';

  const orderTotal = document.getElementById('order-total');
  if (orderTotal) orderTotal.textContent = (total + 500).toLocaleString() + ' SDG';
}

function renderCartList(container) {
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="ei">🛒</div>
        <h3>السلة فارغة</h3>
        <p>أضف منتجات من الصفحة الرئيسية</p>
        <a href="index.html" class="big-btn primary" style="width:auto;padding:0 28px;margin:0 auto">تسوق الآن</a>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="ci-img">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-unit">${item.unit}</div>
        <div class="ci-price">${(item.price * item.qty).toLocaleString()} SDG</div>
      </div>
      <div class="qty-ctrl">
        <button onclick="updateQty('${item.id}',-1)">−</button>
        <span class="qn">${item.qty}</span>
        <button onclick="updateQty('${item.id}',1)">+</button>
      </div>
      <button class="ci-del" onclick="removeFromCart('${item.id}')" title="حذف">🗑️</button>
    </div>
  `).join('');
}

// ── Category Image Pools ──
const UNS = 'https://images.unsplash.com/photo-';
const CAT_IMG_POOLS = {
  bak: [
    UNS+'1509440159596-0249088772ff?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1555507036-ab1f4038808a?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1549931319-a545dcf3bc73?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1565299624946-baaa23fcbddc?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1517433670267-44f50f5e9c8b?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1578985545062-69928b1d9587?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  dairy: [
    UNS+'1563636619-e9143da7973b?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1499793983690-e29da59ef1c2?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1488477181895-64d0ab93abb4?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1607083206869-e3a0a4e4f62c?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1550583724-b2692b85b150?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  produce: [
    UNS+'1546793665-c74683f339c1?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1518977676872-5796bb3c2e24?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1508747703725-719af1e60b25?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1571771894640-23f286c58f48?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1601493700678-29afb3d8c540?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1540420773420-3366772f4999?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  meat: [
    UNS+'1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1604503468853-30af36b20d5c?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1534482421-64566f976cfa?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1529042394853-16e43ecbce9e?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  grocery: [
    UNS+'1586201375761-83865001e31c?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1474979078801-d46bdab95f79?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1582540337-6dfb8de2d80c?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1507133750040-4a209f4f9100?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1495474472287-4d71a5e10e24?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1518596938-73e9d8b22e2e?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  drinks: [
    UNS+'1570831739-370d0ad25b68?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1600271886742-f049cd451bba?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1554866585-cd94860890b7?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1563636619-e9143da7973b?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  snacks: [
    UNS+'1548907994-b8e24b7c2987?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1558961363-fa8fdf82db35?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1536304993831-8c1f0b6ab4cf?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1549057446-ec7dcef113cf?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  house: [
    UNS+'1585421514738-01798e348b17?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1563396983-4c7ded01d92f?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1584464491033-6d6d11ee04b6?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1534483509719-3feaee7c30da?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  care: [
    UNS+'1556228578-0d85b1a4d571?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1570555640-da01df9b5d96?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1571781926291-c477ebfd024b?w=300&h=300&fit=crop&auto=format&q=75',
  ],
  frozen: [
    UNS+'1497034825429-c343d7c6a68f?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1565299624946-baaa23fcbddc?w=300&h=300&fit=crop&auto=format&q=75',
    UNS+'1604503468853-30af36b20d5c?w=300&h=300&fit=crop&auto=format&q=75',
  ],
};

// Assign each product a specific image from its category pool
function getProductImg(p) {
  const pool = CAT_IMG_POOLS[p.cat];
  if (!pool || pool.length === 0) return '';
  const idx = parseInt(p.id.replace('p',''), 10) % pool.length;
  return pool[idx];
}

window.CAT_IMG_POOLS = CAT_IMG_POOLS;
window.getProductImg = getProductImg;

// ── Products Data ──
const PRODUCTS = [
  // مخبوزات
  { id:'p01', cat:'bak', emoji:'🍞', name:'خبز توست أبيض 600 غرام', unit:'كيس 600 غرام', price:750, discount:0 },
  { id:'p02', cat:'bak', emoji:'🥖', name:'خبز بر أسمر سن', unit:'كيس 400 غرام', price:480, discount:0 },
  { id:'p03', cat:'bak', emoji:'🥐', name:'كرواسون بالزبدة 6 قطع', unit:'علبة 6 قطع', price:1280, discount:10 },
  { id:'p04', cat:'bak', emoji:'🧁', name:'كعك البيت بالسمسم', unit:'كيس 200 غرام', price:400, discount:0 },
  { id:'p05', cat:'bak', emoji:'🍰', name:'كيكة إسفنجية بالفانيلا', unit:'علبة 400 غرام', price:1920, discount:15 },
  { id:'p06', cat:'bak', emoji:'🫓', name:'بسكويت بيلفيتا بالهيل 8 قطع', unit:'448 غرام', price:1600, discount:0 },

  // ألبان وبيض
  { id:'p07', cat:'dairy', emoji:'🥛', name:'حليب المراعي كامل الدسم 1 لتر', unit:'1 لتر', price:800, discount:0 },
  { id:'p08', cat:'dairy', emoji:'🥛', name:'حليب المراعي قليل الدسم 1 لتر × 4', unit:'4 لتر', price:2880, discount:0 },
  { id:'p09', cat:'dairy', emoji:'🥚', name:'بيض طازج كبير 15 بيضة', unit:'15 بيضة', price:1920, discount:0 },
  { id:'p10', cat:'dairy', emoji:'🧀', name:'جبن كرافت مثلثات 16 قطعة', unit:'16 قطعة', price:2240, discount:0 },
  { id:'p11', cat:'dairy', emoji:'🫙', name:'زبادي المراعي طبيعي 500 غرام', unit:'500 غرام', price:800, discount:0 },
  { id:'p12', cat:'dairy', emoji:'🧈', name:'زبدة أنكور نيوزيلندية 250 غرام', unit:'250 غرام', price:2400, discount:0 },
  { id:'p13', cat:'dairy', emoji:'🥛', name:'حليب نيدو كامل الدسم 400 غرام', unit:'400 غرام', price:2880, discount:0 },
  { id:'p14', cat:'dairy', emoji:'🧀', name:'جبن بيضاء طازجة الصافي 500 غرام', unit:'500 غرام', price:1440, discount:0 },

  // خضار وفاكهة
  { id:'p15', cat:'produce', emoji:'🍅', name:'طماطم طازجة محلية', unit:'1 كيلو', price:350, discount:0 },
  { id:'p16', cat:'produce', emoji:'🧅', name:'بصل جاف أبيض', unit:'1 كيلو', price:280, discount:0 },
  { id:'p17', cat:'produce', emoji:'🥔', name:'بطاطس طازجة محلية', unit:'1 كيلو', price:320, discount:0 },
  { id:'p18', cat:'produce', emoji:'🍌', name:'موز طازج', unit:'1 كيلو', price:960, discount:0 },
  { id:'p19', cat:'produce', emoji:'🥭', name:'مانجو شنبار سوداني', unit:'1 كيلو', price:1280, discount:20 },
  { id:'p20', cat:'produce', emoji:'🥦', name:'بامية خضراء طازجة', unit:'500 غرام', price:480, discount:0 },
  { id:'p21', cat:'produce', emoji:'🍋', name:'ليمون طازج', unit:'1 كيلو', price:640, discount:0 },
  { id:'p22', cat:'produce', emoji:'🧄', name:'ثوم مجروش 250 غرام', unit:'250 غرام', price:480, discount:0 },

  // لحوم وسمك
  { id:'p23', cat:'meat', emoji:'🥩', name:'لحم بقري مفروم طازج', unit:'500 غرام', price:3500, discount:0 },
  { id:'p24', cat:'meat', emoji:'🍗', name:'فخذ دجاج طازج بدون عظم', unit:'1 كيلو', price:2800, discount:0 },
  { id:'p25', cat:'meat', emoji:'🐟', name:'سمك بلطي طازج', unit:'1 كيلو', price:3200, discount:0 },
  { id:'p26', cat:'meat', emoji:'🥚', name:'كفتة لحم جاهزة', unit:'500 غرام', price:4000, discount:10 },
  { id:'p27', cat:'meat', emoji:'🍗', name:'صدر دجاج مقطع طازج', unit:'1 كيلو', price:3040, discount:0 },

  // بقالة
  { id:'p28', cat:'grocery', emoji:'🍚', name:'أرز بسمتي طويل الحبة 2 كجم', unit:'2 كيلو', price:2400, discount:0 },
  { id:'p29', cat:'grocery', emoji:'🫙', name:'زيت عافية دوار الشمس 1.5 لتر', unit:'1.5 لتر', price:2880, discount:0 },
  { id:'p30', cat:'grocery', emoji:'🍬', name:'سكر أبيض ناعم 2 كجم', unit:'2 كيلو', price:1280, discount:0 },
  { id:'p31', cat:'grocery', emoji:'🫖', name:'شاي ليبتون أصفر 100 كيس', unit:'100 كيس', price:1920, discount:0 },
  { id:'p32', cat:'grocery', emoji:'☕', name:'نسكافيه كلاسيك 200 غرام', unit:'200 غرام', price:3520, discount:0 },
  { id:'p33', cat:'grocery', emoji:'🌾', name:'طحين القمح الكامل البيكر 2 كجم', unit:'2 كيلو', price:1280, discount:0 },
  { id:'p34', cat:'grocery', emoji:'🧂', name:'ملح ناعم يودي 1 كجم', unit:'1 كيلو', price:480, discount:0 },
  { id:'p35', cat:'grocery', emoji:'🥫', name:'طماطم مفرومة هاينز 400 غرام', unit:'400 غرام', price:960, discount:0 },
  { id:'p36', cat:'grocery', emoji:'🍯', name:'عسل طبيعي سدر 500 غرام', unit:'500 غرام', price:4800, discount:0 },

  // مشروبات
  { id:'p37', cat:'drinks', emoji:'💧', name:'مياه معدنية نيفيا 1.5 لتر × 12', unit:'18 لتر', price:1920, discount:0 },
  { id:'p38', cat:'drinks', emoji:'💧', name:'مياه باردة 500 مل', unit:'500 مل', price:160, discount:0 },
  { id:'p39', cat:'drinks', emoji:'🥤', name:'بيبسي كولا 330 مل × 6 علب', unit:'1.98 لتر', price:2400, discount:0 },
  { id:'p40', cat:'drinks', emoji:'🧃', name:'عصير المراعي برتقال 1 لتر', unit:'1 لتر', price:1120, discount:0 },
  { id:'p41', cat:'drinks', emoji:'🧃', name:'عصير لمعي مانجو 250 مل × 6', unit:'1.5 لتر', price:2240, discount:15 },
  { id:'p42', cat:'drinks', emoji:'🥛', name:'لبن المراعي بالفراولة 200 مل × 6', unit:'1.2 لتر', price:1440, discount:0 },

  // حلويات وسناكس
  { id:'p43', cat:'snacks', emoji:'🍫', name:'فيريرو روشيه 24 حبة 300 غرام', unit:'300 غرام', price:6240, discount:15 },
  { id:'p44', cat:'snacks', emoji:'🍫', name:'لينت ليندور شوكولاتة حليب 100 غرام', unit:'100 غرام', price:1280, discount:0 },
  { id:'p45', cat:'snacks', emoji:'🥜', name:'فول سوداني محمص بالملح', unit:'200 غرام', price:400, discount:0 },
  { id:'p46', cat:'snacks', emoji:'🍪', name:'بسكويت ماري أصلي', unit:'علبة 200 غرام', price:480, discount:0 },
  { id:'p47', cat:'snacks', emoji:'🥣', name:'كيلوغز كوكو بوبز 480 غرام', unit:'480 غرام', price:4000, discount:0 },
  { id:'p48', cat:'snacks', emoji:'🍬', name:'حلوى مصاصة مشكلة', unit:'كيس 500 غرام', price:640, discount:0 },

  // منزليات
  { id:'p49', cat:'house', emoji:'🧴', name:'أريال مسحوق غسيل فاعل 2.5 كجم', unit:'2.5 كيلو', price:3840, discount:0 },
  { id:'p50', cat:'house', emoji:'🧴', name:'فيري ليمون سائل صحون 500 مل', unit:'500 مل', price:1280, discount:0 },
  { id:'p51', cat:'house', emoji:'🌺', name:'داوني كلنر قيم العشب 3 لتر', unit:'3 لتر', price:3520, discount:10 },
  { id:'p52', cat:'house', emoji:'💧', name:'كلوركس مبيض سائل 2 لتر', unit:'2 لتر', price:1920, discount:0 },
  { id:'p53', cat:'house', emoji:'🧻', name:'فاين مناشف مطبخ 12 رول', unit:'12 رول', price:4480, discount:0 },
  { id:'p54', cat:'house', emoji:'🧹', name:'جيف كريم منظف مع كريستال 500 مل', unit:'500 مل', price:1600, discount:0 },

  // عناية شخصية
  { id:'p55', cat:'care', emoji:'🧼', name:'صابون ديتول مضاد للبكتيريا 125 غرام', unit:'125 غرام', price:480, discount:0 },
  { id:'p56', cat:'care', emoji:'🪥', name:'فرشاة أسنان أورال-بي ناعمة', unit:'قطعة', price:800, discount:0 },
  { id:'p57', cat:'care', emoji:'🧴', name:'شامبو هيد شولدرز قشرة 400 مل', unit:'400 مل', price:2400, discount:0 },
  { id:'p58', cat:'care', emoji:'🧴', name:'كريم نيفيا ترطيب 200 مل', unit:'200 مل', price:1280, discount:0 },

  // مجمدات
  { id:'p59', cat:'frozen', emoji:'🍦', name:'آيس كريم فانيلا كيلو', unit:'1 لتر', price:1600, discount:0 },
  { id:'p60', cat:'frozen', emoji:'🥟', name:'سمبوسة لحم جاهزة 20 قطعة', unit:'20 قطعة', price:2880, discount:20 },
  { id:'p61', cat:'frozen', emoji:'🌮', name:'دجاج مقلي مجمد 1 كجم', unit:'1 كيلو', price:3520, discount:0 },
  { id:'p62', cat:'frozen', emoji:'🐟', name:'قريدس مجمد مقشر 500 غرام', unit:'500 غرام', price:4800, discount:15 },
];

// ── Product Card Renderer ──
function renderProductCard(p) {
  const inCart = getCartItem(p.id);
  const oldPrice = p.discount > 0 ? Math.round(p.price / (1 - p.discount/100)) : null;

  const imgSrc = getProductImg(p);

  return `
    <div class="pcard" onclick="openProduct('${p.id}')">
      <div class="pcard-img">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='flex')"><span style="display:none;font-size:54px">${p.emoji}</span>`
          : `<span>${p.emoji}</span>`}
        ${p.discount > 0 ? `<div class="disc-tag">-${p.discount}%</div>` : ''}
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-unit">${p.unit}</div>
        <div class="pcard-foot">
          <div>
            <div class="pcard-price">${p.price.toLocaleString()} <small>SDG</small></div>
            ${oldPrice ? `<div class="pcard-old">${oldPrice.toLocaleString()} SDG</div>` : ''}
          </div>
          ${inCart
            ? `<div class="qty-ctrl" onclick="event.stopPropagation()">
                 <button onclick="updateQty('${p.id}',-1)">−</button>
                 <span class="qn" id="qn-${p.id}">${inCart.qty}</span>
                 <button onclick="updateQty('${p.id}',1)">+</button>
               </div>`
            : `<button class="add-btn" onclick="event.stopPropagation();addToCart(PRODUCTS.find(x=>x.id==='${p.id}'))">+</button>`
          }
        </div>
      </div>
    </div>`;
}

// ── Render Product Grid ──
function renderGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = products.map(renderProductCard).join('');
}

function renderScroll(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = products.map(renderProductCard).join('');
}

// ── Open Product (simple overlay or navigate) ──
function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  // Simple bottom sheet
  let sheet = document.getElementById('product-sheet');
  if (!sheet) {
    sheet = document.createElement('div');
    sheet.id = 'product-sheet';
    sheet.style.cssText = `
      position:fixed; inset:0; z-index:300;
      display:flex; flex-direction:column; justify-content:flex-end;
    `;
    document.body.appendChild(sheet);
  }

  const inCart = getCartItem(p.id);

  sheet.innerHTML = `
    <div onclick="closeSheet()" style="flex:1;background:rgba(0,0,0,0.45)"></div>
    <div style="background:#fff;border-radius:24px 24px 0 0;padding:24px 20px 40px;max-width:540px;width:100%;margin:0 auto">
      <div style="text-align:center;font-size:80px;margin-bottom:12px">${p.emoji}</div>
      <h2 style="font-size:18px;font-weight:800;color:var(--tx);margin-bottom:4px">${p.name}</h2>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">${p.unit}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <div style="font-size:24px;font-weight:900;color:var(--p1)">${p.price.toLocaleString()} SDG</div>
        ${p.discount > 0 ? `<div style="background:var(--acc);color:#fff;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px">خصم ${p.discount}%</div>` : ''}
      </div>
      <button onclick="addToCart(PRODUCTS.find(x=>x.id==='${p.id}'));closeSheet()" style="
        width:100%;height:52px;background:var(--p1);color:#fff;border:none;
        border-radius:14px;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer
      ">🛒  أضف إلى السلة</button>
    </div>
  `;
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  const sheet = document.getElementById('product-sheet');
  if (sheet) sheet.remove();
  document.body.style.overflow = '';
}

// ── Toast ──
function showToast(msg, type = '') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast${type === 'success' || type === 'g' ? ' g' : ''}`;
  setTimeout(() => toast.classList.add('on'), 10);
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('on'), 2200);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Set active nav item based on current page
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bn-item').forEach(item => {
    if (item.dataset.page === page) item.classList.add('active');
  });
});

// Export globals
window.PRODUCTS = PRODUCTS;
window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;
window.renderGrid = renderGrid;
window.renderScroll = renderScroll;
window.openProduct = openProduct;
window.closeSheet = closeSheet;
window.showToast = showToast;
window.cart = cart;
window.getCartTotal = getCartTotal;
window.getCartCount = getCartCount;
