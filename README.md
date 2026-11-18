# E-commerce Backend (Express + Neon + ImageKit)

## التشغيل لوكال

```bash
npm install
cp .env.example .env      # املا القيم (تحت)
npm run migrate           # ينشئ الجداول في Neon
npm run dev               # http://localhost:4000
```

يحتاج **Node 20+** (بيقرا `.env` عن طريق `--env-file` من غير مكتبات).

## الإعداد

**Neon**: أنشئ مشروع ← Connect ← انسخ الـ connection string (الـ pooled) في `DATABASE_URL`.
نصيحة: اعمل branch اسمه `dev` للتجارب عشان متلخبطش بيانات الـ production بعدين.

**ImageKit**: Dashboard ← Developer options ← انسخ `Public key` و`Private key` و`URL endpoint`.

**ADMIN_API_KEY**: أي نص عشوائي طويل: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## تجربة سريعة (curl)

```bash
KEY=your-admin-key

# 1) إنشاء منتج (سعره بالقروش: 49900 = 499 جنيه)
curl -X POST localhost:4000/api/admin/products \
  -H "x-admin-key: $KEY" -H "content-type: application/json" \
  -d '{"name":"Sneakers","price_cents":49900,"stock":10,"description":"حذاء رياضي"}'

# 2) رفع صورة للمنتج
curl -X POST localhost:4000/api/admin/products/<PRODUCT_ID>/images \
  -H "x-admin-key: $KEY" -F "image=@./shoe.jpg"

# 3) عرض المنتجات (public)
curl localhost:4000/api/products

# 4) إنشاء أوردر (السعر بيتحسب من الداتابيز)
curl -X POST localhost:4000/api/orders -H "content-type: application/json" -d '{
  "items":[{"productId":"<PRODUCT_ID>","quantity":2}],
  "customer":{"name":"Ahmed Ali","email":"a@b.com","phone":"01012345678","address":"Port Said, Egypt"}
}'

# 5) حالة الأوردر (للـ polling)
curl localhost:4000/api/orders/<ORDER_ID>
```

## الهيكل

```
src/
  config/        env (validation) · db (pg Pool + withTransaction) · imagekit
  db/            migrate.js + migrations/*.sql
  middlewares/   validate (zod) · adminAuth · errorHandler
  modules/
    products/    CRUD + رفع/حذف الصور
    orders/      إنشاء أوردر + حجز مخزون + حالة الأوردر
    uploads/     توقيع ImageKit للرفع المباشر من React
    payments/    providers/ (paymob, kashier adapters فاضية) + routes + webhooks
  app.js · server.js
```

## اللي جاهز واللي لسه

| جاهز | لسه (المراحل الجاية) |
|---|---|
| منتجات + صور ImageKit | تنفيذ Paymob/Kashier adapters |
| أوردرات + حساب الإجمالي من الـ DB | `POST /api/payments/:id/pay` (دلوقتي بيرجع 501) |
| حجز المخزون وقت إنشاء الأوردر | معالجة الـ webhook والتحقق من HMAC |
| جدول webhook_events بيخزن الـ raw payload | job إنهاء الأوردرات المنتهية + المطابقة |
| حماية الأدمن بمفتاح مؤقت | login حقيقي + roles، داشبورد React |

## ملاحظات

- المبالغ كلها **integer بالقروش**.
- الـ webhooks متركبة **قبل** `express.json()` عشان الـ raw body يفضل سليم للـ HMAC.
- المخزون بيتخصم وقت إنشاء الأوردر؛ لازم نضيف job يرجّعه لو الأوردر انتهى من غير دفع (مع مرحلة الدفع).
- `ADMIN_API_KEY` حل مؤقت للتطوير فقط.
