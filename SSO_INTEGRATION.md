# Menghubungkan Aplikasi Lain ke SYCI Auth (SSO)

Dokumen ini menjelaskan cara menyambungkan aplikasi web lain (di subdomain yang
sama) ke satu SYCI Auth ini, supaya user cukup login sekali.

Asumsi arsitektur (sesuai setup kamu):
- Semua aplikasi ada di satu domain utama, masing-masing di subdomain sendiri.
  Contoh: `auth.domainkamu.com` (SYCI Auth ini), `app1.domainkamu.com`, `app2.domainkamu.com`.
- Semua aplikasi berbasis web (browser).

## 1. Konfigurasi environment auth API

Di `.env` API (lihat `.env.example`):

```
NODE_ENV=production
FRONTEND_URL=https://auth.domainkamu.com

REFRESH_TOKEN_COOKIE_SECURE=true
REFRESH_TOKEN_COOKIE_SAME_SITE=lax

CORS_ALLOWED_DOMAIN=.domainkamu.com
SSO_BASE_DOMAIN=domainkamu.com
```

`CORS_ALLOWED_DOMAIN=.domainkamu.com` membuat API otomatis mempercayai semua
origin HTTPS di bawah domain itu (`app1.domainkamu.com`, `app2.domainkamu.com`,
dst) — kamu tidak perlu deploy ulang API tiap menambah aplikasi baru.

## 2. Alur login lintas aplikasi

Karena semua aplikasi ada di subdomain yang sama, browser bisa mengirim
cookie refresh-token milik `auth.domainkamu.com` ke `auth.domainkamu.com` dari
tab manapun (subdomain dianggap "same-site"). Jadi pola paling sederhana:

1. Di App1, saat load pertama kali, panggil API auth untuk cek sesi:
   ```js
   const res = await fetch('https://auth.domainkamu.com/api/v1/auth/refresh', {
     method: 'POST',
     credentials: 'include', // WAJIB, agar cookie ikut terkirim
   })
   ```
   - Jika berhasil (200) → user sudah login di SYCI Auth, App1 dapat
     `accessToken` baru untuk dipakai sebagai `Authorization: Bearer ...`
     ke API-nya sendiri, atau ke `auth.domainkamu.com/api/v1/auth/me`.
   - Jika gagal (401) → user belum login sama sekali.

2. Kalau belum login, arahkan browser ke halaman login pusat:
   ```js
   const redirectBack = encodeURIComponent(window.location.href)
   window.location.href = `https://auth.domainkamu.com/?redirect=${redirectBack}`
   ```

3. Halaman login SYCI Auth (`apps/web`) sudah otomatis:
   - membaca parameter `?redirect=`,
   - memvalidasinya ke `GET /api/v1/auth/redirect-check?url=...` (mencegah
     open-redirect ke domain asing),
   - dan setelah login sukses (atau sesi berhasil dipulihkan), langsung
     mengarahkan browser kembali ke App1.

4. Setelah kembali ke App1, ulangi langkah 1 (`/auth/refresh`) — sekarang
   cookie sudah ada, jadi App1 langsung dapat `accessToken`.

## 3. Memakai accessToken di App lain

- Simpan `accessToken` di memory (state JS), **jangan** di localStorage
  (rentan XSS).
- Kirim di header `Authorization: Bearer <accessToken>` ke API kamu sendiri,
  atau ke `GET https://auth.domainkamu.com/api/v1/auth/me` untuk ambil profil user.
- `accessToken` berumur pendek (`JWT_ACCESS_EXPIRY`, default 15 menit). Saat
  expired, panggil ulang `/auth/refresh` (langkah 1) untuk dapat token baru —
  App1 tidak perlu minta user login ulang selama sesi refresh masih valid.

## 4. Logout

Panggil dari aplikasi manapun:
```js
await fetch('https://auth.domainkamu.com/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',
})
```
Ini menghapus cookie sesi di `auth.domainkamu.com`, sehingga semua aplikasi
lain otomatis logout begitu mereka mencoba `/auth/refresh` berikutnya.

## 5. Menambahkan aplikasi baru

Karena CORS dan validasi redirect berbasis suffix domain
(`CORS_ALLOWED_DOMAIN` / `SSO_BASE_DOMAIN`), menambah aplikasi baru cukup:
1. Deploy app baru di subdomain (`appN.domainkamu.com`).
2. Tidak perlu ubah apapun di auth API — subdomain baru otomatis terpercaya.

Jika suatu saat kamu punya aplikasi di domain yang benar-benar berbeda (bukan
subdomain), tambahkan origin-nya secara eksplisit di `CORS_ALLOWED_ORIGINS`
(comma-separated) — cookie tidak akan otomatis ikut lintas domain berbeda,
jadi pola di atas (redirect ke auth, redirect balik) tetap yang dipakai, tapi
App-nya perlu menyimpan/meneruskan `accessToken` sendiri (bukan mengandalkan
cookie lintas domain).
