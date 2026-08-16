# SYCI Auth

Satu layanan autentikasi (SSO) untuk semua aplikasi web kamu di subdomain
`*.domainkamu.com`. Terdiri dari:

- `apps/api` — REST API (Express + Prisma + MariaDB): register, login, refresh
  token (dengan rotasi & deteksi reuse), logout, RBAC (roles & permissions),
  audit log.
- `apps/web` — Halaman login/register pusat (Vue 3), juga berfungsi sebagai
  "portal SSO" yang dituju aplikasi lain saat user perlu login.

Lihat `SSO_INTEGRATION.md` untuk cara menyambungkan aplikasi lain ke auth ini.

## Persyaratan

- Node.js 20+
- Docker (opsional, untuk database lokal) atau MariaDB/MySQL yang sudah jalan

## 1. Jalankan database

Pakai Docker (paling gampang):

```bash
docker compose up -d
```

Ini akan menjalankan MariaDB di `localhost:3306` dengan database `syci_auth`
(user `root`, password `root`).

Atau pakai MariaDB/MySQL kamu sendiri — sesuaikan `.env` di langkah berikut.

## 2. Setup API

```bash
cd apps/api
cp .env.example .env
```

Edit `.env`:
- Isi `JWT_SECRET` dengan string acak panjang (`openssl rand -base64 48`).
- Sesuaikan `DATABASE_*` dan `DATABASE_URL` dengan kredensial dari langkah 1.
- Untuk development, `CORS_ALLOWED_DOMAIN` dan `SSO_BASE_DOMAIN` boleh dikosongkan
  (localhost otomatis diizinkan). Untuk production, isi dengan domain kamu,
  misal `.syci.id` dan `syci.id`.

Install dependency, migrasi, dan seed role/permission default:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

Jalankan API:

```bash
npm run dev
```

API akan jalan di `http://localhost:3000`. Cek `GET http://localhost:3000/api/v1/health`.

### Menjadikan user pertama sebagai admin

Setelah register lewat web app, jadikan akun kamu admin:

```bash
npm run db:grant-role -- kamu@contoh.com ADMIN
```

## 3. Setup Web (halaman login pusat)

```bash
cd apps/web
cp .env.example .env   # sesuaikan VITE_API_URL jika API tidak di localhost:3000
npm install
npm run dev
```

Web akan jalan di `http://localhost:5173` (default Vite).

## 4. Build untuk production

```bash
# API
cd apps/api && npm run build && npm start

# Web
cd apps/web && npm run build   # hasil ada di apps/web/dist, deploy sebagai static site
```

Deploy `apps/web` ke `auth.domainkamu.com`, dan `apps/api` di belakangnya
(misal `api.domainkamu.com` atau proxy `/api` dari domain yang sama).

## 5. Menyambungkan aplikasi lain

Baca `SSO_INTEGRATION.md` — intinya: aplikasi lain memanggil
`POST https://auth.domainkamu.com/api/v1/auth/refresh` dengan
`credentials: 'include'` untuk cek sesi, dan mengarahkan user ke
`https://auth.domainkamu.com/?redirect=<url-kembali>` kalau belum login.

## Catatan keamanan

- Refresh token disimpan di cookie `HttpOnly` + di-hash sebelum disimpan ke DB.
- Access token berumur pendek (15 menit default), disimpan di memory frontend
  (bukan localStorage).
- Rate limiting aktif di `/login`, `/register` (10x/15 menit per IP) dan
  `/refresh` (30x/menit per IP).
- Redirect SSO divalidasi lewat `SSO_BASE_DOMAIN` untuk mencegah open-redirect.
