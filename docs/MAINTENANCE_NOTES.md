# Maintenance Notes

## Ringkasan Risiko

| Prioritas | Area | Risiko |
| --- | --- | --- |
| Sedang | Lint baseline | ESLint berjalan, tetapi masih melaporkan warning existing non-blocking. |
| Sedang | Navigasi | Anchor `#packages` dan `#testimonials` tidak memiliki target aktif. |
| Sedang | Konfigurasi kontak | Kontak memiliki fallback lokal yang harus dijaga tetap sinkron dengan Supabase. |
| Sedang | Image performance | Asset aktif dilayani dari Supabase Storage dan perlu audit ukuran berkala. |
| Sedang | Legacy files | File PHP/Supervisor tidak terhubung ke aplikasi saat ini. |
| Sedang | Quality assurance | Tidak ada unit, integration, atau end-to-end test. |
| Sedang | Admin operations | CRUD dan upload masih memerlukan uji manual terhadap project Supabase target. |
| Sedang | Feedback privacy | Flow feedback memakai service-role server-only, bucket private, dan rate limit dasar per IP. |
| Tinggi | Rate-limit rollout | Production sudah memakai shared Supabase RPC, tetapi migration `009` wajib diterapkan sebelum deploy agar endpoint tidak fail-closed `503`. |
| Sedang | Trusted proxy | Topologi repo mendukung client langsung ke Nginx; CDN/load balancer future memerlukan allowlist CIDR resmi. |
| Sedang | Order access secret | `ORDER_ACCESS_COOKIE_SECRET` wajib acak minimal 32 byte dan rotasinya membatalkan cookie aktif. |
| Sedang | Upload content validation | Upload sudah validasi MIME/ukuran/path, tetapi belum validasi magic byte atau malware scanning. |
| Sedang | Security headers | CSP dan HSTS belum ditentukan; header dasar tersedia di Nginx. |
| Sedang | CI/CD deploy | Workflow aktif hanya verify/build/push GHCR; SSH deploy otomatis belum aktif. |

## Docker dan Deployment

`docker-compose.production.yml` sekarang berbasis registry image, tidak memiliki bind mount,
dan memiliki healthcheck. Compose production saat ini mengekspos host port `8003`.
Compose lokal tetap memakai bind mount dan host port `8002`; jangan gunakan Compose lokal
untuk production.

Workflow CI/CD aktif hanya sampai build dan push image GHCR. Deploy server masih manual/operasional.

Prioritas lanjutan:

1. Pertimbangkan `output: "standalone"` untuk runtime image lebih kecil.
2. Jalankan container sebagai non-root user jika kompatibel.
3. Pin base image ke digest pada task terpisah; GitHub Actions sudah dipin ke full commit SHA.
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

Next.js telah dinaikkan bertahap sampai `16.2.10`; cleanup dependency 2026-07-07 juga
menyinkronkan `eslint-config-next` ke `16.2.10`.

Import `Packages` pada `app/page.tsx` tetap ada walaupun render dikomentari. Quality gate akan membantu mendeteksi pola seperti ini.

## Package Manager

npm sudah menjadi package manager resmi project per 2026-07-05. Cleanup Dependabot 2026-07-07
menghapus lockfile non-npm. Decision record tersedia di
`docs/PACKAGE_MANAGER_DECISION.md`.

Status:

- `package.json` memiliki `packageManager: "npm@10.9.0"`;
- `package-lock.json` adalah satu-satunya lockfile resmi;
- CI dan Docker tetap memakai `npm ci`;
- `pnpm-lock.yaml` sudah dihapus dan tidak boleh ditambahkan kembali tanpa decision record baru.

Aturan maintenance:

- gunakan `npm ci` untuk install bersih;
- gunakan `npm install` hanya saat memperbarui dependency pada branch development;
- jangan menjalankan `pnpm install`;
- jangan menambahkan `pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, atau lockfile package manager
  lain.

## Dependency Surface

Folder `components/ui` berisi banyak primitive yang belum dipakai halaman aktif. Dependency seperti form, chart, calendar, carousel, drawer, toast, dan resizable panels tetap tercantum.

Dampak:

- update security lebih luas;
- lockfile lebih besar;
- onboarding lebih rumit;
- potensi dependency yang tidak pernah dipakai.

Tree shaking dapat mengurangi bundle client, tetapi maintenance dependency tetap ada. Audit usage sebelum menghapus package.

## Performance

Baseline performance Phase 0 tersedia di `docs/PERFORMANCE_BASELINE.md`.

Ringkasan hasil audit 2026-07-03:

- `/` mobile Lighthouse performance 90, LCP 3.32s, TBT 39ms, CLS 0.000;
- `/katalog` mobile Lighthouse performance 92, LCP 3.39s, TBT 43ms, CLS 0.000;
- `/` dan `/katalog` desktop Lighthouse performance 100;
- public script transfer sekitar 189.8 KB untuk `/` dan 174.2 KB untuk `/katalog`;
- `/admin-daz/login` mobile Lighthouse performance 98 dengan script transfer sekitar 223.5 KB.

Gunakan baseline tersebut sebagai pembanding sebelum menambah fitur commerce, dependency besar,
atau asset image baru.

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

### Phase 0 audit 2026-07-03

Audit environment dan security baseline sebelum commerce sudah dilakukan dan dicatat di:

- `docs/ENVIRONMENT_VARIABLES.md`;
- `docs/SECURITY_AND_PERFORMANCE.md`;
- `docs/ROADMAP.md`.

Hasil utama:

- env service-role tetap server-only dan tidak masuk Docker build argument atau workflow build image;
- RLS public/admin/feedback dan allowlist admin sudah sesuai baseline saat ini;
- feedback route publik sudah validasi input/upload dan memakai shared rate limit production;
- dependency advisory PostCSS internal Next.js sudah dibersihkan pada 2026-07-07; `postcss`
  resolved ke `8.5.16` dan `npm audit --audit-level=low` bersih pada saat cleanup;
- CodeQL aktif, tetapi hasil alert di GitHub tetap perlu dipantau oleh maintainer.

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

`SECURITY.md` sudah disesuaikan dengan baseline project `0.1.x` dan mengarahkan laporan
vulnerability ke channel private maintainer/project owner.

Masih perlu dikonfirmasi oleh owner:

- alamat atau channel private resmi;
- target response time;
- proses disclosure setelah perbaikan dirilis.

### Analytics dan privacy

Analytics belum aktif. Import dan render `@vercel/analytics/next` masih dikomentari di `app/layout.tsx`, dan package `@vercel/analytics` tidak terdaftar di `package.json`. Jika analytics diaktifkan kembali, privacy policy dan consent requirement perlu direview.

### Feedback privacy

Route feedback publik membaca request dan menyimpan submission melalui service-role key server-only. Bucket `feedback_customer_photos` private setelah migration `005`. Pertahankan aturan berikut:

- jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke client;
- jangan membuka RLS public langsung untuk tabel feedback tanpa review;
- validasi upload foto tetap wajib;
- shared rate limiter production aktif melalui migration `009`; pantau ukuran
  `rate_limit_buckets`, error RPC, dan response `503` setelah rollout.

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
4. Manual smoke test feedback dengan UUID request valid bila data Supabase tersedia.
5. Component test untuk filter/sorting katalog.
6. End-to-end test untuk navigasi, gallery, FAQ, feedback, dan CTA.
7. Container health check.

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
- Status file legacy.
- Apakah dark mode, toast system, dan full shadcn/ui library masuk roadmap.
- Apakah aplikasi memiliki SLA, monitoring, CDN, WAF, atau backup config di luar repository.
