# Maintenance Notes

## Ringkasan Risiko

| Prioritas | Area | Risiko |
| --- | --- | --- |
| Kritis | Compose production | Bind mount `.:/app` dapat menutupi `.next` dari image dan menghilangkan sifat immutable. |
| Tinggi | Type safety | `typescript.ignoreBuildErrors: true` memungkinkan build lolos dengan type error. |
| Tinggi | Lint | Script lint ada, tetapi dependency ESLint tidak terdaftar. |
| Tinggi | Deployment | Service app tidak memiliki registry image sehingga `docker compose pull` tidak dapat menjadi flow deploy app. |
| Tinggi | Health | Tidak ada health check atau readiness check. |
| Sedang | Dependency management | `package-lock.json` dan `pnpm-lock.yaml` dipelihara bersamaan. |
| Sedang | Dependency advisory | Audit masih melaporkan PostCSS internal Next.js; npm belum menawarkan patch kompatibel selain downgrade yang tidak layak. |
| Sedang | Navigasi | Anchor `#packages` dan `#testimonials` tidak memiliki target aktif. |
| Sedang | Konfigurasi kontak | Kontak memiliki fallback lokal yang harus dijaga tetap sinkron dengan Supabase. |
| Sedang | Image performance | Optimasi Next Image dinonaktifkan; asset aktif dilayani dari Supabase Storage. |
| Sedang | Legacy files | File PHP/Supervisor tidak terhubung ke aplikasi saat ini. |
| Sedang | Quality assurance | Tidak ada unit, integration, atau end-to-end test. |
| Sedang | Admin operations | CRUD dan upload masih memerlukan uji manual terhadap project Supabase target. |

## Docker dan Deployment

Prioritas maintenance production:

1. Buat Compose production berbasis registry image dan commit SHA.
2. Hapus bind mount source dari production.
3. Tambahkan health check.
4. Pertimbangkan `output: "standalone"` untuk runtime image lebih kecil.
5. Jalankan container sebagai non-root user jika kompatibel.
6. Pin base image dengan strategi update dan scanning yang jelas.

`.dockerignore` sudah mengecualikan `.env*`. Secret harus tersedia melalui environment runtime.

## TypeScript dan Lint

`strict: true` sudah aktif, tetapi manfaatnya berkurang karena build mengabaikan error.

Target perbaikan:

- tambahkan ESLint dan config Next.js/TypeScript yang sesuai;
- aktifkan lint sebagai required CI check;
- jalankan `tsc --noEmit`;
- hapus `ignoreBuildErrors` setelah error yang ada diselesaikan;
- pertimbangkan `noUnusedLocals` setelah baseline bersih.

Next.js telah dinaikkan dari `16.2.4` ke `16.2.7` untuk menutup advisory high yang terdeteksi saat implementasi Supabase.

Import `Packages` pada `app/page.tsx` tetap ada walaupun render dikomentari. `KatalogPage` juga mengimpor `useEffect` tetapi tidak memakainya. Quality gate akan membantu mendeteksi pola seperti ini.

## Package Manager

Docker menggunakan npm, sedangkan repository juga menyimpan pnpm lockfile.

Pilih satu package manager resmi dan:

- dokumentasikan versinya;
- gunakan satu lockfile;
- samakan local, CI, dan Docker;
- tambahkan `packageManager` pada `package.json` bila keputusan sudah dibuat.

Hindari menghapus salah satu lockfile sebelum pemilik project mengonfirmasi package manager resmi.

## Dependency Surface

Folder `components/ui` berisi banyak primitive yang belum dipakai halaman aktif. Dependency seperti form, chart, calendar, carousel, drawer, toast, dan resizable panels tetap tercantum.

Dampak:

- update security lebih luas;
- lockfile lebih besar;
- onboarding lebih rumit;
- potensi dependency yang tidak pernah dipakai.

Tree shaking dapat mengurangi bundle client, tetapi maintenance dependency tetap ada. Audit usage sebelum menghapus package.

## Performance

### Image

`images.unoptimized: true` menonaktifkan optimasi Next Image.
Konfigurasi tersebut dipertahankan saat migrasi Storage. `next.config.mjs` mengizinkan host
Supabase dari `NEXT_PUBLIC_SUPABASE_URL` tanpa hardcode project hostname.

Area evaluasi:

- ukuran hero `hero-mahar.webp` sekitar 299 KB;
- beberapa JPG galeri sekitar 160 KB;
- cache header/CDN;
- responsive source;
- format WebP atau AVIF.

