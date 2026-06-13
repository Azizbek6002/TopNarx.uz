# TopNarx.uz — Ishga Tushirish va O'rnatish Qo'llanmasi

Ushbu loyiha **Frontend (Next.js)** va **Backend (Django REST Framework)** qismlaridan tashkil topgan monorepodir.

---

## 🛠️ Tizim Talablari
Loyiha quyidagi texnologiyalarda muammosiz ishlashi uchun moslashtirilgan:
* **Python 3.12** yoki undan yuqori
* **Node.js 18** yoki undan yuqori (NPM bilan)
* **Docker & Docker Compose** (Konteynerda ishga tushirish uchun)

---

## 🚀 Local Sharoitda Ishga Tushirish (Docker-siz)

### 1. Backend (Django) ni sozlash

1. **Virtual muhitni yarating va faollashtiring:**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows tizimida faollashtirish:
   venv\Scripts\activate
   
   # Linux/macOS tizimida faollashtirish:
   source venv/bin/activate
   ```

2. **Kutubxonalarni o'rnating:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Muhit o'zgaruvchilarini (`.env`) sozlang:**
   `backend/.env` faylini oching va quyidagi o'zgaruvchilarni sozlang. Agar mahalliy SQLite ishlatmoqchi bo'lsangiz, `DATABASE_URL` ni bo'sh qoldiring (avtomatik local SQLite database ishlatiladi):
   ```env
   SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=127.0.0.1,localhost
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://localhost:3000
   
   # PostgreSQL uchun (ixtiyoriy, agar localda postgres ishlatilsa):
   # DATABASE_URL=postgresql://postgres:password@localhost:5432/topnarx
   ```

4. **Ma'lumotlar bazasini migratsiya qilish:**
   ```bash
   python manage.py migrate
   ```

5. **Statik fayllarni yig'ish:**
   ```bash
   python manage.py collectstatic --noinput
   ```

6. **Admin (Superuser) yaratish:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Serverni ishga tushirish:**
   ```bash
   python manage.py runserver
   ```
   Backend API manzili: `http://localhost:8000/`

---

### 2. Frontend (Next.js) ni sozlash

1. **Frontend papkasiga o'ting va kutubxonalarni o'rnating:**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Muhit o'zgaruvchilarini (`.env.local`) sozlang:**
   `frontend/.env.local` faylini yaratib, quyidagi qatorlarni kiriting:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   OPENAI_API_KEY=sizning-openai-kalitingiz
   ```

3. **Loyiha dasturchi rejimida ishga tushirish:**
   ```bash
   npm run dev
   ```
   Frontend manzili: `http://localhost:3000/`

---

## 🐳 Docker va Docker Compose orqali Ishga Tushirish

Docker loyihani barcha xizmatlari (PostgreSQL database, Redis, Celery worker va Celery beat) bilan birga ishga tushiradi.

1. **Loyiha ildiz (root) papkasida turib buyruqni bering:**
   ```bash
   docker-compose up -d --build
   ```

2. **Konteyner ichida migratsiyalarni amalga oshirish:**
   ```bash
   docker exec -it topnarxuz-web-1 python manage.py migrate
   ```

3. **Superuser yaratish:**
   ```bash
   docker exec -it topnarxuz-web-1 python manage.py createsuperuser
   ```

---

## ☁️ DigitalOcean Serveriga Joylash (Deployment)

Loyihani DigitalOcean App Platform yoki VPS (Droplet) ga joylash mumkin.

### Muhim sozlamalar (tayyor holga keltirildi):
1. **`.gitignore`** to'g'rilandi: migratsiya tarixi (`migrations/` fayllari) gitda saqlanadi, shuning uchun serverda ma'lumotlar bazasi jadvallari xatosiz yaratiladi.
2. **`requirements.txt`** encoding muammosi tuzatildi (UTF-8 formatiga o'tkazildi).
3. **`settings.py`** ishlab chiqarish (Production) muhitiga tayyorlandi: `whitenoise` static storage va xavfsizlik sozlamalari (`SECURE_PROXY_SSL_HEADER`, `SESSION_COOKIE_SECURE` va boshqalar) yoqilgan.

### Joylashtirish bosqichlari:
* **Droplet (VPS) orqali:** Git orqali loyihani tortib, yuqoridagi **Docker Compose** buyruqlarini ishga tushirish yetarli.
* **App Platform orqali:** Ikki alohida xizmat (Web Service) yarating:
  1. **Backend**: Build context qilib `backend` papkasini bering va `Dockerfile` orqali build qiling. `DATABASE_URL` muhit o'zgaruvchisiga DigitalOcean boshqariladigan bazasini (Managed DB) ulang.
  2. **Frontend**: Static site yoki node xizmati qilib `frontend` papkasini ko'rsating. `NEXT_PUBLIC_API_URL` ga backend-ning domen manzilini ulang.
