Kamu adalah senior Next.js + Supabase engineer. Tolong perbaiki project daztore.id ini secara production-ready, aman, maintainable, dan jangan mengubah desain besar-besaran. Fokus pada perbaikan temuan prioritas dari review website live dan codebase terbaru.

Baca dulu AGENTS.md, README.md, SECURITY.md, struktur app/, components/, lib/, supabase/migrations/, docker/, dan .github/workflows/. Project menggunakan Next.js App Router, React 19, Supabase, Docker, dan GitHub Actions.

Target utama:
1. Perbaiki kebocoran data feedback/customer ke katalog publik.
2. Harden privacy/RLS feedback.
3. Perbaiki loading screen route transition yang baru ditambahkan.
4. Perbaiki config production Next.js, SEO, image optimization, mobile katalog, copywriting, dan Nginx headers.
5. Pastikan npm run lint, npm run typecheck, dan npm run build lolos.

Detail pekerjaan:

A. Feedback/catalog privacy dan data leak
- File utama terkait:
  - lib/admin-daz/feedback-service.ts
  - lib/data/landing-page.ts
  - supabase/migrations/004_create_feedback_feature.sql
  - app/feedback/[id]/page.tsx
  - app/feedback/[id]/submit/route.ts
  - components/admin-daz/admin-feedback-manager.tsx
- Saat ini createFeedbackRequest otomatis membuat row products dengan description default berisi nama pelanggan: “Produk dari request feedback pelanggan ${customerName}.”
- Ubah agar tidak pernah ada nama pelanggan masuk ke deskripsi produk publik.
- Gunakan deskripsi netral, misalnya “Produk custom berdasarkan request pelanggan.”
- Pastikan getCatalogData() hanya mengambil produk yang benar-benar boleh tampil publik. Produk dengan source = feedback_request jangan tampil di /katalog walaupun is_active accidentally true.
- Tambahkan migration baru, misalnya supabase/migrations/005_harden_feedback_privacy_and_catalog_cleanup.sql, untuk:
  - membersihkan description lama yang mengandung “Produk dari request feedback pelanggan%” menjadi deskripsi netral;
  - menonaktifkan atau mengamankan produk source = feedback_request yang berpotensi tampil publik;
  - jangan destructive ke data selain pola yang jelas.
- Update copy admin jika perlu agar tidak misleading. Kalau produk feedback hanya draft/non-public, wording admin harus jelas.

B. Harden feedback RLS dan akses publik
- Saat ini migration feedback memberi grant select feedback_requests ke anon dan policy public read status pending/submitted/expired. Ini berisiko karena anon bisa membaca semua request feedback, termasuk customer_name.
- Buat pendekatan yang lebih aman:
  - Tambahkan server-only Supabase service role client, misalnya lib/supabase/service-role.ts.
  - Tambahkan env SUPABASE_SERVICE_ROLE_KEY di .env.example dan docs terkait. Jangan pernah expose service role ke client/NEXT_PUBLIC.
  - app/feedback/[id]/page.tsx dan generateMetadata boleh membaca feedback request dari server dengan service role berdasarkan UUID id.
  - app/feedback/[id]/submit/route.ts sebaiknya menggunakan server-side service role untuk validasi request, upload foto, insert submission, dan cleanup file kalau insert gagal.
  - Revoke anon select dari feedback_requests.
  - Revoke direct anon insert ke feedback_submissions kalau submission sudah sepenuhnya lewat Next route.
  - RLS tetap aman untuk authenticated admin memakai public.is_active_admin().
- Jika feasible, ubah feedback_customer_photos menjadi private bucket:
  - jangan public read untuk foto pelanggan;
  - admin view gunakan signed URL dari server-side service;
  - jika terlalu besar untuk satu patch, minimal beri TODO/security note dan pastikan feedback page noindex.
- Tambahkan robots noindex/nofollow pada halaman /feedback/[id] karena halaman ini berisi nama pelanggan dan link privat.
- Jangan tampilkan error internal Supabase mentah ke user publik. Gunakan pesan umum, detail error cukup console.error server-side.

C. Loading screen route transition
- File terkait:
  - components/loading/route-loading-provider.tsx
  - components/loading/daztore-loader.tsx
  - app/loading.tsx
  - app/layout.tsx
- Temuan baru: RouteLoadingProvider hanya memanggil finishLoading() saat pathname berubah. shouldHandleAnchor() sudah menganggap perubahan search/query sebagai navigasi, tetapi useEffect finish hanya dependency pathname. Akibatnya, navigasi yang hanya mengubah query string bisa membuat loader tampil sampai SAFETY_TIMEOUT_MS 6500ms.
- Perbaiki agar loader selesai ketika pathname ATAU search params berubah.
- Gunakan solusi yang aman untuk Next.js App Router:
  - boleh gunakan useSearchParams dengan Suspense-safe handling;
  - atau mekanisme lain yang tidak membuat full CSR bailout tanpa Suspense.
- Pastikan loader tidak muncul untuk:
  - anchor hash saja;
  - external link;
  - mailto/tel/whatsapp;
  - target _blank;
  - download;
  - same URL.
- Pastikan loader tidak stuck saat navigasi dibatalkan atau halaman sudah cepat ter-load.
- Pertahankan accessibility:
  - role="status";
  - aria-live;
  - motion-reduce support;
  - jangan mengganggu screen reader berlebihan.
