# دليل نقل المنصة إلى دومين خاص — خطوة بخطوة

> في كل الخطوات استبدل `ciacademy.com` باسم الدومين الذي ستشتريه.
> علامة 🧑 = خطوة عليك، و🤖 = خطوة عليّ.

---

## المرحلة 1 — شراء الدومين 🧑 (20 دقيقة)

### 1.1 أنشئ حساب Cloudflare
1. افتح: https://dash.cloudflare.com/sign-up
2. سجّل ببريد الأكاديمية `ciacademy.egy@gmail.com` وكلمة سر قوية.
3. افتح رسالة التأكيد في البريد واضغط الرابط.

### 1.2 فعّل التحقق بخطوتين (إجباري)
1. حمّل تطبيق **Google Authenticator** على جوالك:
   - أندرويد: https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2
   - آيفون: https://apps.apple.com/app/google-authenticator/id388497605
2. افتح: https://dash.cloudflare.com/profile/authentication
3. في **Two-Factor Authentication** اضغط **Set up** ← **Mobile App Authentication**.
4. امسح رمز QR بالتطبيق، واكتب الرقم المكوّن من 6 أرقام.
5. **احفظ أكواد الاسترداد (Backup codes)** في مكان آمن خارج الجوال.

### 1.3 ابحث عن الاسم واشتره
1. افتح: https://dash.cloudflare.com/?to=/:account/domains/register
2. اكتب الاسم في خانة البحث، وجرّب: `ciacademy.com` · `ci-academy.com` · `cia-academy.com` · `ciacademy.co`
3. اختر `.com` إن كان متاحاً، واضغط **Purchase**.
4. بيانات المالك: **اسمك الحقيقي** (أو اسم الأكاديمية إن كانت مسجّلة رسمياً) وعنوانك وجوالك. الدومين يكون ملكك أنت.
5. ادفع بالبطاقة.

### 1.4 تأكد من الإعدادات
افتح الدومين من: https://dash.cloudflare.com/?to=/:account/domains
- **Auto-renew:** On
- **Registrar lock:** Enabled
- إخفاء بيانات المالك: مفعّل تلقائياً في Cloudflare.

📩 **أرسل لي:** اسم الدومين بالضبط.

---

## المرحلة 2 — تأمين الحسابات 🧑 (10 دقائق)

فعّل التحقق بخطوتين على كل حساب يتحكم في المنصة:

| الحساب | الرابط |
|---|---|
| GitHub | https://github.com/settings/security |
| Supabase | https://supabase.com/dashboard/account/security |
| Gmail الأكاديمية | https://myaccount.google.com/signinoptions/two-step-verification |

---

## المرحلة 3 — توثيق الدومين في GitHub 🧑 (5 دقائق)
يمنع أي شخص آخر من استخدام دومينك على GitHub.

1. افتح (بحساب `moddathersalamaeng-sudo`): https://github.com/settings/pages
2. اضغط **Add a domain**، واكتب `ciacademy.com`، ثم **Add domain**.
3. سيظهر لك سجل TXT، مثل:
   - **Name:** `_github-pages-challenge-moddathersalamaeng-sudo`
   - **Value:** رمز طويل
4. في Cloudflare افتح الدومين ← **DNS** ← **Records** ← **Add record**:
   - **Type:** `TXT`
   - **Name:** الاسم كما ظهر في GitHub (بدون `.ciacademy.com` في آخره)
   - **Content:** الرمز
   - اضغط **Save**
5. ارجع إلى GitHub واضغط **Verify**. إن لم يقبل فوراً، انتظر 10 دقائق وأعد المحاولة.

---

## المرحلة 4 — تجهيز المنصة للعنوان الجديد 🤖 ثم 🧑
1. 🤖 أركّب كود النقل وأحدّث المنصة بالعنوان الجديد، وأرسل لك ملفين أو ثلاثة.
2. 🧑 ارفعها إلى GitHub كالعادة (Add file ← Upload files ← Commit changes).

---

## المرحلة 5 — ربط الدومين بالموقع 🧑 (15 دقيقة + انتظار حتى ساعة)

### 5.1 سجلات DNS في Cloudflare
افتح الدومين ← **DNS** ← **Records** ← **Add record**، وأضف السجلات التالية. **مهم:** اجعل **Proxy status** = **DNS only** (السحابة رمادية) في كل سجل.

| Type | Name | Content |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `moddathersalamaeng-sudo.github.io` |

### 5.2 إضافة الدومين في GitHub Pages
1. افتح: https://github.com/moddathersalamaeng-sudo/-/settings/pages
2. في **Custom domain** اكتب `ciacademy.com` واضغط **Save**.
3. انتظر حتى تظهر علامة ✓ **DNS check successful** (من دقائق إلى ساعة).
4. فعّل **Enforce HTTPS** (قد يكون رمادياً حتى تجهز الشهادة؛ أعد المحاولة بعد ساعة).
5. جرّب: `https://ciacademy.com` و`https://www.ciacademy.com` والرابط القديم `https://moddathersalamaeng-sudo.github.io/-/` — الثلاثة يجب أن تفتح المنصة على الدومين الجديد.

📩 **أرسل لي:** «الموقع فتح على الدومين».

---

