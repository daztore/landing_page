# Roadmap

Dokumen ini menjadi acuan utama pengembangan `daztore.id` dari landing page + katalog + admin CMS menuju platform commerce/order online secara bertahap.

Roadmap ini tidak memberi izin untuk langsung membangun payment, order, shipping, cart, atau checkout publik. Fitur tersebut hanya boleh dibuat saat ada prompt/task spesifik, dependency dasar sudah siap, dan risiko keamanan/performa sudah dinilai.

## Current Baseline

- Framework: Next.js App Router.
- Package manager resmi: npm `10.9.0` melalui `packageManager` di `package.json`; `package-lock.json` adalah satu-satunya lockfile resmi.
- Database/CMS: Supabase untuk konten publik, admin CMS, feedback, Storage, Auth, dan RLS.
- Route publik aktif: `/`, `/katalog`, `/produk/[slug]`, `/order/[orderNumber]`,
  `/order/[orderNumber]/access`, `/feedback/[id]`.
- Route API aktif: `/api/leads`, `/feedback/[id]/submit`.
- Route admin aktif: `/admin-daz/**`, termasuk `/admin-daz/leads` dan `/admin-daz/orders`.
- Deployment: Docker multi-stage, GHCR image build, dan Compose production berbasis image.

## Status Legend

- `TODO` = belum dikerjakan.
- `IN_PROGRESS` = sedang dikerjakan atau sebagian sudah tersedia.
- `DONE` = selesai dan sudah diverifikasi.
- `BLOCKED` = menunggu keputusan, credential, akses, atau dependency eksternal.
- `DEFERRED` = sengaja ditunda sampai fase sebelumnya stabil.

## Priority Legend

- `P0` = sangat penting, fondasi, keamanan, atau performa.
- `P1` = penting untuk tahap berikutnya.
- `P2` = improvement setelah fondasi siap.
- `P3` = jangka panjang dan dapat ditunda.

## Phase 0 - Stabilization & Documentation Foundation

Tujuan: memastikan proyek terdokumentasi, aman untuk diteruskan, dan tidak melebar sebelum fondasi production jelas.

### [P0][DONE] Update documentation structure

Subtask:

- Buat `docs/ROADMAP.md`.
- Buat `docs/DEVELOPMENT_RULES.md`.
- Buat `docs/AGENT_GUIDE.md`.
- Buat `docs/MODULE_ARCHITECTURE.md`.
- Buat `docs/SECURITY_AND_PERFORMANCE.md`.
- Buat `docs/COMMERCE_PREPARATION.md`.
- Buat `docs/QA_UX_NOTES.md`.
- Buat `docs/CHANGELOG_NOTES.md`.
- Tambahkan link dokumentasi baru di README.

### [P0][DONE] Sync existing README and docs with current code

Subtask:

- Audit dokumen existing terhadap route aktif.
- Sinkronkan catatan API route, feedback route, dan service-role usage.
- Sinkronkan port Compose lokal dan production.
- Sinkronkan status CI/CD yang benar-benar aktif.
- Catat gap yang tidak langsung diperbaiki di `docs/CHANGELOG_NOTES.md`.

### [P0][DONE] Audit environment variable usage

Subtask:

- Pastikan secret tidak digunakan di Client Component.
- Pastikan `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai server-side.
- Pastikan tidak ada service-role key dengan prefix `NEXT_PUBLIC_*`.
- Dokumentasikan env wajib dan opsional.
- Bedakan env build-time, runtime, server-only, dan public client.
- Pastikan `.env.local` tidak pernah masuk repo atau Docker image.

Hasil audit 2026-07-03:

- `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca oleh `lib/supabase/service-role.ts` dan module tersebut memakai `server-only`.
- Import service-role hanya ditemukan di flow feedback server-side: `lib/feedback/data.ts` dan `app/feedback/[id]/submit/route.ts`.
- Client/admin browser Supabase hanya memakai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Docker build dan workflow GitHub Actions hanya memakai env public; service-role hanya runtime env server/Compose.
- `.gitignore` dan `.dockerignore` sudah mengecualikan `.env*`; `.env.example` tetap boleh di-commit.
- Gap lanjutan: belum ada schema validasi env terpusat untuk fail-fast credential commerce/server-only.

