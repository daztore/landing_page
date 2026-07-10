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
