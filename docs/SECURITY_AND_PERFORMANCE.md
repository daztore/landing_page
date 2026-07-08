# Security and Performance

Dokumen ini berisi checklist keamanan dan performa yang wajib dijaga saat project berkembang menuju commerce/order online.

## Security Principles

- Secret tidak boleh masuk repo.
- `.env.local` tidak boleh dipush.
- `.env` tidak boleh masuk Docker image.
- Service-role Supabase hanya server-side.
- Jangan percaya input dari client.
- Semua route publik yang menerima data harus divalidasi server-side.
- Semua integrasi eksternal harus melalui provider/service layer.
- Semua flow transaksi harus punya status, history, dan audit trail.

## Security Checklist

### Secret and Environment

- [ ] Tidak ada secret hardcoded di source code.
- [ ] Tidak ada secret asli di dokumentasi.
- [ ] Tidak ada service-role key dengan prefix `NEXT_PUBLIC_*`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai server-side.
- [ ] Build argument Docker hanya berisi env public yang memang aman.
- [ ] Runtime secret diinject dari environment server/secret store.
- [ ] `.dockerignore` tetap mengecualikan `.env*`.

### Supabase and RLS

- [ ] RLS aktif untuk tabel sensitif.
- [ ] Public read policy hanya membuka data yang aman dibaca publik.
- [ ] Public write policy tidak dibuat tanpa validasi dan rate limit yang jelas.
- [ ] Admin write dibatasi ke authenticated user yang masuk allowlist.
- [ ] Service-role query hanya digunakan di route/server code yang memang membutuhkan.
- [ ] Migration baru menyertakan policy, index, dan constraint yang relevan.
- [ ] Storage bucket public/private dipilih sesuai sensitivitas file.

### Admin

- [ ] Admin route harus protected.
- [ ] Admin session divalidasi server-side.
- [ ] Allowlist admin dapat dinonaktifkan tanpa menghapus user.
- [ ] Operasi delete/destructive perlu konfirmasi.
- [ ] Operasi sensitif jangka panjang perlu audit log.
- [ ] Admin data tidak boleh difetch oleh halaman publik.

### Public Endpoint

- [ ] Validasi method HTTP.
- [ ] Validasi path param dan body.
- [ ] Batasi ukuran request.
- [ ] Return error publik yang aman.
- [ ] Jangan expose stack trace.
- [ ] Siapkan rate limit untuk endpoint seperti feedback, inquiry, checkout, payment callback, dan tracking lookup.
- [ ] Tambahkan CSRF consideration untuk form/session-based endpoint bila relevan.

### Webhook

- [ ] API route yang menerima webhook harus validasi signature/token.
- [ ] Webhook harus idempotent.
- [ ] Simpan raw event secara aman untuk audit.
- [ ] Simpan provider event ID atau idempotency key.
- [ ] Jangan percaya status/amount dari client.
- [ ] Ambil ulang status ke provider bila event meragukan.
- [ ] Jangan log secret/header sensitif.
- [ ] Update order/payment hanya melalui service resmi.

### Upload File

- [ ] Validasi MIME type.
- [ ] Validasi ukuran file.
- [ ] Validasi extension.
- [ ] Validasi path/object key.
- [ ] Batasi jumlah file.
- [ ] Hindari nama file mentah dari user sebagai path permanen.
- [ ] Gunakan bucket private untuk file sensitif.
- [ ] Jangan menyimpan file executable.
- [ ] Bersihkan file yang sudah terupload jika transaksi database gagal.

### Data Privacy

- [ ] Simpan data customer minimal sesuai kebutuhan bisnis.
- [ ] Jangan tampilkan data pribadi di halaman publik tanpa auth/token aman.
- [ ] Buat privacy policy sebelum menyimpan lead/order/customer secara penuh.
- [ ] Logging harus aman tanpa data sensitif berlebihan.
- [ ] Data export/delete policy perlu ditentukan sebelum customer account dibuat.

## Phase 0 Security Audit 2026-07-03

Audit ini hanya memeriksa baseline keamanan sebelum commerce work. Tidak ada endpoint order,
payment, shipping, cart, checkout, atau customer account yang dibuat.