### [P0][DONE] Decide official package manager

Subtask:

- Konfirmasi owner project bahwa npm adalah package manager resmi.
- Pertahankan `package-lock.json` sebagai lockfile utama jika npm disetujui.
- Jangan hapus `pnpm-lock.yaml` sebelum ada approval eksplisit.
- Tambahkan `packageManager` di `package.json` setelah keputusan final.
- Samakan local, CI, Docker, dan dokumentasi.

Hasil audit 2026-07-03:

- Dockerfile, CI/CD, README, dan setup lokal memakai npm dan `npm ci`.
- `package-lock.json` tersedia sebagai lockfile npm utama.
- `pnpm-lock.yaml` masih ada, tetapi tidak dipakai oleh Dockerfile atau workflow aktif.
- `package.json` belum memiliki field `packageManager`.
- Rekomendasi teknis: tetapkan npm sebagai package manager resmi.
- Detail: `docs/PACKAGE_MANAGER_DECISION.md`.

Hasil keputusan 2026-07-05:

- Owner menyetujui rekomendasi teknis untuk menetapkan npm sebagai package manager resmi.
- `package.json` menambahkan `packageManager: "npm@10.9.0"`.
- `package-lock.json` tetap menjadi lockfile utama.
- Local docs, CI, dan Docker tetap memakai `npm ci`.
- `pnpm-lock.yaml` awalnya diperlakukan sebagai legacy lockfile yang tidak boleh diperbarui.

Hasil cleanup 2026-07-07:

- `pnpm-lock.yaml` dihapus melalui task cleanup Dependabot karena npm sudah menjadi package
  manager resmi.
- `package-lock.json` menjadi satu-satunya lockfile yang boleh di-commit.
- `.gitignore` menolak lockfile package manager lain seperti `pnpm-lock.yaml`, `yarn.lock`,
  `bun.lock`, dan `bun.lockb`.

### [P0][DONE] Security check before commerce work

Subtask:

- Review RLS untuk tabel public, admin, feedback, dan Storage.
- Audit admin route protection dan allowlist `admin_users`.
- Review upload validation untuk bucket private/public.
- Review error handling agar detail internal tidak bocor ke user publik.
- Siapkan rate limit untuk endpoint publik sebelum inquiry/checkout.
- Review dependency advisory dan CodeQL findings.

Hasil audit 2026-07-03:

- RLS public/admin/feedback dan Storage sudah sesuai baseline saat ini.
- Admin route memakai Supabase Auth cookie session, proxy refresh, dan allowlist `admin_users`.
- Feedback public route sudah validasi UUID, body, rating, rekomendasi, jumlah file, MIME/extension/size, path, rate limit in-memory per IP, dan cleanup upload jika database insert gagal.
- Error publik dibuat generik; detail teknis hanya dilog server-side.
- CodeQL aktif untuk JavaScript/TypeScript dengan `security-extended`.
- Gap sebelum commerce: upload belum validasi magic byte/content scanning dan CSP/HSTS belum
  ditentukan. Advisory PostCSS internal Next.js sudah dibersihkan pada 2026-07-07 melalui
  dependency update dan npm override yang tervalidasi.

Hardening 2026-07-10:

- Endpoint lead, feedback, dan forgot-password memakai shared Supabase RPC rate limiter pada
  production; development tetap memakai adapter in-memory.
- Trust boundary client IP dipindahkan ke header custom yang ditimpa Nginx.
- Raw token order ditukar menjadi cookie `HttpOnly` bertanda tangan lalu dibersihkan dari URL.
- Workflow GitHub Actions dipin ke full commit SHA dan Compose production mewajibkan image tag
  immutable.