- Jangan membuat loader global terasa lambat. Delay dan min visible boleh dipertahankan atau disesuaikan sedikit jika perlu.

D. Next.js production config
- File: next.config.mjs.
- Hapus typescript.ignoreBuildErrors: true.
- Hapus images.unoptimized: true secara global.
- Tetap support Supabase remotePatterns dari NEXT_PUBLIC_SUPABASE_URL.
- Pastikan semua Image yang memakai Supabase/local images tetap jalan.
- Untuk preview blob/object URL di admin uploader/feedback form, jangan paksa next/image kalau bermasalah. Gunakan native img untuk object URL preview jika lebih aman.
- Jangan mematikan image optimization global lagi.

E. Image upload optimization
- File terkait:
  - lib/admin-daz/storage-service.ts
  - lib/feedback/storage.ts
  - components/admin-daz/admin-image-uploader.tsx
  - components/admin-daz/admin-feedback-manager.tsx
  - components/feedback/feedback-submission-form.tsx
- Saat ini upload memperbolehkan gambar sampai 5 MB dan langsung upload. Tambahkan compression/resize client-side atau server-side yang aman.
- Rekomendasi:
  - max width sekitar 1600px untuk katalog/landing;
  - customer feedback photo max width sekitar 1400px;
  - quality sekitar 0.8–0.85;
  - output WebP/JPEG;
  - fallback ke file asli jika browser tidak mendukung compression, tapi tetap validasi size.
- Update copy “Maksimal 5 MB” kalau aturan berubah.
- Pastikan iPhone/Safari tetap aman.

F. Mobile katalog
- File:
  - components/katalog/katalog-layout-shell.tsx
  - components/katalog/katalog-header.tsx
  - components/katalog/katalog-page.tsx
- Saat ini mobile/desktop layout ditentukan via mounted + matchMedia sehingga berpotensi flicker/layout shift.
- Refactor agar pakai CSS responsive:
  - desktop SiteNavigation hanya tampil md ke atas;
  - mobile KatalogHeader hanya tampil di bawah md;
  - SiteFooter desktop tetap md ke atas;
  - jangan bergantung pada window.innerWidth untuk layout utama.
- Search button di KatalogHeader saat ini tidak ada handler. Perbaiki:
  - opsi terbaik: arahkan/fokus ke search input katalog;
  - beri id pada input search, misalnya catalog-search;
  - tombol search mobile bisa berupa anchor/link ke #catalog-search atau callback yang aman.
- Perbaiki tombol back:
  - kalau history ada, router.back();
  - kalau user langsung buka /katalog, fallback ke router.push("/").
- Pastikan tidak ada flicker saat pertama load di mobile.

G. SEO dasar
- File:
  - app/layout.tsx
  - app/katalog/page.tsx
  - app/feedback/[id]/page.tsx
  - tambah app/robots.ts
  - tambah app/sitemap.ts
- Tambahkan metadataBase, canonical, OpenGraph image, Twitter card.
- Gunakan env NEXT_PUBLIC_SITE_URL dengan fallback https://daztore.web.id.
- Hapus generator: "v0.app".
- Tambahkan robots.ts:
  - public pages indexable;
  - admin-daz noindex;
  - feedback noindex.
- Tambahkan sitemap.ts minimal untuk / dan /katalog.
- app/feedback/[id]/page.tsx metadata harus noindex/nofollow.
- Jangan index halaman admin/login/unauthorized.

H. Copywriting dan seed/fallback consistency
- File:
  - lib/data/fallback.ts
  - supabase/seed.sql
- Rapikan copy yang tidak konsisten:
  - Hero metric 500+ vs testimonial “Ribuan pasangan” harus konsisten. Gunakan 500+ / ratusan pasangan, kecuali memang data aktual ribuan.
  - Jika title “Mahar & seserahan,” dan highlighted title “lebih dari sekadar tradisi.” membuat tampilan tanpa spasi di UI, perbaiki komponen atau copy agar tidak tampil “seserahan,lebih”.
- Jangan ubah brand tone besar-besaran. Tetap premium, hangat, wedding atelier.

I. Nginx production hardening
- File: docker/nginx/default.conf.
- Tambahkan security headers minimal:
  - X-Frame-Options SAMEORIGIN
  - X-Content-Type-Options nosniff
  - Referrer-Policy strict-origin-when-cross-origin
  - Permissions-Policy seperlunya
- Tambahkan cache header untuk static assets/_next/static jika relevan.
- Pastikan proxy headers tetap benar untuk Next.js.
- Jangan membuat config yang merusak Cloudflare/reverse proxy.

J. Validation, cleanup, dan quality gate
- Jalankan:
  - npm run lint
  - npm run typecheck
  - npm run build
- Kalau ada error existing, perbaiki sampai lolos.
- Jangan menambahkan dependency besar kecuali benar-benar perlu.
- Jangan expose secret di client.
- Jangan ubah schema production secara destructive.
- Buat migration SQL baru untuk perubahan DB; jangan edit migration lama kecuali hanya seed/fallback lokal yang memang diminta.
- Pastikan TypeScript strict-safe dan tidak pakai any jika bisa dihindari.
- Setelah selesai, berikan ringkasan:
  - files changed;
  - migration yang harus dijalankan;
  - env baru yang wajib diset;
  - hasil lint/typecheck/build;
  - catatan manual verification untuk mobile katalog, feedback link, dan loading screen.