| Area | Status | Catatan |
| --- | --- | --- |
| Env boundary | OK | `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca server-side melalui `lib/supabase/service-role.ts` dan tidak dipakai oleh Client Component. |
| Docker/CI secret flow | OK | Build image hanya menerima `NEXT_PUBLIC_*`; service-role hanya runtime env server/Compose production. |
| RLS public/admin/feedback | OK | Migration mengaktifkan RLS, membatasi public read/write, menutup direct public feedback insert/read, dan membatasi admin via `admin_users`. |
| Admin protection | OK | Route admin memakai Supabase Auth cookie session, proxy refresh, dan allowlist active admin. |
| Feedback public route | OK untuk baseline saat ini | Validasi UUID/body/upload, error publik aman, dan rate limit in-memory per IP sudah tersedia. |
| Upload validation | Perlu tindak lanjut | Validasi MIME, ukuran, jumlah file, extension/path, dan cleanup gagal sudah ada; magic-byte/content sniffing dan malware scan belum tersedia. |
| Error handling | OK | Route publik mengembalikan error generik dan log teknis server-side. |
| Security headers | Perlu tindak lanjut | Nginx sudah mengirim frame policy, nosniff, referrer policy, permissions policy; CSP dan HSTS belum ditentukan. |
| Dependency advisory | OK | Cleanup 2026-07-07 memperbarui dependency rentan dan membersihkan advisory PostCSS internal Next.js melalui npm override yang tervalidasi. |
| CodeQL | OK | Workflow CodeQL JavaScript/TypeScript dengan `security-extended` aktif untuk push, PR, dan jadwal mingguan. |

## Dependency Security Cleanup 2026-07-07

Cleanup ini khusus membersihkan Dependabot/npm advisory tanpa mengubah logic aplikasi.

Hasil:

- `pnpm-lock.yaml` dihapus karena project resmi npm-only dan lockfile tersebut tidak dipakai
  CI/Docker/deployment aktif.
- `next` dan `eslint-config-next` diperbarui ke `16.2.10`.
- `react` dan `react-dom` diperbarui ke `19.2.7`.
- `postcss` resolved ke `8.5.16`; nested `next/node_modules/postcss` tidak lagi muncul.
- `lodash` resolved ke `4.18.1`.
- `package.json` menambahkan npm override scoped untuk `next -> postcss` dan override lodash
  agar resolusi transitive tetap berada pada versi patched.

Validasi yang dijalankan pada cleanup:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm ls next react react-dom lodash postcss eslint-config-next --all
npm audit --audit-level=low
npm audit --audit-level=moderate
```

Catatan Docker:

- `docker build` dengan dummy `NEXT_PUBLIC_*` env sudah dicoba, tetapi tidak dapat dijalankan di
  mesin lokal karena Docker Desktop/Linux engine tidak aktif.

Keputusan sebelum commerce:

- Jangan menambah endpoint publik write baru sebelum rate limit/abuse prevention dipilih.
- Rate limit feedback saat ini masih in-memory per proses; gunakan store terpusat bila deployment menjadi multi-instance atau traffic meningkat.
- Jangan membuka public write policy Supabase untuk lead/order/payment; validasi tetap lewat server route/service layer.
- Payment/shipping webhook wajib punya signature validation, idempotency, dan logging tanpa secret sebelum implementasi.
- Upload file tambahan harus menambahkan validasi konten yang lebih kuat jika file berasal dari publik.
- CSP/HSTS perlu diputuskan bersama konfigurasi TLS/CDN sebelum go-live commerce.

## Commerce Security Gate

Sebelum payment/order/shipping/checkout dibuat:

- [ ] Data model sudah direview.
- [ ] Migration dan RLS sudah siap.
- [ ] Status workflow terdokumentasi.
- [ ] History/audit trail tersedia.
- [ ] Webhook security design tersedia.
- [ ] Env provider terdokumentasi tanpa value asli.
- [ ] Rollback plan jelas.
- [ ] Test plan minimal tersedia.
- [ ] Rate limit dan abuse scenario dipikirkan.

## Phase 2 Lead Security 2026-07-06

Implementasi lead/inquiry menambahkan public write endpoint `/api/leads` dan tabel privat
`leads`/`lead_messages`.

Guardrail yang sudah diterapkan:

- Public direct insert/read Supabase untuk `leads` dan `lead_messages` tidak dibuka.
- Route Handler `/api/leads` memvalidasi `Content-Type`, `Content-Length`, JSON body, nama,
  WhatsApp, email, product slug, minat produk, event date, budget range, panjang catatan, consent,
  honeypot, dan time-to-submit ringan.