### [P0][DONE] Performance baseline

Subtask:

- Catat baseline Lighthouse/Core Web Vitals untuk `/`.
- Catat baseline Lighthouse/Core Web Vitals untuk `/katalog`.
- Catat ukuran bundle publik dan route admin.
- Catat performa image hero, galeri, dan katalog.
- Pastikan data admin tidak masuk bundle halaman publik.
- Buat checklist regresi performa untuk fitur besar.

Hasil baseline 2026-07-03:

- Lighthouse mobile: `/` performance 90, LCP 3.32s, CLS 0.000; `/katalog` performance 92, LCP 3.39s, CLS 0.000.
- Lighthouse desktop: `/` dan `/katalog` performance 100.
- Public script transfer: `/` mobile 189.8 KB; `/katalog` mobile 174.2 KB.
- Admin login baseline: `/admin-daz/login` mobile performance 98, script transfer 223.5 KB.
- Source/network audit tidak menemukan admin route/data dimuat oleh halaman publik yang dicek.
- Detail dan checklist regresi: `docs/PERFORMANCE_BASELINE.md`.

### [P0][DONE] Agent/Codex workflow enforcement

Subtask:

- Wajibkan agent membaca roadmap dan rules sebelum coding.
- Wajibkan agent menulis scope dan asumsi untuk task ambigu.
- Wajibkan perubahan dokumentasi jika env, API, database, atau flow bisnis berubah.
- Catat issue unrelated, jangan langsung diperbaiki kecuali security-critical.
- Gunakan format response akhir yang konsisten.

Hasil enforcement 2026-07-03:

- `AGENTS.md` menambahkan Roadmap Task Execution Checklist.
- `docs/AGENT_GUIDE.md` menambahkan Roadmap Task Enforcement dan aturan khusus package manager.
- `docs/DEVELOPMENT_RULES.md` menambahkan Workflow Enforcement.
- `docs/prompts/ROADMAP_TASK_PROMPT_TEMPLATE.md` menambahkan section scope/asumsi dan acceptance criteria terkait.

## Phase 1 - Modular Foundation

Tujuan: menyiapkan struktur modular tanpa merusak fitur lama. Concern utama yang harus dipisah: marketing, catalog, admin, feedback, leads, orders, payments, shipping, dan customers.

### [P0][DONE] Define modular architecture

Subtask:

- Tentukan kapan folder `features/` mulai dibuat.
- Tentukan module boundary untuk catalog, feedback, leads, orders, payments, shipping, dan customers.
- Tentukan aturan import antar modul.
- Tentukan service/query layer untuk akses data lintas modul.
- Pastikan `app/` hanya menjadi orchestration dan presentation layer.

Hasil keputusan 2026-07-05:

- Project tetap memakai modular monolith dalam satu Next.js App Router app.
- Folder `features/` mulai dibuat hanya saat ada domain module nyata dari roadmap yang
  diimplementasikan, bukan sebagai folder kosong atau refactor massal.
- Boundary catalog, feedback, leads, customers, orders, payments, dan shipping terdokumentasi
  di `docs/MODULE_ARCHITECTURE.md`.
- Import antar modul wajib melalui public service/query API; deep import file internal module
  lain dihindari.
- `app/` ditetapkan sebagai route orchestration dan presentation layer, bukan tempat business
  workflow besar, query kompleks, atau integrasi provider langsung.
- Tidak ada folder baru, schema database, route commerce, payment, shipping, checkout, atau
  customer account yang dibuat pada task ini.

### [P1][DONE] Prepare product detail structure

Subtask:

- Rancang route `/produk/[slug]`.
- Rancang kontrak data produk detail.
- Rancang slug unik dan fallback 404.
- Pastikan katalog lama `/katalog` tetap berjalan.
- Rancang metadata SEO dan image policy.

Hasil keputusan 2026-07-05:

- Route public yang disiapkan adalah `/produk/[slug]`.
- Product detail membaca produk aktif berdasarkan `products.slug`, mengecualikan produk
  `source = 'feedback_request'`, dan memakai `notFound()` untuk slug invalid/tidak aktif.
