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

## Performance Principles

- Landing page harus tetap cepat.
- Katalog harus tetap bisa discan dan dicari tanpa blocking besar.
- Admin boleh lebih kaya fitur, tetapi tidak boleh menambah bundle halaman publik.
- Data fetching harus terkontrol dan cache-aware.
- Fitur commerce besar harus punya baseline sebelum dan sesudah perubahan.

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

- Route `/` dan `/katalog` memakai data Supabase dengan fallback lokal.
- Public content dapat memakai `revalidate`.
- Admin berada di route `/admin-daz/**`.
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
