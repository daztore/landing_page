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

### QAUX-0003 - Mobile Landing Page UX Review

Status: `TODO`
Priority: `P1`
Source: `UI/UX Mobile Review`
Date: `2026-07-08`
Page/Module: `Public Landing Page`
Related Route: `/`
Related File: `components/site-navigation.tsx`, `components/hero.tsx`, `components/gallery.tsx`, `components/story.tsx`, `components/urgency-section.tsx`, `components/final-cta.tsx`, `lib/data/fallback.ts`

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
- [ ] Jika bottom navigation sudah punya `Chat`, floating WhatsApp button di mobile disembunyikan atau diubah menjadi versi lebih kecil agar tidak terasa duplikatif.
- [ ] Spacer bottom nav tidak lagi diletakkan sebelum `<main>`. Gunakan padding bottom pada `main`/footer/body wrapper, misalnya `pb-24 md:pb-0`, bukan spacer di atas hero.
- [ ] Bottom navigation mobile memakai safe area untuk iPhone: `padding-bottom: env(safe-area-inset-bottom)`.
- [ ] Hero mobile dipadatkan agar CTA utama terlihat lebih cepat tanpa scroll terlalu jauh.
- [ ] Primary CTA mobile dibuat full width atau lebih dominan daripada secondary CTA.
- [ ] Metrics hero di mobile dibuat lebih ringkas, misalnya dalam pill/card horizontal, atau dipindahkan setelah hero visual.
- [ ] Gallery label tampil permanen di mobile, bukan hanya saat hover.
- [ ] Copy bahasa dibuat konsisten. Contoh: `Couples` menjadi `Pasangan`, `Our Story` menjadi `Cerita Kami`, `Portfolio` menjadi `Galeri`.
- [ ] Typo `Mahar & seserahan,lebih` diperbaiki menjadi `Mahar & seserahan, lebih`.
- [ ] Copy `Ribuan pasangan` disesuaikan dengan metric `500+`, misalnya `Ratusan pasangan`.
- [ ] Klaim `24/7 Support` diganti jika tidak benar-benar tersedia.
- [ ] Gambar yang belum tersedia tetap punya placeholder yang rapi: warm beige background, shimmer ringan, icon/label kategori, dan aspect ratio stabil agar layout tidak loncat.

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

Diisi setelah revisi selesai.

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