- Kontrak `ProductDetail` mencakup slug, title, category, description, harga estimasi, image,
  badge, processing time, customizable, availability, dan inquiry default message.
- `/katalog` tetap memakai data list existing dan tidak bergantung pada detail page.
- Metadata SEO memakai canonical `/produk/[slug]`, OG image produk yang aman, dan sitemap hanya
  untuk produk aktif setelah route benar-benar dibuat.
- Tidak ada route `/produk/[slug]` yang dibuat pada task preparation ini.

### [P1][DONE] Prepare lead/inquiry module

Subtask:

- Rancang tabel `leads`.
- Rancang tabel `lead_messages`.
- Rancang status lead.
- Rancang flow admin lead management.
- Rancang anti-spam/rate limit untuk form publik.
- Rancang notifikasi awal tanpa menyimpan secret di client.

Hasil keputusan 2026-07-05:

- Tabel `leads` dan `lead_messages` dirancang di `docs/MODULE_ARCHITECTURE.md` dan
  `docs/COMMERCE_PREPARATION.md`; migration belum dibuat.
- Status lead resmi: `new`, `contacted`, `quoted`, `converted`, `cancelled`.
- Form inquiry public dirancang untuk submit ke Route Handler server-side `/api/leads`, bukan
  direct public insert Supabase.
- Anti-spam minimal mencakup validasi body, consent, rate limit, honeypot/time-to-submit bila
  dibutuhkan, dan error publik generik.
- Notification awal harus server-side atau melalui admin dashboard/list; secret provider tidak
  boleh disimpan di client atau `NEXT_PUBLIC_*`.
- Tidak ada endpoint lead, form aktif, migration, atau notifikasi provider yang dibuat pada task
  preparation ini.

### [P1][DONE] Prepare admin module boundary

Subtask:

- Pertahankan route admin di `/admin-daz/**`.
- Pisahkan resource admin per domain.
- Pastikan CRUD admin tetap lewat RLS dan auth server-side.
- Hindari import data admin ke halaman publik.
- Tambahkan audit trail untuk operasi sensitif pada fase berikutnya.

Hasil keputusan 2026-07-05:

- Route admin tetap berada di `/admin-daz/**` dan protected layout tetap memakai `requireAdmin()`.
- Resource admin dipisahkan per domain: landing/content, catalog, feedback, leads, orders,
  payments, shipping, dan customers.
- Generic `AdminResourceManager` tetap untuk resource konten/katalog sederhana; workflow domain
  seperti feedback, leads, orders, payments, shipping, dan customers memakai dedicated
  service/component.
- CRUD admin tetap melalui Supabase Auth cookie session dan RLS admin; service-role tidak boleh
  dipakai di Client Component admin.
- Public page tidak boleh import `lib/admin-daz/*`, komponen admin, atau data admin.
- Audit trail future `audit_logs` dicatat sebagai requirement sebelum operasi sensitif
  order/payment/shipping production.

## Phase 2 - Lead & Inquiry Management

Tujuan bisnis: menangkap calon customer sebelum masuk order/payment.

### [P1][DONE] Product detail page

Subtask:

- Buat halaman detail produk hanya setelah kontrak produk stabil.
- Tampilkan informasi harga sebagai estimasi, bukan invoice.
- Tambahkan CTA inquiry/konsultasi.
- Pastikan halaman tetap cepat dan cache-friendly.
- Pastikan fallback produk lama tidak rusak.
- Utamakan tampilan untuk mobile

Hasil implementasi 2026-07-06:

- Route public `/produk/[slug]` dibuat sebagai Server Component dengan `revalidate = 300`.
- Data detail dibaca melalui module `features/catalog` dan hanya menampilkan produk aktif,
  bukan produk `source = 'feedback_request'`; slug invalid/tidak ditemukan memanggil `notFound()`.