- Rate limit in-memory diterapkan per IP dan nomor WhatsApp.
- Error publik dibuat generik dan log server tidak mencetak payload lengkap customer.
- Public submit memakai service-role server-only melalui `lib/supabase/service-role.ts` karena RLS
  public write ditutup.
- Admin read/write lead memakai Supabase Auth cookie session, allowlist `admin_users`, dan RLS
  `public.is_active_admin()`.
- Perubahan status lead dicatat via RPC `public.change_lead_status()` ke `lead_messages` dengan
  actor dan timestamp.

Risiko tersisa:

- Rate limit lead masih in-memory per proses; deployment multi-instance membutuhkan store
  terpusat.
- Privacy/legal page masih placeholder, sementara lead menyimpan kontak customer dan consent
  snapshot.
- Belum ada CAPTCHA/provider anti-spam eksternal; baseline saat ini sengaja tanpa dependency baru.

## Phase 3 Order Security 2026-07-06

Implementasi manual order menambahkan tabel privat `orders`, `order_items`, dan
`order_status_histories`, route admin order, serta route publik tokenized `/order/[orderNumber]`.

Guardrail yang sudah diterapkan:

- Public direct read/write Supabase untuk tabel order tidak dibuka.
- Admin read/write order memakai Supabase Auth cookie session, allowlist `admin_users`, dan RLS
  `public.is_active_admin()`.
- Order baru selalu dibuat sebagai `draft` dan total dihitung ulang server-side dari item serta
  diskon.
- Item katalog divalidasi ulang server-side dan menyimpan snapshot produk agar perubahan katalog
  tidak mengubah order lama.
- Perubahan status hanya lewat order service dan RPC `public.change_order_status()`, lalu dicatat
  ke `order_status_histories`.
- Public order detail memerlukan order number dan token; database hanya menyimpan hash token,
  bukan raw token.
- Halaman publik order membatasi data customer dan tidak menampilkan WhatsApp, email, catatan
  admin, atau token hint.
- Route `/order/[orderNumber]` memakai metadata `noindex,nofollow`, dan `/order` ditambahkan ke
  `robots.txt` disallow.

Risiko tersisa:

- Status `paid`, `ready_to_ship`, dan `shipped` masih input manual admin sampai Phase 4/5.
- Token publik harus diperlakukan seperti link rahasia; jika bocor, admin perlu membuat ulang link
  dari detail order.
- Belum ada audit log umum lintas resource selain history status order.
- Belum ada payment transaction/webhook security karena Phase 4 belum dibuat.

## Performance Principles

- Landing page harus tetap cepat.
- Katalog harus tetap bisa discan dan dicari tanpa blocking besar.
- Admin boleh lebih kaya fitur, tetapi tidak boleh menambah bundle halaman publik.
- Data fetching harus terkontrol dan cache-aware.
- Fitur commerce besar harus punya baseline sebelum dan sesudah perubahan.

## Image Optimizer Note 2026-07-08

Next Image Optimizer tetap digunakan untuk gambar publik Supabase Storage. Konfigurasi image
menjaga `remotePatterns` untuk path public Storage dan menambahkan fallback `images.domains`
khusus hostname Supabase dari `NEXT_PUBLIC_SUPABASE_URL` setelah production debug menemukan
response `400 Bad Request` dengan pesan `"url" parameter is not allowed`. Docker runtime wajib
menyalin `next.config.mjs`; tanpa file ini, `next start` di container memakai default image config
dan menolak URL Supabase walaupun `.next/required-server-files.json` memuat allowlist yang benar.

Guardrail:

- tidak memakai `images.unoptimized`;
- tidak memakai wildcard hostname;
- tidak membuat proxy URL bebas;
- `maximumRedirects` diset `0`;
- Docker runner membawa `next.config.mjs` agar konfigurasi image optimizer aktif saat runtime;
- bucket private tetap tidak dibuka lewat route publik.

Catatan: Next.js 16.2.10 memberi warning bahwa `images.domains` deprecated. Fallback ini harus
dievaluasi ulang setelah production image optimizer stabil hanya dengan `remotePatterns`.

## Phase 0 Performance Baseline 2026-07-03

Baseline detail tersedia di `docs/PERFORMANCE_BASELINE.md`.

Ringkasan lab measurement lokal:

| Route | Mode | Performance | LCP | TBT | CLS | Transfer |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` | Mobile | 90 | 3.32s | 39ms | 0.000 | 493.7 KB |
| `/katalog` | Mobile | 92 | 3.39s | 43ms | 0.000 | 454.1 KB |
| `/` | Desktop | 100 | 0.69s | 0ms | 0.000 | 535.4 KB |
| `/katalog` | Desktop | 100 | 0.63s | 0ms | 0.000 | 498.8 KB |
| `/admin-daz/login` | Mobile | 98 | 2.27s | 75ms | 0.000 | 345.1 KB |

Guardrail sebelum fitur besar:

- pertahankan CLS route publik di bawah `0.05`;
- pertahankan mobile TBT route publik di bawah `100ms`;
- investigasi jika public script transfer naik lebih dari sekitar 15%;
- ukur ulang `/` dan `/katalog` setelah menambah Client Component, dependency, atau asset besar;
- ukur `/admin-daz/login` bila perubahan menyentuh shell/auth admin.

## Performance Checklist

### Rendering and Bundle

- [ ] Hindari Client Component jika tidak perlu.
- [ ] Gunakan Server Component untuk data fetching bila cocok.
- [ ] Jangan load bundle admin di halaman publik.
- [ ] Pisahkan komponen berat.
- [ ] Hindari import library besar di route publik.
- [ ] Hindari global provider yang tidak dibutuhkan semua route.
- [ ] Periksa bundle setelah menambah dependency.

### Data Fetching

- [ ] Jangan fetch data admin di halaman publik.
- [ ] Query Supabase harus memilih kolom yang diperlukan.
- [ ] Hindari query Supabase berulang di banyak component.
- [ ] Hindari N+1 query.
- [ ] Gunakan cache/revalidate untuk data publik yang jarang berubah.
- [ ] Tambahkan pagination untuk katalog, feedback, order, dan admin list.
- [ ] Tambahkan search/filter server-side jika dataset membesar.

### Image and Asset

- [ ] Optimalkan image.
- [ ] Gunakan ukuran image sesuai kebutuhan layar.
- [ ] Gunakan format WebP/AVIF bila cocok.
- [ ] Gunakan Next Image atau strategi image yang setara.
- [ ] Pastikan remote image host terdaftar aman.
- [ ] Jangan memakai gambar besar untuk thumbnail.
- [ ] Audit ukuran hero, gallery, dan product image secara berkala.

### UX Responsiveness

- [ ] Jangan menambah animasi berat tanpa alasan.
- [ ] Respect `prefers-reduced-motion`.
- [ ] Hindari layout shift.
- [ ] Pastikan loading state tidak menutup interaksi terlalu lama.
- [ ] Pastikan form publik memberi feedback jelas.
- [ ] Pastikan halaman admin list tetap usable saat data banyak.

## Performance Gate

Sebelum merge fitur besar:

```bash
npm run lint
npm run typecheck
npm run build
```

Checklist manual:

- [ ] Cek halaman utama `/`.
- [ ] Cek katalog `/katalog`.
- [ ] Cek feedback route bila task menyentuh feedback.
- [ ] Cek admin login/admin page bila task menyentuh admin.
- [ ] Cek tidak ada secret bocor di bundle client.
- [ ] Cek console browser untuk error baru.
- [ ] Cek network request publik tidak memuat data admin/sensitif.
- [ ] Cek Lighthouse/Core Web Vitals sebelum fitur commerce besar.
- [ ] Catat performance baseline sebelum refactor besar.

## Current Baseline To Preserve

- Route `/`, `/katalog`, dan `/produk/[slug]` memakai data Supabase dengan fallback lokal.
- Public content dapat memakai `revalidate`.
- Admin berada di route `/admin-daz/**`.
- Public inquiry submit memakai Route Handler server-side `/api/leads`.
- Public order detail memakai token lookup server-side dan tidak membuka tabel order ke public RLS.
- Feedback submit memakai Route Handler server-side.
- Service-role client berada di file `server-only`.
- Docker production harus memakai image siap jalan, bukan build di server.

## Logging Rules

- Log error teknis boleh untuk server diagnosis.
- Jangan log secret, token, credential, password, atau raw private key.
- Jangan log full payload customer bila tidak diperlukan.
- Untuk webhook, simpan raw event di tabel audit yang aksesnya dibatasi.
- Untuk user publik, return pesan error generik yang bisa ditindaklanjuti.

## Review Frequency

Lakukan review security/performance:

- sebelum fitur commerce besar;
- setelah menambah dependency besar;
- setelah migration database;
- setelah mengubah RLS/auth;
- setelah mengubah Docker/CI/CD;
- sebelum go-live production;
- setelah dependency advisory penting muncul.