Object path seed harus tetap sinkron dengan file pada bucket `landing_page` dan `catalogs`.
Migration hanya membuat bucket/policy dan tidak meng-upload asset.

### Client Components

Beberapa section menjadi Client Component untuk interaksi atau animasi. `app/katalog/layout.tsx` menjadi client hanya untuk viewport detection.

Evaluasi masa depan:

- gunakan CSS responsive rendering jika cukup;
- batasi hydration pada komponen yang memang interaktif;
- gunakan media query hook yang konsisten;
- ukur dengan Lighthouse atau Web Vitals sebelum refactor.

### Scroll dan Resize Listener

`Hero`, `SiteNavigation`, `WhatsappButton`, dan layout katalog memasang listener browser. Sebagian sudah passive dan cleanup tersedia. Tetap ukur dampaknya pada device low-end sebelum menambah animasi baru.

## Konten dan Data

Data katalog, FAQ, testimoni, statistik, harga, dan klaim layanan sekarang tersedia di Supabase dengan fallback lokal.

Risiko:

- fallback dapat tertinggal dari data production;
- perubahan schema memerlukan migration terkontrol;
- klaim pemasaran dapat kedaluwarsa;
- akses tulis konten belum memiliki UI admin.

Tetapkan owner konten dan proses sinkronisasi fallback sebelum menghapus data lokal.

## UX dan Aksesibilitas

Catatan:

- `#packages` rusak karena section tidak dirender;
- `#testimonials` rusak karena ID tidak tersedia;
- link legal masih placeholder;
- tombol search mobile katalog belum berfungsi;
- favorite katalog tidak persisten;
- FAQ belum memiliki `aria-expanded`;
- lightbox belum memiliki focus trap;
- animasi belum menangani `prefers-reduced-motion`.

Perbaikan harus dilakukan bertahap dengan regression check visual.

## Security

### Admin

Route admin memakai Supabase Auth cookie session, allowlist `admin_users`, dan RLS.
Pertahankan aturan berikut:

- jangan menambahkan service-role key ke variable `NEXT_PUBLIC_*`;
- audit user `admin_users` secara berkala;
- nonaktifkan admin yang tidak lagi berwenang;
- backup database dan Storage sebelum operasi massal;
- verifikasi policy migration di staging sebelum production.

UI menyediakan hard delete setelah konfirmasi. Foreign key dapat menolak penghapusan kategori
yang masih dipakai produk; gunakan nonaktifkan sebagai pilihan operasional yang lebih aman.

### Security policy

`SECURITY.md` masih template generik dengan versi `5.1.x`, `5.0.x`, dan `4.0.x` yang tidak sesuai version project `0.1.0`.

Perlu diperbarui dengan:

- versi yang didukung;
- alamat pelaporan private;
- target response time;
- larangan membuka vulnerability sensitif melalui public issue.

### Analytics dan privacy

Vercel Analytics aktif pada production. Privacy policy dan consent requirement belum tersedia di aplikasi.

### Headers

Tidak ditemukan Content Security Policy, HSTS, frame policy, referrer policy, atau permissions policy khusus pada Nginx/Next config. Terapkan berdasarkan arsitektur TLS dan kebutuhan integrasi setelah pengujian.

### External links

Kontak external tidak memakai secret. Tetap validasi URL dan account ownership secara berkala.

## Testing

Tidak ditemukan test runner atau test file.

Minimum roadmap:

1. CI lint dan type check.
2. Build smoke test.
3. Route smoke test untuk `/` dan `/katalog`.
4. Component test untuk filter/sorting katalog.
5. End-to-end test untuk navigasi, gallery, FAQ, dan CTA.
6. Container health check.

## Legacy dan Duplikasi

- `styles/globals.css` tidak aktif dan berbeda dari `app/globals.css`.
- `hooks/use-toast.ts` dan `components/ui/use-toast.ts` memiliki implementasi serupa.
- `hooks/use-mobile.ts` dan `components/ui/use-mobile.tsx` memiliki fungsi serupa.
- `Testimonials` dan `TestimonialsEnhanced` adalah dua implementasi alternatif.
- File PHP/Supervisor tampak berasal dari stack lain.
- `hero-mahar-old.jpg` tampak sebagai asset lama.

Jangan menghapus file tersebut tanpa konfirmasi owner dan pengecekan history/deployment eksternal.

## Needs Confirmation

- Kebenaran seluruh klaim pemasaran dan testimonial.
- Package manager resmi.
- Status file legacy.
- Apakah dark mode, toast system, dan full shadcn/ui library masuk roadmap.
- Apakah aplikasi memiliki SLA, monitoring, CDN, WAF, atau backup config di luar repository.
