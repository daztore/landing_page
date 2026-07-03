# Maintenance Notes

## Ringkasan Risiko

| Prioritas | Area | Risiko |
| --- | --- | --- |
| Sedang | Lint baseline | ESLint berjalan, tetapi masih melaporkan warning existing non-blocking. |
| Sedang | Dependency management | `package-lock.json` dan `pnpm-lock.yaml` dipelihara bersamaan. |
| Sedang | Dependency advisory | Audit masih melaporkan PostCSS internal Next.js; npm belum menawarkan patch kompatibel selain downgrade yang tidak layak. |
| Sedang | Navigasi | Anchor `#packages` dan `#testimonials` tidak memiliki target aktif. |
| Sedang | Konfigurasi kontak | Kontak memiliki fallback lokal yang harus dijaga tetap sinkron dengan Supabase. |
| Sedang | Image performance | Asset aktif dilayani dari Supabase Storage dan perlu audit ukuran berkala. |
| Sedang | Legacy files | File PHP/Supervisor tidak terhubung ke aplikasi saat ini. |
| Sedang | Quality assurance | Tidak ada unit, integration, atau end-to-end test. |
| Sedang | Admin operations | CRUD dan upload masih memerlukan uji manual terhadap project Supabase target. |

## Docker dan Deployment

`docker-compose.production.yml` sekarang berbasis registry image, tidak memiliki bind mount,
dan memiliki healthcheck. Compose lokal tetap memakai bind mount dan tidak boleh digunakan
untuk production.

Prioritas lanjutan:

1. Pertimbangkan `output: "standalone"` untuk runtime image lebih kecil.
2. Jalankan container sebagai non-root user jika kompatibel.
3. Pin base image dan GitHub Actions ke digest/full commit SHA.
4. Tambahkan monitoring deployment dan alert healthcheck.

`.dockerignore` sudah mengecualikan `.env*`. Secret harus tersedia melalui environment runtime.

## TypeScript dan Lint

`strict: true` sudah aktif dan build gagal jika ada TypeScript error.

ESLint flat config Next.js/TypeScript dan job CI sudah tersedia. Tiga aturan React baru
diturunkan menjadi warning agar aktivasi lint tidak memaksa refactor perilaku existing:

- `react-hooks/set-state-in-effect`;
- `react-hooks/purity`;
- `react/no-unescaped-entities`.

Target perbaikan lanjutan:

- selesaikan warning secara bertahap lalu naikkan kembali severity;
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

Next Image optimization aktif untuk asset publik. `next.config.mjs` mengizinkan host Supabase
dari `NEXT_PUBLIC_SUPABASE_URL` tanpa hardcode project hostname.

Area evaluasi:

- ukuran hero `hero-mahar.webp` sekitar 299 KB;
- beberapa JPG galeri sekitar 160 KB;
- cache header/CDN;
- responsive source;
- format WebP atau AVIF.

Object path seed harus tetap sinkron dengan file pada bucket `landing_page` dan `catalogs`.
Migration hanya membuat bucket/policy dan tidak meng-upload asset.

### Client Components

Beberapa section tetap menjadi Client Component untuk interaksi yang memang dibutuhkan,
seperti navigation, gallery lightbox, FAQ accordion, filter katalog, dan tombol WhatsApp.
Section statis seperti `Hero`, `OurProcess`, `WhyChooseUs`, `TestimonialsEnhanced`,
`UrgencySection`, dan dekorasi `FloatingFlower` dirender sebagai Server Component atau
komponen non-hydrated bila memungkinkan.

Evaluasi masa depan:

- gunakan CSS responsive rendering jika cukup;
- batasi hydration pada komponen yang memang interaktif;
- gunakan media query hook yang konsisten;
- ukur dengan Lighthouse atau Web Vitals sebelum refactor.

### Scroll dan Resize Listener

`Hero` tidak lagi memasang scroll listener untuk parallax. `SiteNavigation` dan
`WhatsappButton` masih memakai listener scroll passive untuk perubahan visual setelah scroll.
Layout katalog memakai CSS responsive untuk membedakan mobile dan desktop.

Tetap ukur dampaknya pada device low-end sebelum menambah animasi baru.

### Loading Screen dan Route Transition

Loading brand global berada di:

- `components/loading/daztore-loader.tsx`;
- `components/loading/route-loading-provider.tsx`;
- `app/loading.tsx`.

Perilaku:

- loader menampilkan bentuk huruf D dengan palet daztore.id;
- muncul untuk klik link internal dengan delay singkat agar tidak flashing;
- tidak muncul untuk `mailto:`, `tel:`, external URL, target tab baru, download, atau hash-only link;
- berhenti saat pathname atau search params berubah dan memiliki safety timeout sekitar 6,5 detik;
- memakai CSS/Tailwind saja tanpa library animasi eksternal;
- mengikuti `prefers-reduced-motion` melalui class Tailwind dan aturan global CSS.

Catatan manual test:

- klik dari `/` ke `/katalog`, pastikan loader muncul bila transisi tidak instan dan hilang setelah halaman katalog siap;
- klik anchor seperti `#gallery` atau CTA WhatsApp, pastikan loader tidak muncul;
- uji mobile viewport untuk memastikan overlay memenuhi layar dan tidak menyebabkan layout shift.

## Konten dan Data

Data katalog, FAQ, testimoni, statistik, harga, dan klaim layanan sekarang tersedia di Supabase dengan fallback lokal.

Risiko:

- fallback dapat tertinggal dari data production;
- perubahan schema memerlukan migration terkontrol;
- klaim pemasaran dapat kedaluwarsa;
- operasi admin masih memerlukan verifikasi berkala terhadap project Supabase production.

Tetapkan owner konten dan proses sinkronisasi fallback sebelum menghapus data lokal.

## UX dan Aksesibilitas

Catatan:

- `#packages` rusak karena section tidak dirender;
- `#testimonials` rusak karena ID tidak tersedia;
- link legal masih placeholder;
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

Nginx mengirim frame policy, content-type nosniff, referrer policy, permissions policy, dan cache
immutable untuk `/_next/static`. Content Security Policy dan HSTS masih perlu dikonfirmasi sesuai
arsitektur TLS/CDN.

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
