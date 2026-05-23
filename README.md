# جمبك مارت 🛒

تطبيق توصيل سوداني متعدد الخدمات — مبني بـ HTML / CSS / JS خالص بدون فريم ووركس.

**الموقع المباشر:** [anasmsdramsees-collab.github.io/jambak-mart](https://anasmsdramsees-collab.github.io/jambak-mart/)

---

## 📱 التطبيقات الفرعية

| التطبيق | الصفحة | اللون | الوصف |
|---------|--------|-------|-------|
| جمبك مارت | `index.html` | 🟢 أخضر | توصيل بقالة وسوبر ماركت |
| جمبك ماركت | `jambak.html` | 🟠 برتقالي | ماركت بلايس وتسوق عام |
| جمبك هايبر مول | `hypermall.html` | 🔵 أزرق | هايبر ماركت وعروض |
| جمبك فودز | `taga.html` | 🔴 أحمر | توصيل طعام من المطاعم |
| جمبك سيرفيس | `services.html` | 🟣 بنفسجي | خدمات منزلية وعناية |

---

## 📄 الصفحات

### صفحات العميل
| الصفحة | الملف | الوصف |
|--------|-------|-------|
| الرئيسية — مارت | `index.html` | الصفحة الرئيسية لجمبك مارت |
| الرئيسية — ماركت | `jambak.html` | صفحة جمبك ماركت |
| الرئيسية — هايبر مول | `hypermall.html` | صفحة هايبر مول |
| الرئيسية — فودز | `taga.html` | صفحة جمبك فودز |
| الرئيسية — سيرفيس | `services.html` | صفحة الخدمات المنزلية |
| تصفح | `browse.html` | تصفح كل المنتجات |
| المتاجر | `stores.html` | قائمة المتاجر |
| متجر | `store.html` | صفحة متجر منفرد |
| السلة | `cart.html` | سلة التسوق |
| الدفع | `checkout.html` | إتمام الطلب والدفع |
| الطلبات | `orders.html` | طلباتي السابقة |
| تتبع | `tracking.html` | تتبع الطلب |
| الحساب | `account.html` | حساب المستخدم |

### صفحات التجار والإدارة
| الصفحة | الملف | الوصف |
|--------|-------|-------|
| الدخول | `auth.html` | دخول التجار والإدارة |
| الإدارة | `admin.html` | لوحة تحكم الأدمن |
| التاجر | `vendor.html` | لوحة تحكم التاجر |

---

## 🗂️ هيكل الملفات

```
jambak-mart/
│
├── 📄 صفحات HTML (16 ملف)
│
├── 🎨 app.css          — كل الستايل (متغيرات، كمبوننتس، ريسبونسف)
├── ⚙️  app.js           — منطق التطبيق، بيانات المنتجات (PRODUCTS)، السلة
│
├── 🖼️  icons/           — أيقونات التطبيقات الفرعية
│   ├── icon-jambak.png
│   ├── icon-hypermall.png
│   ├── icon-foodz.png
│   ├── icon-mart.png
│   ├── icon-services.png
│   └── logo.jpg
│
├── 🖼️  banners/          — بنرات الهيرو
│   ├── banner-jambak.jpg
│   ├── banner-hypermall.jpg
│   ├── banner-foodz.jpg
│   ├── banner-mart.jpg
│   └── banner-services.jpg
│
├── 💳 payments/         — أيقونات وسائل الدفع
│   ├── pay-bede.webp
│   ├── pay-cashi.png
│   └── pay-momo.png
│
├── 📁 design/           — ملفات مصدر وخامات (غير مستخدمة في الكود)
│
├── 📸 screenshots/      — صور الواجهات للدعاية (390×844 iPhone)
│
└── 🧩 extension/        — Chrome Extension كنترول بانل
    ├── manifest.json
    ├── popup.html / popup.js
    ├── content.js
    ├── background.js
    └── icons/
```

---

## 🗄️ قاعدة البيانات (localStorage)

كل البيانات محفوظة في localStorage بدون سيرفر.

| المفتاح | النوع | الوصف |
|---------|-------|-------|
| `jambak_mart_cart` | Array | محتويات السلة |
| `jambak_mart_user` | Object | بيانات المستخدم الحالي |
| `jambak_auth_session` | Object | جلسة الأدمن / التاجر |
| `jambak_vendors` | Array | حسابات التجار |
| `jambak_orders` | Array | كل الطلبات |
| `jambak_products_override` | Array | منتجات التجار المضافة |
| `jambak_admin_settings` | Object | إعدادات المنصة |

---

## 🔐 نظام الصلاحيات

```
auth.html
├── تاجر  → vendor.html   (رقم هاتف + PIN 4 أرقام)
└── أدمن  → admin.html    (admin@jambak.sd / jambak2026)
```

**لوحة الأدمن تتيح:**
- إضافة / تعديل / حذف / تعليق التجار
- الموافقة على طلبات التسجيل
- عرض كل الطلبات والمنتجات
- تصدير CSV
- تفعيل 21 متجر تجريبي (PIN: `1234`)

**لوحة التاجر تتيح:**
- إضافة / تعديل / حذف منتجاته
- قبول الطلبات وتحديث حالتها
- إعدادات المتجر وتغيير PIN

---

## 🧩 Chrome Extension

موجودة في `extension/` — كنترول بانل يظهر في المتصفح.

**لتثبيتها:**
1. افتح `chrome://extensions/`
2. فعّل **Developer mode**
3. اضغط **Load unpacked** واختر فولدر `extension/`

**المميزات:**
- 🔴 بادج بعدد الطلبات الجديدة على الأيقونة
- قبول/رفض الطلبات والتجار مباشرة من البوب أب
- روابط سريعة لكل لوحات التحكم

> ⚠️ يشتغل فقط لما يكون في تاب مفتوح على الموقع — يُحدَّث للدومين الجديد في `manifest.json`

---

## 🚧 قيد التطوير / TODO

- [ ] ربط Firebase بدل localStorage (auth + Firestore + Storage)
- [ ] صفحة تتبع الطلب الحي `tracking.html`
- [ ] نظام تقييم المنتجات والمتاجر
- [ ] دعم رفع صور المنتجات من التاجر
- [ ] نظام إشعارات Push للطلبات الجديدة
- [ ] صفحة `checkout.html` — ربط نظام الدفع الحقيقي
- [ ] دومين مخصص + تحديث manifest الاكستنشن
- [ ] لوحة تحليلات متقدمة (charts بيانات تاريخية)
- [ ] نسخة PWA (قابلة للتثبيت على الموبايل)

---

## ⚙️ تطوير محلي

```bash
# شغّل السيرفر المحلي
cd "jambak-mart"
python3 -m http.server 4501

# افتح في المتصفح
http://localhost:4501/index.html
```

---

## 🌐 النشر

المشروع منشور تلقائياً على **GitHub Pages** من الـ `main` branch.

```bash
git add .
git commit -m "your message"
git push
# ينشر تلقائياً خلال ~30 ثانية
```