- Harga ditampilkan sebagai estimasi dan CTA konsultasi memakai WhatsApp, bukan cart/checkout.
- Kartu katalog menambahkan link detail tanpa menghapus CTA WhatsApp existing.
- Sitemap menambahkan URL produk aktif setelah route detail tersedia.
- Inquiry form, admin lead management, dan lead status workflow diselesaikan sebagai item Phase 2
  terpisah di bawah.

### [P1][DONE] Inquiry form

Subtask:

- Definisikan field minimum: nama, WhatsApp, produk/minat, catatan, dan consent.
- Validasi input server-side.
- Tambahkan rate limit dan spam protection.
- Jangan simpan data sensitif yang tidak dibutuhkan.
- Simpan consent/privacy acknowledgement bila diwajibkan.
- Utamakan tampilan untuk mobile

Hasil implementasi 2026-07-06:

- Form inquiry aktif dipasang di `/produk/[slug]` melalui module `features/leads`.
- Field minimal tersedia: nama, WhatsApp, produk/minat, catatan, dan consent; field opsional
  email, tanggal acara, dan range budget juga disediakan.
- Submit public memakai Route Handler server-side `/api/leads`, bukan direct insert Supabase dari
  client.
- Validasi server-side mencakup content type, ukuran body, nama, WhatsApp, email, product slug,
  interest category, event date, budget range, message length, consent, honeypot, dan
  time-to-submit ringan.
- Rate limit in-memory diterapkan per IP dan nomor WhatsApp; untuk multi-instance tetap perlu
  store terpusat.
- Data yang disimpan dibatasi ke kontak follow-up, minat produk, catatan, consent snapshot,
  product snapshot, source URL, dan user agent ringkas.

Hardening 2026-07-10 mengganti limiter production dengan shared Supabase RPC atomik. Limit per IP
dan nomor WhatsApp tetap sama; key personal dinormalisasi lalu di-hash. Development mempertahankan
adapter in-memory.

### [P1][DONE] Admin lead management

Subtask:

- Tambahkan list lead dengan pagination.
- Tambahkan detail lead.
- Tambahkan filter status.
- Tambahkan catatan follow-up admin.
- Batasi akses hanya untuk admin aktif.
- Utamakan tampilan untuk mobile

Hasil implementasi 2026-07-06:

- Tabel `leads` dan `lead_messages` dibuat melalui migration
  `supabase/migrations/006_create_leads_feature.sql`.
- Route admin `/admin-daz/leads` menampilkan list lead dengan pagination, filter status, dan
  pencarian nama/WhatsApp/produk/minat.
- Route admin `/admin-daz/leads/[id]` menampilkan detail lead, snapshot produk, catatan customer,
  consent, dan timeline follow-up.
- Admin dapat menambah catatan follow-up melalui dedicated lead service/action route.
- Akses admin tetap memakai protected layout, Supabase Auth cookie session, allowlist
  `admin_users`, dan RLS `public.is_active_admin()`.

### [P1][DONE] Lead status workflow

Subtask:

- Dokumentasikan status lead.
- Simpan perubahan status dengan actor dan timestamp.
- Pastikan status tidak berubah dari banyak tempat tanpa service yang jelas.
- Tambahkan validasi transisi bila flow bisnis sudah final.

Hasil implementasi 2026-07-06:

- Status lead resmi tetap `new`, `contacted`, `quoted`, `converted`, dan `cancelled`.
- Lead baru dari form public otomatis dibuat dengan status `new`.
- Perubahan status admin dilakukan melalui service lead dan RPC database
  `public.change_lead_status()`, yang mencatat actor `auth.uid()`, timestamp, status asal,
  status tujuan, dan catatan opsional di `lead_messages`.
- Validasi saat ini membatasi status ke daftar resmi; transition matrix belum dipersempit karena
  flow bisnis final order/manual conversion berada pada Phase 3.
- Tidak ada order, payment, shipping, cart, checkout, customer account, atau auto-create order yang
  dibuat.