## المرحلة 6 — إعدادات Supabase 🧑 (5 دقائق)
1. افتح: https://supabase.com/dashboard/project/lafjjoqgzfvrnvgyyzgb/auth/url-configuration
2. **Site URL:** `https://ciacademy.com`
3. **Redirect URLs** ← **Add URL**، وأضف:
   - `https://ciacademy.com/**`
   - `https://www.ciacademy.com/**`
4. **لا تحذف** الرابط القديم `https://moddathersalamaeng-sudo.github.io/-/**` الآن؛ نحذفه بعد شهر.
5. اضغط **Save**.

---

## المرحلة 7 — البريد على الدومين 🧑 (30 دقيقة)

### 7.1 استقبال البريد مجاناً (Cloudflare Email Routing)
يجعل `info@ciacademy.com` يصل إلى Gmail الأكاديمية، بلا تكلفة.
1. في Cloudflare افتح الدومين ← **Email** ← **Email Routing** ← **Get started**.
2. **Custom address:** `info` ← **Destination:** `ciacademy.egy@gmail.com` ← **Create and continue**.
3. افتح Gmail واضغط رابط التأكيد من Cloudflare.
4. اضغط **Add records and enable** (يضيف السجلات تلقائياً).
5. كرّر لعناوين أخرى إن أردت: `moddather@` و`training@`.
الشرح الرسمي: https://developers.cloudflare.com/email-routing/get-started/

### 7.2 إرسال رسائل الدخول من الدومين (Resend)
1. أنشئ حساباً: https://resend.com/signup (فعّل التحقق بخطوتين من الإعدادات).
2. افتح: https://resend.com/domains ← **Add Domain** ← اكتب `send.ciacademy.com` ← اختر المنطقة الأقرب (مثل Ireland eu-west-1) ← **Add**.
3. سيعرض لك سجلات DNS (MX وTXT). أضفها في Cloudflare كما هي (أو اضغط **Auto configure** إن ظهر خيار الربط مع Cloudflare)، وكلها **DNS only**.
4. ارجع إلى Resend واضغط **Verify DNS Records** حتى تصبح الحالة **Verified**.
5. افتح: https://resend.com/api-keys ← **Create API Key** ← الاسم `Supabase` ← الصلاحية **Sending access** ← انسخ المفتاح (يظهر مرة واحدة). **لا ترسله لي.**

### 7.3 ربط Resend بـ Supabase
1. افتح: https://supabase.com/dashboard/project/lafjjoqgzfvrnvgyyzgb/auth/smtp
2. املأ:
   - **Sender email:** `noreply@send.ciacademy.com`
   - **Sender name:** `أكاديمية التحسين المستمر`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** مفتاح Resend
3. **Save**، ثم جرّب الدخول في المنصة ببريدك. يجب أن تصل الرسالة من العنوان الجديد.
الشرح الرسمي: https://resend.com/docs/send-with-supabase-smtp

### 7.4 سجل حماية البريد (DMARC)
في Cloudflare ← **DNS** ← **Add record**:
- **Type:** `TXT` · **Name:** `_dmarc` · **Content:** `v=DMARC1; p=none; rua=mailto:info@ciacademy.com`

### 7.5 (اختياري لاحقاً) صندوق بريد كامل للإرسال من الدومين
- Zoho Mail: https://www.zoho.com/mail/zohomail-pricing.html (خطة مجانية لعدد صغير من المستخدمين)
- Google Workspace: https://workspace.google.com/pricing

📩 **أرسل لي:** «البريد اشتغل».

---

## المرحلة 8 — تحديثات المنصة والاختبار 🤖 + 🧑
1. 🤖 أحدّث: سياسة الخصوصية (Resend وCloudflare بدل Gmail)، ورمز QR، وروابط صور المشاركة، و`sitemap.xml` و`robots.txt`، وأرسل الملفات.
2. 🧑 ترفعها.
3. 🧑 + 🤖 اختبار: الدخول، وحفظ العمل، والطلبات، ولوحة الإدارة، ومرشد الشهادات، والتطبيق على الجوال.

---

## المرحلة 9 — بعد الإطلاق 🧑 (15 دقيقة)
1. **Google Search Console:** https://search.google.com/search-console ← **Add property** ← **Domain** ← اكتب الدومين ← اتبع خطوة التحقق (Cloudflare يضيف السجل تلقائياً) ← بعدها **Sitemaps** ← أضف `sitemap.xml`.
2. **مراقبة توقف الموقع:** https://uptimerobot.com ← حساب مجاني ← **Add New Monitor** ← HTTPS ← `https://ciacademy.com` ← كل 5 دقائق ← تنبيه على بريدك.
3. بعد شهر: احذف الرابط القديم من Supabase (المرحلة 6).

---

## التكلفة التقريبية سنوياً
| البند | التكلفة |
|---|---|
| دومين `.com` من Cloudflare | نحو 10–11 دولار |
| استقبال البريد (Email Routing) | مجاني |
| إرسال رسائل الدخول (Resend) | مجاني في الخطة الأساسية |
| GitHub Pages وSupabase | مجاني بالاستخدام الحالي |

الأسعار والحدود المجانية قد تتغير؛ راجعها وقت الاشتراك.

## قواعد أمان
- لا ترسل لي أي كلمة سر أو مفتاح API أو أكواد استرداد.
- مفتاح `service_role` في Supabase لا يوضع في المنصة أبداً.
- عند أي شاشة مختلفة عن الشرح، أرسل لي صورة الشاشة.
