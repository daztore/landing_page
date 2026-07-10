# QA/UX Notes

Dokumen ini digunakan untuk mencatat revisi dari tim QA, UX, user lapangan, atau stakeholder.

Agent/Codex wajib membaca dokumen ini jika task berasal dari revisi QA/UX.

## Status Legend

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `CANCELLED`

## Priority Legend

- `P0` = Bug critical/security/breaking
- `P1` = Mengganggu flow utama
- `P2` = Improvement penting
- `P3` = Minor/nice to have

---

## Notes

### QAUX-0010 - Production Compose Wajib Memakai Image Tag Immutable

Status: `TODO`
Priority: `P1`
Source: `Security Review / Production Deployment Hardening`
Date: `2026-07-10`
Page/Module: `Docker Production Deployment`
Related Route: `N/A`
Related File: `docker-compose.production.yml`, `.github/workflows/ci-cd.yml`, `docs/CI_CD_DEPLOYMENT.md`, `.env.example`

#### Problem

`docker-compose.production.yml` saat ini memakai image aplikasi tetap
`ghcr.io/daztore/landing_page:production`, sedangkan deklarasi berbasis `APP_IMAGE` dan `APP_TAG`
masih menjadi komentar. Tag `production` dapat berpindah ke image lain dan tidak cukup untuk
menjamin rollback ke artifact yang persis sama.

`docker-compose.yml` memang sengaja memakai bind mount source untuk development lokal. File
tersebut **bukan bagian dari masalah ini dan tidak boleh diubah** dalam task production hardening.
Compose production saat ini sudah tidak melakukan bind mount seluruh source; perilaku tersebut
harus dipertahankan.

#### Expected Behavior

Deployment production menjalankan image aplikasi yang ditentukan secara eksplisit menggunakan
tag immutable, terutama commit SHA dari workflow CI/CD. Tag convenience seperti `production` atau
`main` tetap boleh dipush, tetapi bukan sumber kebenaran untuk deploy dan rollback production.

#### Acceptance Criteria

- [ ] `docker-compose.production.yml` memakai format image berbasis variabel wajib, misalnya `${APP_IMAGE:?APP_IMAGE is required}:${APP_TAG:?APP_TAG is required}`.
- [ ] `APP_TAG` pada deployment production diisi dengan full commit SHA atau tag release immutable, bukan hanya `production`, `main`, atau `latest`.
- [ ] Baris image hardcoded `ghcr.io/daztore/landing_page:production` dihapus dari konfigurasi aktif.
- [ ] Workflow tetap mem-push tag commit SHA; tag `main` dan `production` hanya menjadi convenience tag.
- [ ] Runbook deploy dan rollback menjelaskan cara memilih `APP_TAG` tertentu, menjalankan `docker compose pull`, lalu `docker compose up -d`.
- [ ] `docker compose -f docker-compose.production.yml config` gagal dengan pesan jelas saat `APP_IMAGE` atau `APP_TAG` tidak tersedia.
- [ ] Runtime secret tetap diinject melalui environment server dan tidak menjadi Docker build argument atau masuk ke image.
- [ ] Compose production tetap tidak memiliki bind mount seluruh repository/source code.
- [ ] Mount konfigurasi Nginx tetap read-only.
- [ ] `docker-compose.yml` development tidak diubah.
- [ ] Healthcheck aplikasi dan dependency `web -> app service_healthy` tetap bekerja.

#### Developer Notes

Scope Docker pada note ini hanya `docker-compose.production.yml` dan dokumentasi deployment yang
terkait. Jangan menghapus bind mount dari `docker-compose.yml`, karena file tersebut memang untuk
hot reload/development lokal.

Contoh arah konfigurasi:

```yaml
services:
  app:
    image: ${APP_IMAGE:?APP_IMAGE is required}:${APP_TAG:?APP_TAG is required}
```

Contoh operasional:

```bash
export APP_IMAGE=ghcr.io/daztore/landing_page
export APP_TAG=<FULL_COMMIT_SHA>
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

Jika QAUX-0006 menambahkan secret server-only baru untuk cookie akses order, variabel tersebut
juga harus diteruskan sebagai runtime environment di Compose production tanpa menuliskan nilai
aslinya ke repository.

#### Result Notes

Diisi setelah selesai.

### QAUX-0009 - Pin Seluruh GitHub Actions ke Full Commit SHA

Status: `TODO`
Priority: `P1`
Source: `Security Review / CI Supply Chain Hardening`
Date: `2026-07-10`
Page/Module: `GitHub Actions / CI/CD / CodeQL`
Related Route: `N/A`
Related File: `.github/workflows/ci-cd.yml`, `.github/workflows/codeql.yml`, `.github/workflows/summary.yml`, `.github/dependabot.yml`

#### Problem

Workflow memakai major-version tag seperti `actions/checkout@v5`, `actions/setup-node@v6`, dan
`docker/*-action@vN`. Major tag dapat berpindah ke commit berbeda. Jika upstream action atau tag
mengalami kompromi, workflow dapat mengeksekusi kode yang tidak sama dengan hasil review terakhir.

#### Expected Behavior

Setiap `uses:` pada workflow mengarah ke full 40-character commit SHA yang telah diverifikasi.
Versi manusia tetap ditulis sebagai komentar agar mudah direview dan diperbarui. Permission job
harus tetap minimum dan tidak boleh diperluas hanya untuk menyelesaikan pinning.

#### Acceptance Criteria

- [ ] Semua referensi `uses:` pada seluruh file `.github/workflows/*.yml` dipin ke full 40-character commit SHA.
- [ ] Setiap SHA memiliki komentar versi, misalnya `# v5.x.x`, agar asal versinya mudah diaudit.
- [ ] Tidak ada referensi action berbasis branch, floating major tag, atau `@main` yang tersisa.
- [ ] SHA diambil dari release/tag resmi action terkait dan bukan dari fork tidak dikenal.
- [ ] Permission workflow/job tetap least privilege; jangan menambah `write` permission yang tidak dibutuhkan.
- [ ] Dependabot dikonfigurasi untuk ecosystem `github-actions` agar pembaruan SHA dapat diajukan melalui pull request, jika konfigurasi tersebut belum tersedia.
- [ ] Workflow CI, image build, CodeQL, dan summary tetap memiliki trigger dan perilaku yang sama setelah pinning.
- [ ] YAML workflow dapat diparse dan tidak memiliki syntax error.
- [ ] Tidak ada secret yang dicetak ke log saat validasi workflow.

#### Developer Notes

Lakukan perubahan mekanis dan reviewable. Jangan mengganti action atau mengubah arsitektur CI pada
task yang sama kecuali action lama sudah tidak didukung atau memiliki advisory keamanan yang
relevan. Pertahankan komentar versi agar Dependabot/reviewer dapat memahami pembaruan SHA.

GitHub repository setting yang perlu diverifikasi owner secara manual dan tidak boleh diklaim
selesai hanya dari perubahan kode:

- Secret scanning aktif jika tersedia pada plan repository.
- Push protection aktif jika tersedia.
- Actions policy membatasi action ke GitHub-owned atau allowlist yang disetujui.

#### Result Notes

Diisi setelah selesai.

### QAUX-0008 - Rate Limit Production Harus Konsisten Lintas Instance

Status: `TODO`
Priority: `P1`
Source: `Security Review / Abuse Prevention`
Date: `2026-07-10`
Page/Module: `Public Endpoint Rate Limiting`
Related Route: `/api/leads`, `/feedback/[id]/submit`, `/admin-daz/forgot-password/request`
Related File: `lib/security/rate-limit.ts`, `app/api/leads/route.ts`, `app/feedback/[id]/submit/route.ts`, `app/admin-daz/forgot-password/request/route.ts`, `.env.example`, `docker-compose.production.yml`

#### Problem

Rate limiter saat ini menyimpan counter di `Map` memory proses. Counter hilang saat restart dan
tidak dibagi antar replica/container. Pada deployment multi-instance, request dapat berpindah
instance sehingga batas efektif menjadi lebih longgar dan tidak konsisten.

#### Expected Behavior

Production memakai store rate limit bersama dengan increment dan expiry atomik. In-memory store
boleh dipertahankan untuk development/test atau sebagai fallback yang terdokumentasi, tetapi tidak
boleh menjadi satu-satunya proteksi pada production multi-instance.

#### Acceptance Criteria

- [ ] Buat boundary/interface rate limiter agar route tidak bergantung langsung pada global `Map`.
- [ ] Production dapat memakai shared store yang sesuai dengan infrastruktur project, misalnya Redis/Valkey atau mekanisme atomik lain yang terdokumentasi.
- [ ] Increment, window expiry, dan penentuan `remaining` dilakukan secara atomik untuk mencegah race condition.
- [ ] Existing limit per IP dan per identifier tetap dipertahankan untuk lead dan forgot-password.
- [ ] Identifier pribadi seperti email atau nomor WhatsApp dinormalisasi lalu di-hash sebelum menjadi key shared store.
- [ ] TTL key tidak lebih panjang dari kebutuhan window rate limit.
- [ ] Jika shared store gagal, endpoint tidak diam-diam menjadi unlimited; pilih respons aman dan terdokumentasi, misalnya fallback konservatif atau `503` generik.
- [ ] Response limit tetap menyediakan `Retry-After` ketika request ditolak.
- [ ] Development lokal tetap dapat berjalan tanpa service eksternal bila memakai adapter in-memory yang eksplisit.
- [ ] Environment variable shared store didokumentasikan tanpa nilai asli dan tetap server-only.
- [ ] Runtime credential shared store diteruskan melalui `docker-compose.production.yml`, bukan build argument.
- [ ] Tambahkan test untuk reset window, request di atas limit, TTL, dan dua instance yang memakai key/store yang sama.
- [ ] `npm run lint`, `npm run typecheck`, dan `npm run build` berhasil.

#### Developer Notes

Jangan memasukkan provider-specific code ke setiap Route Handler. Gunakan satu adapter/service di
layer security. Jangan menambah dependency baru tanpa mengecek apakah project/infrastruktur sudah
memiliki client yang dapat dipakai. Jika shared store production belum dipilih atau credential
belum tersedia, tandai note `BLOCKED` atau `IN_PROGRESS` dengan sisa pekerjaan yang jelas; jangan
mengklaim masalah multi-instance selesai hanya dengan merapikan `Map`.

QAUX-0007 harus diselesaikan bersamaan atau lebih dahulu agar key IP rate limit tidak berasal dari
header yang dapat dipalsukan client.

#### Result Notes

Diisi setelah selesai.

### QAUX-0007 - Trusted Proxy dan Client IP Tidak Boleh Dapat Dipalsukan

Status: `TODO`
Priority: `P0`
Source: `Security Review / Rate Limit Bypass`
Date: `2026-07-10`
Page/Module: `Nginx Reverse Proxy / Request Security`
Related Route: `/api/leads`, `/feedback/[id]/submit`, `/admin-daz/forgot-password/request`
Related File: `docker/nginx/default.conf`, `lib/security/rate-limit.ts`, `docker-compose.production.yml`

#### Problem

`getRequestClientIp()` saat ini mengambil elemen pertama dari `X-Forwarded-For`. Nginx memakai
`$proxy_add_x_forwarded_for`, yang dapat mempertahankan nilai `X-Forwarded-For` dari client sebelum
menambahkan IP koneksi. Tanpa trusted-proxy boundary yang eksplisit, client dapat mengirim header
palsu dan mengubah key rate limit per IP.

#### Expected Behavior

Aplikasi hanya mempercayai client IP yang telah dinormalisasi oleh reverse proxy tepercaya.
Header yang dikirim langsung oleh client tidak boleh dapat menentukan key rate limit. Konfigurasi
harus tetap benar baik saat Nginx menerima traffic langsung maupun saat ada CDN/load balancer resmi
di depannya.

#### Acceptance Criteria

- [ ] Tentukan dan dokumentasikan topologi proxy production: client langsung ke Nginx atau client -> CDN/load balancer tepercaya -> Nginx.
- [ ] Nginx menimpa header app-facing client IP dengan nilai hasil trusted proxy resolution; jangan meneruskan `X-Forwarded-For` client secara mentah sebagai sumber kebenaran.
- [ ] Jika ada CDN/load balancer, gunakan allowlist/trusted proxy range dan header resmi provider; jangan mempercayai header tersebut dari koneksi publik biasa.
- [ ] Aplikasi membaca satu header client IP yang telah dinormalisasi oleh Nginx, lalu memakai fallback `unknown` bila boundary tidak valid.
- [ ] Urutan fallback tidak lagi memprioritaskan elemen pertama `X-Forwarded-For` yang dikontrol client.
- [ ] Request dengan spoofed `X-Forwarded-For`, `X-Real-IP`, atau `CF-Connecting-IP` tidak dapat memilih key rate limit sendiri.
- [ ] Tambahkan test yang membandingkan request normal dan request dengan spoofed forwarding header.
- [ ] Semua endpoint yang memakai `getRequestClientIp()` tetap berfungsi.
- [ ] Perubahan Nginx tidak merusak WebSocket/upgrade, host, proto, healthcheck, atau request normal.
- [ ] `docker-compose.yml` development tidak perlu diubah; perubahan Compose, bila diperlukan, hanya dilakukan pada `docker-compose.production.yml`.

#### Developer Notes

Untuk deployment tanpa CDN di depan Nginx, salah satu pola sederhana adalah Nginx mengirim
`X-Real-IP $remote_addr` dan aplikasi hanya mempercayai header tersebut karena port aplikasi tidak
diekspos langsung. Jangan otomatis memakai pola ini bila `$remote_addr` masih merupakan IP CDN.
Dalam skenario CDN, konfigurasi `real_ip_header`, `set_real_ip_from`, dan recursive resolution harus
disesuaikan dengan daftar proxy tepercaya yang benar.

Jangan memperbaiki bypass hanya dengan memilih elemen terakhir `X-Forwarded-For` tanpa memahami
proxy chain. Tujuan utamanya adalah menetapkan trust boundary, bukan sekadar mengganti index array.

#### Result Notes

Diisi setelah selesai.

### QAUX-0006 - Hilangkan Raw Token Order dari URL Setelah Access Exchange

Status: `TODO`
Priority: `P0`
Source: `Security Review / Sensitive Token Exposure`
Date: `2026-07-10`
Page/Module: `Public Order Access`
Related Route: `/order/[orderNumber]`, optional access exchange route under `/order/[orderNumber]/**`
Related File: `app/order/[orderNumber]/page.tsx`, `features/orders/queries/public-order.ts`, `features/orders/services/public-token.ts`, `docker/nginx/default.conf`, `.env.example`, `docker-compose.production.yml`

#### Problem

Public order link saat ini memakai raw bearer token pada query string:

```text
/order/ORDER-NUMBER?token=RAW_TOKEN
```

Token dibuat secara acak dan database hanya menyimpan hash, tetapi raw token di URL dapat tertinggal
di browser history, screenshot/copy-paste, reverse proxy access log, APM/analytics, atau referrer.
`noindex` tidak mencegah kebocoran melalui jalur tersebut.

#### Expected Behavior

Raw token hanya digunakan untuk access exchange singkat. Setelah token tervalidasi server-side,
server membuat bukti akses berumur pendek melalui cookie `HttpOnly`, lalu melakukan redirect ke
URL bersih `/order/[orderNumber]` tanpa query token. Halaman order berikutnya membaca bukti akses
server-side dan tidak mengekspos token ke JavaScript atau HTML.

#### Acceptance Criteria

- [ ] Link order baru mengarah ke flow access exchange server-side, bukan merender halaman detail sambil mempertahankan `?token=...` di address bar.
- [ ] Token divalidasi menggunakan hash existing; raw token tetap tidak disimpan di database.
- [ ] Setelah validasi berhasil, response menetapkan cookie akses yang `HttpOnly`, `Secure` pada production, `SameSite=Lax` atau lebih ketat, memiliki expiry pendek, dan path dibatasi ke order terkait bila memungkinkan.
- [ ] Cookie berupa bukti akses opaque/signed dan tidak menyimpan raw token secara plaintext bila dapat dihindari.
- [ ] Signature menggunakan secret server-only khusus dengan entropy memadai; jangan memakai `NEXT_PUBLIC_*` dan jangan menggunakan ulang service-role key sebagai signing secret.
- [ ] Server melakukan redirect `303` atau redirect aman lain ke `/order/[orderNumber]` tanpa query token.
- [ ] Regenerasi public order link menginvalidasi cookie/link lama melalui perbandingan terhadap token hash/version terbaru.
- [ ] URL lama `/order/[orderNumber]?token=...` tetap ditangani secara backward-compatible selama masa transisi dan segera diarahkan ke flow exchange.
- [ ] Token invalid, cookie invalid, signature invalid, atau cookie expired menghasilkan respons generik tanpa membedakan penyebab internal.
- [ ] Raw token tidak dicetak ke server log, application log, error log, analytics event, atau telemetry.
- [ ] Nginx/access logging untuk route exchange tidak menyimpan query string token; gunakan log format berbasis path tanpa args atau nonaktifkan access log khusus route dengan pertimbangan observability yang terdokumentasi.
- [ ] Response route order/exchange mengirim `Cache-Control: private, no-store`.
- [ ] Route order/exchange mengirim `Referrer-Policy: no-referrer`.
- [ ] Metadata `noindex,nofollow` dan pembatasan data customer yang sudah ada tetap dipertahankan.
- [ ] Tidak ada raw token di client bundle, rendered HTML, React props, atau browser console.
- [ ] Tambahkan test untuk token valid, token invalid, redirect ke URL bersih, cookie tampered, cookie expired, dan link yang diregenerasi.
- [ ] Dokumentasi env, security, dan deployment diperbarui bila signing secret baru ditambahkan.
- [ ] `npm run lint`, `npm run typecheck`, dan `npm run build` berhasil.

#### Developer Notes

Rekomendasi implementasi tanpa dependency baru adalah memakai primitive `node:crypto` untuk
membuat dan memverifikasi bukti akses bertanda tangan. Payload minimum dapat berisi order number,
identifier/version token hash saat ini, waktu terbit, dan waktu kedaluwarsa. Verifikasi harus
membandingkan signature secara timing-safe dan memastikan order/token version masih aktif.

Jangan memakai cookie biasa yang hanya berisi order number karena dapat dipalsukan. Jangan pula
menganggap URL sudah aman hanya karena token panjang atau halaman memakai `noindex`.

Contoh flow yang diharapkan:

```text
Admin/customer membuka link bertoken
-> server memvalidasi raw token
-> server membuat cookie akses HttpOnly bertanda tangan
-> server redirect ke /order/ORDER-NUMBER
-> halaman membaca dan memvalidasi cookie server-side
```

Karena request exchange awal masih membawa token, sanitasi access log dan `Referrer-Policy` tetap
wajib. Jangan log nilai query ketika validasi gagal.

#### Result Notes

Diisi setelah selesai.
Dokumen ini digunakan untuk mencatat revisi dari tim QA, UX, user lapangan, atau stakeholder.

Agent/Codex wajib membaca dokumen ini jika task berasal dari revisi QA/UX.

## Status Legend

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `CANCELLED`

## Priority Legend

- `P0` = Bug critical/security/breaking
- `P1` = Mengganggu flow utama
- `P2` = Improvement penting
- `P3` = Minor/nice to have

---

## Notes

### QAUX-0005 - Admin Lupa Password dan Reset Password

Status: `DONE`
Priority: `P1`
Source: `Admin UX / Security Improvement`
Date: `2026-07-10`
Page/Module: `Admin Authentication`
Related Route: `/admin-daz/login`, `/admin-daz/forgot-password`, `/admin-daz/forgot-password/request`, `/admin-daz/auth/callback`, `/admin-daz/reset-password`
Related File: `components/admin-daz/admin-login-form.tsx`, `components/admin-daz/admin-forgot-password-form.tsx`, `components/admin-daz/admin-reset-password-form.tsx`, `app/admin-daz/forgot-password/request/route.ts`, `app/admin-daz/auth/callback/route.ts`

#### Problem

Halaman admin sudah mendukung login email/password melalui Supabase Auth, tetapi belum memiliki
alur lupa password dan reset password. Jika admin lupa password, belum ada jalur UX yang aman
untuk meminta email recovery, memproses callback Supabase, dan membuat password baru.

#### Expected Behavior

Admin dapat membuka link `Lupa password?` dari halaman login, memasukkan email, menerima pesan UI
generik, membuka email recovery Supabase, masuk ke halaman reset password, membuat password baru,
lalu kembali ke login dengan pesan sukses. Flow tidak boleh mengungkap apakah email terdaftar,
tidak boleh memakai service-role key di browser, dan tidak boleh membuka open redirect.

#### Acceptance Criteria

- [x] Link `Lupa password?` tersedia di halaman login admin.
- [x] `/admin-daz/forgot-password` menyediakan form email, loading state, error state, success state, dan link kembali ke login.
- [x] Response forgot password generik dan tidak mengonfirmasi apakah email terdaftar.
- [x] Request forgot password diproses melalui Route Handler server-side dengan validasi JSON, body limit, dan rate limit in-memory per IP/email hash.
- [x] Recovery redirect dibentuk dari `NEXT_PUBLIC_SITE_URL`, bukan hardcoded localhost.
- [x] `/admin-daz/auth/callback` menukar `code` menjadi session dengan `exchangeCodeForSession()`.
- [x] Callback hanya menerima redirect internal `/admin-daz/**` dan default ke `/admin-daz/reset-password`.
- [x] `/admin-daz/reset-password` memvalidasi session recovery sebelum form update password tampil.
- [x] Form reset memvalidasi password minimal 8 karakter dan konfirmasi yang sama.
- [x] Password diperbarui melalui `supabase.auth.updateUser({ password })`.
- [x] Setelah berhasil, client memanggil `supabase.auth.signOut()` dan redirect ke `/admin-daz/login?reset=success`.
- [x] Login menampilkan pesan sukses saat `reset=success`.
- [x] Proxy admin tidak memblokir login, forgot password, callback, atau reset password.
- [x] Tidak ada service-role key di browser.
- [x] `isActiveAdmin()` tidak dihapus atau dilemahkan.
- [x] `npm run lint`, `npm run typecheck`, dan `npm run build` berhasil.

#### Developer Notes

Flow aktual:

```text
/admin-daz/login
-> /admin-daz/forgot-password
-> POST /admin-daz/forgot-password/request
-> Supabase recovery email
-> /admin-daz/auth/callback?next=/admin-daz/reset-password
-> /admin-daz/reset-password
-> /admin-daz/login?reset=success
```

Supabase Dashboard perlu mengizinkan Redirect URL `/admin-daz/auth/callback`. Route
`/admin-daz/reset-password` adalah redirect internal aplikasi setelah callback berhasil, bukan
redirect langsung dari Supabase.

#### Result Notes

Implementasi menambahkan form forgot password, route request recovery dengan rate limit per IP/email
hash, route callback PKCE, form reset password, dan pesan sukses login. Validasi `npm run lint`,
`npm run typecheck`, dan `npm run build` berhasil. Pengujian email recovery end-to-end tetap perlu
dilakukan setelah Supabase Dashboard production/local memiliki Site URL dan Redirect URL yang benar,
karena email recovery lama dapat masih membawa URL lama. Rate limit saat ini masih in-memory per
proses, sehingga deployment multi-instance perlu store terpusat bila traffic meningkat.

### QAUX-0004 - Katalog Back Navigation Mengarah Kembali ke Detail Produk

Status: `DONE`
Priority: `P1`
Source: `Manual QA / User Report`
Date: `2026-07-09`
Page/Module: `Public Catalog Navigation`
Related Route: `/`, `/katalog`, `/produk/[slug]`
Related File: `components/katalog/katalog-header.tsx`, `features/catalog/components/product-detail-view.tsx`, `app/katalog/layout.tsx`

#### Problem

Terjadi bug pada alur navigasi katalog setelah user membuka detail produk.

Flow yang bermasalah:

1. User masuk ke `/katalog`.
2. User membuka salah satu detail produk di `/produk/[slug]`.
3. Di halaman detail produk, user menekan tombol kiri atas `Katalog`.
4. User berhasil kembali ke `/katalog`.
5. Di halaman `/katalog`, user menekan tombol kiri atas untuk kembali ke tampilan awal `daztore`.
6. Actual result: user malah kembali ke halaman detail produk sebelumnya.
7. Expected result: user kembali ke halaman awal `/`.

Masalah ini membuat user terjebak dalam loop navigasi antara halaman katalog dan detail produk, terutama di mobile.

#### Expected Behavior

Navigasi harus konsisten sesuai konteks halaman:

- Dari halaman detail produk, tombol `Katalog` mengarah ke `/katalog`.
- Dari halaman `/katalog`, tombol kembali di kiri atas mengarah ke halaman awal `/`.
- Tombol kembali di header katalog tidak boleh membawa user kembali ke detail produk sebelumnya.
- User tidak boleh mengalami loop `/produk/[slug] -> /katalog -> /produk/[slug]`.

#### Acceptance Criteria

- [x] Flow `/ -> /katalog -> /produk/[slug] -> tombol Katalog -> /katalog -> tombol kembali` berakhir di `/`.
- [x] Tombol kiri atas pada `/katalog` selalu mengarah ke `/`, bukan memakai history browser.
- [x] Tombol `Katalog` pada `/produk/[slug]` tetap mengarah ke `/katalog`.
- [x] Tidak ada loop navigasi antara `/katalog` dan `/produk/[slug]`.
- [x] Label atau aria-label tombol diperjelas, misalnya `Kembali ke beranda`.
- [x] Perilaku diuji minimal di mobile viewport karena header katalog khusus mobile.

#### Developer Notes

Kemungkinan root cause ada di `components/katalog/katalog-header.tsx`.

Saat ini fungsi `goBack()` memakai `router.back()` jika `window.history.length > 1`:

```ts
function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push("/")
}
```

Masalahnya, setelah user dari detail produk menekan link Katalog, halaman detail produk masih menjadi previous history entry. Akibatnya ketika user berada di /katalog lalu menekan tombol kembali, router.back() membawa user kembali ke /produk/[slug].

Rekomendasi implementasi paling aman:

Ubah tombol kembali di KatalogHeader agar selalu eksplisit menuju /.
Jangan gunakan router.back() untuk tombol ini karena konteks tombolnya adalah kembali ke halaman awal, bukan browser back.
Bisa gunakan salah satu opsi berikut:
function goBack() {
  router.push("/")
}

Atau ganti button menjadi Link langsung:

<Link href="/" aria-label="Kembali ke beranda">
  <ArrowLeft className="h-4 w-4" />
</Link>


Jika tetap ingin mempertahankan behavior browser back, maka perlu dibedakan antara tombol “Back” dan tombol “Beranda”. Untuk UX saat ini, lebih aman tombol kiri atas di /katalog diarahkan langsung ke /.

#### Result Notes

Tombol kembali di `KatalogHeader` (kiri atas mobile) telah diubah dari elemen `<button>` yang menggunakan `router.back()` menjadi komponen Next.js `<Link href="/">` dengan `aria-label="Kembali ke beranda"`. Hal ini menjamin bahwa navigasi kembali dari halaman `/katalog` selalu mengarah secara eksplisit ke halaman utama `/`, sehingga memutus loop navigasi dengan detail produk `/produk/[slug]`. Client boundary pada `KatalogHeader` juga dipertahankan karena tombol cari produk masih memakai interaksi `onClick`. Validasi `next build` dan pengujian flow navigasi mobile berhasil tanpa loop.

### QAUX-0003 - Mobile Landing Page UX Review

Status: `DONE`
Priority: `P1`
Source: `UI/UX Mobile Review`
Date: `2026-07-08`
Page/Module: `Public Landing Page`
Related Route: `/`
Related File: `app/page.tsx`, `components/site-navigation.tsx`, `components/hero.tsx`, `components/gallery.tsx`, `components/site-footer.tsx`, `components/whatsapp-button.tsx`, `lib/data/fallback.ts`, `lib/data/landing-page.ts`

#### Problem

Tampilan mobile landing page sudah punya arah visual premium, namun masih ada beberapa masalah UX yang mengganggu flow utama pengguna mobile:

1. CTA `Lihat Paket` mengarah ke `#packages`, tetapi section Paket belum aktif/masih coming soon.
2. Mobile bottom navigation menampilkan item `Paket`, padahal pada desktop menu Paket dibuat disabled/Coming Soon.
3. Ada potensi duplikasi CTA Chat di mobile: bottom navigation sudah punya `Chat`, lalu floating WhatsApp button juga muncul setelah scroll.
4. `SiteNavigation` menambahkan spacer `h-20 md:hidden` langsung setelah header. Karena komponen navigation dirender sebelum `<main>`, spacer ini berpotensi menambah jarak kosong di bagian atas halaman, bukan memberi ruang di bawah untuk bottom nav.
5. Hero mobile terlalu panjang karena memuat headline, deskripsi, 2 CTA, metrics, mobile background image, dan hero visual sekaligus. First viewport mobile sebaiknya lebih fokus ke value proposition dan CTA utama.
6. Gallery mobile menyembunyikan label item di balik hover state. Di mobile tidak ada hover, sehingga label karya kurang terlihat.
7. Beberapa copy masih campur English/Indonesia: `Premium Wedding Atelier`, `Our Story`, `Portfolio`, `Couples`, `Handcrafted with love`. Untuk brand premium boleh memakai English, tetapi perlu konsisten.
8. Ada typo spacing pada copy live: `Mahar & seserahan,lebih` seharusnya `Mahar & seserahan, lebih`.
9. Copy testimoni live menyebut `Ribuan pasangan`, sementara metric utama menyebut `500+`. Ini terasa tidak konsisten dan bisa menurunkan trust.
10. Klaim urgency seperti `24/7 Support` perlu dipastikan benar. Jika tidak benar-benar 24/7, ganti menjadi copy yang lebih aman seperti `Respon cepat` atau `Respon < 1 jam`.

#### Expected Behavior

Landing page mobile harus terasa premium, ringan, jelas, dan conversion-oriented. Dalam 1 layar pertama, user langsung paham layanan utama, melihat CTA WhatsApp yang jelas, dan tidak terganggu navigasi/CTA yang duplikatif atau link yang belum aktif.

#### Acceptance Criteria

- [x] CTA `Lihat Paket` tidak lagi mengarah ke section yang belum tersedia.
- [x] Jika Packages belum aktif, hapus/sembunyikan item `Paket` dari mobile bottom navigation dan footer, atau arahkan ke `/katalog`.
- [x] Jika bottom navigation sudah punya `Chat`, floating WhatsApp button di mobile disembunyikan atau diubah menjadi versi lebih kecil agar tidak terasa duplikatif.
- [x] Spacer bottom nav tidak lagi diletakkan sebelum `<main>`. Gunakan padding bottom pada `main`/footer/body wrapper, misalnya `pb-24 md:pb-0`, bukan spacer di atas hero.
- [x] Bottom navigation mobile memakai safe area untuk iPhone: `padding-bottom: env(safe-area-inset-bottom)`.
- [x] Hero mobile dipadatkan agar CTA utama terlihat lebih cepat tanpa scroll terlalu jauh.
- [x] Primary CTA mobile dibuat full width atau lebih dominan daripada secondary CTA.
- [x] Metrics hero di mobile dibuat lebih ringkas, misalnya dalam pill/card horizontal, atau dipindahkan setelah hero visual.
- [x] Gallery label tampil permanen di mobile, bukan hanya saat hover.
- [x] Copy bahasa dibuat konsisten. Contoh: `Couples` menjadi `Pasangan`, `Our Story` menjadi `Cerita Kami`, `Portfolio` menjadi `Galeri`.
- [x] Typo `Mahar & seserahan,lebih` diperbaiki menjadi `Mahar & seserahan, lebih`.
- [x] Copy `Ribuan pasangan` disesuaikan dengan metric `500+`, misalnya `Ratusan pasangan`.
- [x] Klaim `24/7 Support` diganti jika tidak benar-benar tersedia.
- [x] Gambar yang belum tersedia tetap punya placeholder yang rapi: warm beige background, shimmer ringan, icon/label kategori, dan aspect ratio stabil agar layout tidak loncat.

#### Developer Notes

Rekomendasi implementasi paling aman:

1. Perbaiki navigasi dulu:
   - Di `fallbackNavigation` dan data CMS, nonaktifkan/hapus mobile item `Paket` selama section Packages belum dirender.
   - Ubah `secondaryCtaHref` hero dari `#packages` ke `/katalog` atau `#gallery`.
   - Jika tetap ingin menampilkan Paket, aktifkan kembali komponen `<Packages />` dan pastikan section memiliki `id="packages"`.

2. Perbaiki bottom nav spacer:
   - Hapus `<div className="h-20 md:hidden" />` dari `SiteNavigation`.
   - Tambahkan padding bawah pada layout halaman yang memakai bottom nav, misalnya di `<main className="pb-24 md:pb-0">`.
   - Pastikan footer juga tidak tertutup bottom nav pada mobile.

3. Perbaiki WhatsApp CTA mobile:
   - Opsi direkomendasikan: hide floating WhatsApp button pada mobile ketika bottom nav memiliki item Chat.
   - Floating WhatsApp tetap boleh tampil di desktop.
   - Jika tetap tampil di mobile, posisikan aman di atas bottom nav dan jangan terlalu besar.

4. Perbaiki Gallery:
   - Untuk mobile gunakan overlay label yang selalu visible:
     - gradient bawah selalu tampil di mobile.
     - label selalu opacity 100 di mobile.
     - hover effect tetap hanya untuk `md:` ke atas.
   - Lightbox tetap dipertahankan.

5. Perbaiki Hero:
   - Jaga first viewport mobile tetap fokus:
     - badge
     - headline
     - deskripsi pendek
     - CTA utama
   - Secondary CTA boleh dibuat outline dan kurang dominan.
   - Metrics bisa dipindahkan ke bawah visual atau dibuat lebih compact.

6. Perbaiki copy:
   - Hindari campuran bahasa yang tidak perlu.
   - Pilih tone: premium, hangat, dan personal.
   - Hindari klaim yang belum bisa dibuktikan.

#### Result Notes

Revisi mobile landing page diselesaikan dengan perubahan kecil dan backward-compatible pada lapisan presentasi. `SiteNavigation` kini menghapus spacer `h-20` yang sebelumnya muncul sebelum `<main>`, menambahkan safe-area padding untuk bottom nav iPhone, dan mendeduplikasi item mobile yang masih duplikat dari data CMS/fallback. `app/page.tsx` serta `SiteFooter` diberi padding bawah mobile agar konten dan footer tidak tertutup bottom nav.

Untuk conversion flow mobile, floating WhatsApp button disembunyikan pada mobile dan tetap tampil di desktop, sehingga tidak bentrok dengan item `Chat` di bottom nav. Hero dipadatkan dengan spacing mobile yang lebih ringkas, CTA utama full width, CTA sekunder lebih ringan, dan metrics mobile diubah menjadi pill compact. Gallery mobile kini selalu menampilkan overlay label, dan placeholder gambar diperbaiki dengan warm beige background, shimmer ringan, ikon, dan label agar tetap stabil saat gambar belum siap.

Konsistensi copy juga diperbaiki di dua lapisan: fallback lokal dan loader `lib/data/landing-page.ts`. Selain string fallback yang diperbarui ke bahasa Indonesia yang konsisten, loader sekarang menormalisasi copy legacy dari Supabase/CMS seperti `Premium Wedding Atelier`, `Our Story`, `Portfolio`, `Couples`, typo `Mahar & seserahan,lebih`, deskripsi `Ribuan pasangan`, dan klaim `24/7 Support` agar output publik tetap selaras walau data CMS belum sepenuhnya dibersihkan. Validasi `npm run lint`, `npm run typecheck`, dan `npm run build` dijalankan setelah perubahan.

### QAUX-0002 - Supabase Storage Image Optimizer 400

Status: `DONE`
Priority: `P1`
Source: `Production Debug`
Date: `2026-07-08`
Page/Module: `Public images / Next Image Optimizer`
Related Route: `/`, `/katalog`, `/produk/[slug]`
Related File: `next.config.mjs`, `Dockerfile`

#### Problem

Production evidence menunjukkan Supabase public Storage URL bisa diakses langsung dengan `200 OK`,
tetapi request melalui `/_next/image` mengembalikan `400 Bad Request` dengan pesan `"url"
parameter is not allowed`.

#### Expected Behavior

Gambar public dari bucket Supabase `landing_page` dan `catalogs` tetap diproses oleh Next Image
Optimizer, tidak memakai `unoptimized`, dan menghasilkan response image.

#### Acceptance Criteria

- [x] Next Image Optimizer tetap digunakan.
- [x] Tidak memakai `images.unoptimized`.
- [x] Tidak mengganti global ke `<img>`.
- [x] Request debug lokal ke `/_next/image` untuk Supabase Storage menghasilkan `200 OK`.
- [x] Content-Type hasil optimizer adalah `image/webp`.
- [x] Build production berhasil.
- [x] Docker local test dicoba dan blocker dicatat bila engine tidak tersedia.

#### Developer Notes

Fix yang dipilih adalah config-only: tetap memakai `remotePatterns`, menambahkan fallback
`images.domains` khusus hostname Supabase dari `NEXT_PUBLIC_SUPABASE_URL`, dan membatasi
`maximumRedirects` ke `0`. Next.js 16.2.10 memberi warning bahwa `images.domains` deprecated,
tetapi build/start tetap berhasil. Docker runtime juga harus membawa `next.config.mjs`; root cause
container adalah file config tidak tersalin ke stage runner sehingga `next start` memakai default
image allowlist.

#### Result Notes

Local `next start` dengan env public Supabase production menghasilkan:

```text
STATUS: 200 OK
CONTENT_TYPE: image/webp
```

Docker debug setelah `next.config.mjs` disalin ke runner juga menghasilkan:

```text
STATUS: 200 OK
CONTENT_TYPE: image/webp
```

### QAUX-0001 - Example Note Title

Status: `TODO`  
Priority: `P2`  
Source: `QA/UX/User/Stakeholder`  
Date: `YYYY-MM-DD`  
Page/Module: `example`  
Related Route: `/example`  
Related File: `optional/path.tsx`

#### Problem

Tuliskan masalahnya di sini.

#### Expected Behavior

Tuliskan hasil yang diharapkan.

#### Acceptance Criteria

- [ ] Kriteria 1
- [ ] Kriteria 2
- [ ] Kriteria 3

#### Developer Notes

Catatan teknis jika ada.

#### Result Notes

Diisi setelah selesai.