Status lead:

- `new`
- `contacted`
- `quoted`
- `converted`
- `cancelled`

## Phase 3 - Manual Order Management

Tujuan: admin bisa membuat order dari hasil konsultasi. Ini menjadi fondasi sebelum payment online.

### [P1][DONE] Order data model

Subtask:

- Rancang tabel `orders`.
- Rancang tabel `order_items`.
- Rancang tabel `order_status_histories`.
- Simpan snapshot produk pada order item.
- Rancang nomor order yang stabil dan mudah dilacak.
- Rancang constraint untuk status, total, dan customer reference.

Hasil implementasi 2026-07-06:

- Migration `supabase/migrations/007_create_orders_feature.sql` membuat tabel `orders`,
  `order_items`, dan `order_status_histories`.
- Nomor order dibuat dengan format stabil `DZT-YYYYMMDD-xxxxx` melalui sequence dan function
  `public.generate_order_number()`.
- Order item menyimpan `product_snapshot`, nama item, harga satuan, quantity, line total,
  opsi custom, dan catatan admin.
- Constraint database membatasi status resmi, format nomor order, format WhatsApp, token hash
  publik, nilai total, dan shape JSON snapshot/metadata.
- Public direct read/write ke tabel order tidak dibuka; admin dibatasi RLS
  `public.is_active_admin()`.

### [P1][DONE] Admin create order

Subtask:

- Buat flow admin membuat order dari lead atau customer.
- Tambahkan item manual dan item dari katalog.
- Simpan snapshot nama, harga, opsi custom, dan catatan.
- Validasi total server-side.
- Pastikan order draft tidak dianggap transaksi final.

Hasil implementasi 2026-07-06:

- Admin dapat membuat order manual melalui `/admin-daz/orders/new`.
- Detail lead memiliki shortcut `Buat order` ke `/admin-daz/orders/new?leadId=...` untuk prefill
  customer dan item awal dari lead.
- Form order mendukung item manual dan item dari katalog aktif; item katalog divalidasi ulang
  server-side sebelum snapshot disimpan.
- Total order dihitung ulang oleh service server-side dan order baru selalu dibuat dengan status
  `draft`.
- Pembuatan order dari lead menandai lead sebagai `converted` melalui RPC lead existing.
- Tidak ada payment provider, invoice payment, shipping, cart, checkout, atau customer account
  yang dibuat.

### [P1][DONE] Public order detail page

Subtask:

- Rancang URL publik berbasis order number dan token aman bila diperlukan.
- Tampilkan status tanpa membocorkan data sensitif.
- Batasi data customer yang terlihat.
- Tambahkan metadata noindex jika halaman tidak untuk SEO.

Hasil implementasi 2026-07-06:

- Route publik `/order/[orderNumber]?token=...` dibuat untuk melihat ringkasan order berbasis
  nomor order dan token aman.
- Database hanya menyimpan hash token publik; raw token hanya diberikan ke admin saat order dibuat
  atau link publik dibuat ulang.
- Halaman publik hanya menampilkan nomor order, nama depan customer, tanggal relevan, status,
  item, total, dan timeline status tanpa WhatsApp/email/catatan admin.
- Metadata halaman order diset `noindex,nofollow`, dan `/order` ditambahkan ke `robots.txt`
  disallow.

Hardening 2026-07-10 menambahkan route exchange `/order/[orderNumber]/access?token=...`, cookie
`HttpOnly` bertanda tangan dengan expiry 15 menit, redirect `303` ke URL bersih, invalidasi cookie
setelah regenerasi link, serta response `private, no-store`/`no-referrer`.

### [P1][DONE] Order status workflow

Subtask:

- Dokumentasikan status order.
- Simpan seluruh perubahan status pada history.
- Batasi perubahan status melalui order service.
- Tambahkan catatan cancellation dan refund bila relevan.

Hasil implementasi 2026-07-06:

- Status order resmi tetap `draft`, `confirmed`, `waiting_payment`, `paid`, `in_production`,
  `ready_to_ship`, `shipped`, `completed`, dan `cancelled`.
- Perubahan status admin dilakukan melalui order service dan RPC `public.change_order_status()`.
- Semua perubahan status dicatat pada `order_status_histories` dengan status asal, status tujuan,
  catatan opsional, actor admin, dan timestamp.
- Validasi transisi saat ini membatasi status ke daftar resmi; matrix transisi bisnis yang lebih
  ketat dapat ditambahkan setelah proses operasional final.
- Status `paid`, `ready_to_ship`, dan `shipped` masih dicatat manual oleh admin; Phase 4 payment
  dan Phase 5 shipping belum dibuat.

Status order:

- `draft`
- `confirmed`
- `waiting_payment`
- `paid`
- `in_production`
- `ready_to_ship`
- `shipped`
- `completed`
- `cancelled`

## Phase 4 - Payment Integration Preparation

Tujuan: menyiapkan payment gateway secara aman dan tidak hardcode ke satu provider.

### [P1][TODO] Payment provider interface

Subtask:

- Rancang interface `createInvoice`.
- Rancang interface `verifyWebhook`.
- Rancang interface `getPaymentStatus`.
- Rancang interface refund/cancel bila dibutuhkan.
- Jangan membuat kode hardcoded khusus satu provider di layer order.

### [P1][TODO] Payment transaction table

Subtask:

- Rancang tabel `payment_transactions`.
- Simpan provider, provider reference, amount, currency, dan status.
- Simpan relasi ke order.
- Hindari menyimpan data kartu atau credential sensitif.

### [P1][TODO] Payment webhook event table

Subtask:

- Rancang tabel `payment_webhook_events`.
- Simpan raw event secara aman.
- Simpan signature/header penting untuk audit tanpa secret.
- Tambahkan unique key untuk idempotency.
- Catat waktu proses dan hasil proses.

### [P1][TODO] Xendit preparation

Subtask:

- Siapkan daftar credential dan callback URL.
- Siapkan sandbox testing plan.
- Rancang mapping status Xendit ke status internal.
- Pastikan secret hanya runtime server-side.

### [P1][TODO] Midtrans preparation

Subtask:

- Siapkan daftar credential dan notification URL.
- Siapkan sandbox testing plan.
- Rancang mapping status Midtrans ke status internal.
- Pastikan client key hanya dipakai sesuai dokumentasi provider dan tidak menggantikan validasi server.

### [P0][TODO] Webhook security rules

Subtask:

- Validasi signature/token webhook.
- Buat handler idempotent.
- Jangan percaya amount/status dari client.
- Ambil ulang status dari provider bila event meragukan.
- Log event tanpa membocorkan secret.
- Pastikan perubahan order hanya lewat order service.

Status payment:

- `pending`
- `paid`
- `failed`
- `expired`
- `refunded`
- `cancelled`

## Phase 5 - Shipping & Tracking Preparation

Tujuan: menyiapkan integrasi ongkir dan tracking pengiriman.

### [P2][TODO] Shipping provider interface

Subtask:

- Rancang interface `getRates`.
- Rancang interface `createShipment` bila provider mendukung.
- Rancang interface `getTrackingStatus`.
- Rancang fallback manual bila API provider gagal.

### [P2][TODO] Shipment table

Subtask:

- Rancang tabel `shipments`.
- Simpan courier, service, tracking number, origin, destination, dan status.
- Relasikan shipment ke order.
- Pastikan alamat customer tidak terekspos sembarangan.

### [P2][TODO] Shipment tracking events

Subtask:

- Rancang tabel `shipment_tracking_events`.
- Simpan event timestamp, lokasi, status, dan payload ringkas.
- Hindari update tracking tanpa history.
- Tambahkan idempotency bila event datang dari webhook.

### [P2][TODO] RajaOngkir/Komerce preparation

Subtask:

- Siapkan API key.
- Tentukan origin city/subdistrict.
- Tentukan courier dan service type yang didukung.
- Rancang mapping response ke status internal.

