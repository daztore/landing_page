# Roadmap

Dokumen ini menjadi acuan utama pengembangan `daztore.id` dari landing page + katalog + admin CMS menuju platform commerce/order online secara bertahap.

Roadmap ini tidak memberi izin untuk langsung membangun payment, order, shipping, cart, atau checkout publik. Fitur tersebut hanya boleh dibuat saat ada prompt/task spesifik, dependency dasar sudah siap, dan risiko keamanan/performa sudah dinilai.

## Current Baseline

- Framework: Next.js App Router.
- Package manager operasional saat ini: npm, karena `package-lock.json`, Dockerfile, dan CI memakai `npm ci`.
- Database/CMS: Supabase untuk konten publik, admin CMS, feedback, Storage, Auth, dan RLS.
- Route publik aktif: `/`, `/katalog`, `/feedback/[id]`.
- Route admin aktif: `/admin-daz/**`.
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

### [P0][IN_PROGRESS] Decide official package manager

Subtask:

- Konfirmasi owner project bahwa npm adalah package manager resmi.
- Pertahankan `package-lock.json` sebagai lockfile utama jika npm disetujui.
- Jangan hapus `pnpm-lock.yaml` sebelum ada approval eksplisit.
- Tambahkan `packageManager` di `package.json` setelah keputusan final.
- Samakan local, CI, Docker, dan dokumentasi.

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
- Gap sebelum commerce: rate limit feedback masih in-memory per proses dan perlu store terpusat bila deployment multi-instance, upload belum validasi magic byte/content scanning, CSP/HSTS belum ditentukan, dan `npm audit` masih melaporkan moderate advisory pada PostCSS internal Next.js tanpa patch upgrade yang kompatibel.

### [P0][TODO] Performance baseline

Subtask:

- Catat baseline Lighthouse/Core Web Vitals untuk `/`.
- Catat baseline Lighthouse/Core Web Vitals untuk `/katalog`.
- Catat ukuran bundle publik dan route admin.
- Catat performa image hero, galeri, dan katalog.
- Pastikan data admin tidak masuk bundle halaman publik.
- Buat checklist regresi performa untuk fitur besar.

### [P0][TODO] Agent/Codex workflow enforcement

Subtask:

- Wajibkan agent membaca roadmap dan rules sebelum coding.
- Wajibkan agent menulis scope dan asumsi untuk task ambigu.
- Wajibkan perubahan dokumentasi jika env, API, database, atau flow bisnis berubah.
- Catat issue unrelated, jangan langsung diperbaiki kecuali security-critical.
- Gunakan format response akhir yang konsisten.

## Phase 1 - Modular Foundation

Tujuan: menyiapkan struktur modular tanpa merusak fitur lama. Concern utama yang harus dipisah: marketing, catalog, admin, feedback, leads, orders, payments, shipping, dan customers.

### [P0][TODO] Define modular architecture

Subtask:

- Tentukan kapan folder `features/` mulai dibuat.
- Tentukan module boundary untuk catalog, feedback, leads, orders, payments, shipping, dan customers.
- Tentukan aturan import antar modul.
- Tentukan service/query layer untuk akses data lintas modul.
- Pastikan `app/` hanya menjadi orchestration dan presentation layer.

### [P1][TODO] Prepare product detail structure

Subtask:

- Rancang route `/produk/[slug]`.
- Rancang kontrak data produk detail.
- Rancang slug unik dan fallback 404.
- Pastikan katalog lama `/katalog` tetap berjalan.
- Rancang metadata SEO dan image policy.

### [P1][TODO] Prepare lead/inquiry module

Subtask:

- Rancang tabel `leads`.
- Rancang tabel `lead_messages`.
- Rancang status lead.
- Rancang flow admin lead management.
- Rancang anti-spam/rate limit untuk form publik.
- Rancang notifikasi awal tanpa menyimpan secret di client.

### [P1][TODO] Prepare admin module boundary

Subtask:

- Pertahankan route admin di `/admin-daz/**`.
- Pisahkan resource admin per domain.
- Pastikan CRUD admin tetap lewat RLS dan auth server-side.
- Hindari import data admin ke halaman publik.
- Tambahkan audit trail untuk operasi sensitif pada fase berikutnya.

## Phase 2 - Lead & Inquiry Management

Tujuan bisnis: menangkap calon customer sebelum masuk order/payment.

### [P1][TODO] Product detail page

Subtask:

- Buat halaman detail produk hanya setelah kontrak produk stabil.
- Tampilkan informasi harga sebagai estimasi, bukan invoice.
- Tambahkan CTA inquiry/konsultasi.
- Pastikan halaman tetap cepat dan cache-friendly.
- Pastikan fallback produk lama tidak rusak.

### [P1][TODO] Inquiry form

Subtask:

- Definisikan field minimum: nama, WhatsApp, produk/minat, catatan, dan consent.
- Validasi input server-side.
- Tambahkan rate limit dan spam protection.
- Jangan simpan data sensitif yang tidak dibutuhkan.
- Simpan consent/privacy acknowledgement bila diwajibkan.

### [P1][TODO] Admin lead management

Subtask:

- Tambahkan list lead dengan pagination.
- Tambahkan detail lead.
- Tambahkan filter status.
- Tambahkan catatan follow-up admin.
- Batasi akses hanya untuk admin aktif.

### [P1][TODO] Lead status workflow

Subtask:

- Dokumentasikan status lead.
- Simpan perubahan status dengan actor dan timestamp.
- Pastikan status tidak berubah dari banyak tempat tanpa service yang jelas.
- Tambahkan validasi transisi bila flow bisnis sudah final.

Status lead:

- `new`
- `contacted`
- `quoted`
- `converted`
- `cancelled`

## Phase 3 - Manual Order Management

Tujuan: admin bisa membuat order dari hasil konsultasi. Ini menjadi fondasi sebelum payment online.

### [P1][TODO] Order data model

Subtask:

- Rancang tabel `orders`.
- Rancang tabel `order_items`.
- Rancang tabel `order_status_histories`.
- Simpan snapshot produk pada order item.
- Rancang nomor order yang stabil dan mudah dilacak.
- Rancang constraint untuk status, total, dan customer reference.

### [P1][TODO] Admin create order

Subtask:

- Buat flow admin membuat order dari lead atau customer.
- Tambahkan item manual dan item dari katalog.
- Simpan snapshot nama, harga, opsi custom, dan catatan.
- Validasi total server-side.
- Pastikan order draft tidak dianggap transaksi final.

### [P1][TODO] Public order detail page

Subtask:

- Rancang URL publik berbasis order number dan token aman bila diperlukan.
- Tampilkan status tanpa membocorkan data sensitif.
- Batasi data customer yang terlihat.
- Tambahkan metadata noindex jika halaman tidak untuk SEO.

### [P1][TODO] Order status workflow

Subtask:

- Dokumentasikan status order.
- Simpan seluruh perubahan status pada history.
- Batasi perubahan status melalui order service.
- Tambahkan catatan cancellation dan refund bila relevan.

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