### [P2][TODO] Public tracking page

Subtask:

- Rancang route tracking yang tidak membocorkan data pribadi.
- Tampilkan status pengiriman dan timeline.
- Tambahkan fallback saat provider tracking tidak tersedia.
- Pastikan halaman tidak memuat data admin.

Status shipment:

- `pending`
- `ready_to_ship`
- `picked_up`
- `in_transit`
- `delivered`
- `failed`
- `returned`

## Phase 6 - Public Checkout

Tujuan: customer bisa checkout sendiri setelah lead, order, payment, dan shipping foundation stabil.

Catatan penting: jangan mengerjakan checkout publik sebelum Phase 2, Phase 3, dan Phase 4 siap.

### [P2][DEFERRED] Cart module

Subtask:

- Rancang cart untuk produk custom dan produk katalog.
- Tentukan apakah cart disimpan client-side atau server-side.
- Rancang validasi harga saat checkout.
- Pastikan cart tidak menjadi sumber kebenaran untuk total order.

### [P2][DEFERRED] Checkout page

Subtask:

- Rancang flow alamat, metode pengiriman, pembayaran, dan review.
- Validasi seluruh input server-side.
- Tambahkan rate limit dan fraud prevention dasar.
- Pastikan checkout membuat order melalui service resmi.

### [P2][DEFERRED] Customer account

Subtask:

- Evaluasi kebutuhan akun customer.
- Rancang auth dan privacy policy.
- Rancang order history dan profile.
- Hindari menambah kompleksitas auth sebelum dibutuhkan.

### [P2][DEFERRED] Order history

Subtask:

- Rancang daftar order customer.
- Batasi akses berdasarkan customer identity.
- Tampilkan status ringkas dan tracking.
- Pastikan data order lama memakai snapshot.

## Phase 7 - Backend/Frontend Separation Readiness

Tujuan: menyiapkan kemungkinan pemisahan backend dan frontend jika traffic atau kompleksitas meningkat.

Catatan: saat ini jangan langsung memisahkan backend/frontend. Gunakan modular monolith terlebih dahulu sampai kebutuhan scaling benar-benar jelas.

### [P3][DEFERRED] Evaluate backend separation

Subtask:

- Identifikasi API yang terlalu kompleks untuk Next.js Route Handler.
- Evaluasi kebutuhan worker/background job.
- Evaluasi kebutuhan API publik/partner.
- Evaluasi opsi backend: Go, Node.js, NestJS, Laravel, atau Supabase Edge Function.
- Hitung biaya operasional dan deployment tambahan.

### [P3][DEFERRED] API contract documentation

Subtask:

- Dokumentasikan endpoint, schema request/response, auth, dan error.
- Tentukan versioning API.
- Tentukan compatibility policy.
- Tambahkan contract test bila API dipakai banyak client.

### [P3][DEFERRED] Background worker/job queue

Subtask:

- Evaluasi kebutuhan job untuk payment reconciliation, shipping sync, email, dan cleanup.
- Tentukan queue provider.
- Tentukan retry, dead-letter, dan observability.
- Pastikan job idempotent.

### [P3][DEFERRED] Separate admin/public deployment

Subtask:

- Evaluasi apakah admin perlu domain/deployment terpisah.
- Pisahkan bundle admin dari publik bila berdampak signifikan.
- Evaluasi auth, cookie domain, dan CSP.
- Pastikan deployment tetap rollback-friendly.

## Before Building Any Commerce Feature

Agent/developer wajib menyiapkan:

- Scope task yang jelas.
- Dokumen terkait sudah dibaca.
- Data model sudah dirancang.
- Migration plan tersedia.
- RLS dan permission sudah dipikirkan.
- Status workflow terdokumentasi.
- Provider integration tidak hardcoded ke UI.
- Test plan minimal tersedia.
- Performance impact diperkirakan.
- Rollback atau fallback behavior jelas.
