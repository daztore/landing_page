# Supabase Migration

## Tujuan

Project membaca konten landing page, katalog, admin CMS, dan feedback dari Supabase. Data lokal tetap dipertahankan sebagai fallback untuk konten publik sampai migration production diverifikasi.

SDK yang digunakan:

```text
@supabase/supabase-js 2.108.0
```

Query publik konten/katalog memakai publishable key dan dibatasi Row Level Security.
`SUPABASE_SERVICE_ROLE_KEY` digunakan server-side untuk flow feedback, lead publik, dan public
order lookup karena direct public read/insert pada tabel privat ditutup.

## File Implementasi

| File | Fungsi |
| --- | --- |
| `supabase/migrations/001_create_landing_page_tables.sql` | Membuat tabel, index, trigger `updated_at`, grant, dan RLS policy. |
| `supabase/migrations/002_create_storage_buckets.sql` | Membuat bucket gambar publik dan policy read-only. |
| `supabase/migrations/003_create_admin_access.sql` | Membuat allowlist admin serta policy CRUD database dan Storage. |
| `supabase/migrations/004_create_feedback_feature.sql` | Membuat tabel feedback, trigger submission, policy awal, dan bucket foto feedback. |
| `supabase/migrations/005_harden_feedback_privacy_and_catalog_cleanup.sql` | Menutup akses public langsung ke feedback dan menjadikan bucket foto pelanggan private. |
| `supabase/migrations/006_create_leads_feature.sql` | Membuat tabel leads, lead messages, RLS admin-only, dan RPC status workflow. |
| `supabase/migrations/007_create_orders_feature.sql` | Membuat tabel orders, order items, order status histories, token publik hash, dan RPC status workflow. |
| `supabase/seed.sql` | Mengisi data lokal saat ini secara idempotent. |
| `lib/supabase/client.ts` | Membuat Supabase client dari environment variable. |
| `lib/supabase/service-role.ts` | Membuat Supabase service-role client server-only untuk feedback, lead publik, dan public order lookup. |
| `lib/supabase/storage.ts` | Mengubah object path Storage menjadi public URL dengan fallback aman. |
| `lib/data/landing-page.ts` | Data access layer dan fallback handling. |
| `lib/data/fallback.ts` | Salinan lokal yang dipakai bila env/query/data belum tersedia. |
| `lib/data/types.ts` | Kontrak data antara server dan komponen. |
| `lib/feedback/*` | Kontrak, data access, validasi, dan upload feedback. |
| `features/leads/*` | Kontrak, validasi, service, form inquiry, query admin, dan status workflow lead. |
| `features/orders/*` | Kontrak, validasi, service, form admin, query admin/public, token publik, dan status workflow order. |
| `app/api/leads/route.ts` | Route Handler public untuk submit inquiry lead. |
| `app/order/[orderNumber]/page.tsx` | Halaman publik order berbasis nomor order dan token. |
| `app/feedback/[id]/*` | Halaman dan Route Handler feedback publik. |

## Tabel

| Tabel | Data |
| --- | --- |
| `site_settings` | Kontak, brand, social link, dan URL legal. |
| `landing_sections` | Heading dan konfigurasi section hero, story, process, gallery, CTA, katalog, dan paket. |
| `landing_items` | Statistik, nilai brand, langkah proses, fitur, dan trust points. |
| `navigation_items` | Navigasi header, CTA header, mobile, dan footer. |
| `gallery_items` | Gambar, alt text, label, dan layout galeri. |
| `testimonials` | Testimonial grid aktif dan carousel alternatif. |
| `faqs` | Pertanyaan dan jawaban. |
| `product_categories` | Kategori katalog. |
| `products` | Produk, harga, gambar, badge, dan availability. |
| `package_tiers` | Paket Silver, Gold, dan Exclusive yang saat ini belum dirender. |
| `admin_users` | Allowlist admin aktif untuk panel `/admin-daz`. |
| `leads` | Inquiry/konsultasi awal sebelum order manual. |
| `lead_messages` | Riwayat pesan, catatan follow-up, dan perubahan status lead. |
| `orders` | Order manual, nomor order, customer, status, total, dan token publik hash. |
| `order_items` | Item order dengan snapshot produk, harga, opsi custom, dan catatan. |
| `order_status_histories` | Riwayat perubahan status order beserta actor, timestamp, dan catatan. |
| `feedback_requests` | Request feedback pelanggan yang dibuat admin. |
| `feedback_submissions` | Submission rating, kritik/saran, testimoni, rekomendasi, dan foto pelanggan. |

## Keamanan RLS

Migration:

- mengaktifkan RLS pada semua tabel;
- memberi `SELECT` kepada `anon` dan `authenticated`;
- hanya memperbolehkan row dengan `is_active = true`;
- membatasi `site_settings` ke row `is_public = true`;
- tidak membuat public insert/update/delete policy;
- memberi akses penuh hanya kepada role internal `service_role`.

Publishable key aman berada di frontend, tetapi tetap tidak memberi hak tulis karena tidak ada write policy.

Storage memakai dua bucket publik:

| Bucket | Konten |
| --- | --- |
| `landing_page` | Hero, background hero mobile, story, dan galeri landing page. |
| `catalogs` | Seluruh gambar produk pada `/katalog`. |

Migration Storage awal membuat policy `SELECT` untuk `anon` dan `authenticated`.
Migration admin menambahkan policy `INSERT`, `UPDATE`, dan `DELETE` khusus user
`authenticated` yang lolos `public.is_active_admin()`. Anonymous tetap tidak dapat menulis.

Setelah migration `005`, tabel `feedback_requests` dan `feedback_submissions` tidak lagi dibaca/ditulis langsung oleh public `anon`. Route feedback publik memakai service-role server-side untuk membaca request, memvalidasi status, menyimpan submission, dan membersihkan upload bila insert gagal.

Migration `006` membuat `leads` dan `lead_messages` dengan RLS aktif. Public `anon` tidak diberi
hak direct insert/read/update/delete. Submit publik hanya melalui `/api/leads`, yang memakai
service-role server-only setelah validasi dan rate limit. Admin read/write dibatasi oleh
`public.is_active_admin()`. RPC `public.change_lead_status()` mencatat status change dan actor
admin dalam satu transaksi database.

Migration `007` membuat `orders`, `order_items`, dan `order_status_histories` dengan RLS aktif.
Public `anon` tidak diberi hak direct read/insert/update/delete. Admin read/write dibatasi oleh
`public.is_active_admin()`. Public order detail memakai service-role server-only untuk memverifikasi
order number dan hash token. RPC `public.change_order_status()` mencatat status change dan actor
admin dalam satu transaksi database.

Storage tambahan:

| Bucket | Konten | Akses |
| --- | --- | --- |
| `feedback_customer_photos` | Foto pelanggan dari form feedback | Private; admin dapat membaca, Route Handler server-side mengupload. |

## Model Admin

Admin harus memenuhi dua syarat:

1. memiliki user email/password aktif di Supabase Auth;
2. UUID user terdaftar pada `public.admin_users` dengan `is_active = true`.

Route admin memakai session cookie Supabase SSR. Pemeriksaan route dilakukan di server,
sedangkan RLS tetap menjadi batas izin final untuk CRUD database dan Storage.

Tidak ada public registration. Admin browser tidak memakai service-role key; service-role hanya
untuk route/server code feedback, lead publik, dan public order lookup.

## Setup Manual

1. Buka dashboard project Supabase.
2. Masuk ke **SQL Editor**.
3. Jalankan seluruh isi:

```text
supabase/migrations/001_create_landing_page_tables.sql
```

4. Jalankan migration Storage:

```text
supabase/migrations/002_create_storage_buckets.sql
```

5. Jalankan migration admin:

```text
supabase/migrations/003_create_admin_access.sql
```

6. Jalankan migration feedback:

```text
supabase/migrations/004_create_feedback_feature.sql
```

7. Jalankan migration hardening feedback:

```text
supabase/migrations/005_harden_feedback_privacy_and_catalog_cleanup.sql
```

8. Jalankan migration lead/inquiry:

```text
supabase/migrations/006_create_leads_feature.sql
```

9. Jalankan migration manual order:

```text
supabase/migrations/007_create_orders_feature.sql
```

10. Upload file gambar sesuai daftar object path di bawah.

11. Setelah migration dan upload berhasil, jalankan:

```text
supabase/seed.sql
```

12. Buat `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_service_role_key
```

13. Restart development server:

```bash
npm run dev
```

14. Buat admin pertama menggunakan langkah berikut.
15. Verifikasi `/`, `/katalog`, `/produk/mahar-1`, `/admin-daz/login`, `/admin-daz/leads`,
    `/admin-daz/orders`, dan flow feedback/order bila data tersedia.

Migration dan seed tidak dijalankan otomatis oleh aplikasi.

## Membuat Admin Pertama

1. Buka **Authentication > Users** pada Supabase Dashboard.
2. Buat user email/password. Jangan membuka public registration pada aplikasi.
3. Salin UUID user atau jalankan SQL berikut dengan email yang benar:

```sql
insert into public.admin_users (id, email)
select id, email
from auth.users
where email = 'admin@example.com'
on conflict (id) do update set
  email = excluded.email,
  is_active = true;
```

4. Login melalui `/admin-daz/login`.

Menonaktifkan akses tanpa menghapus user:

```sql
update public.admin_users
set is_active = false
where email = 'admin@example.com';
```

SQL tersebut dijalankan melalui SQL Editor oleh owner project. Jangan menambahkan secret
atau service-role key ke Client Component.

## Upload Gambar Storage

Migration tidak meng-upload file. Upload manual berikut diperlukan agar seluruh object path
pada seed tersedia.

Bucket `landing_page`:

| Object path | Sumber lokal |
| --- | --- |
| `hero-mahar.webp` | `public/hero-mahar.webp` |
| `bouquet-bg.jpg` | `public/bouquet-bg.jpg` |
| `story-hands.jpg` | `public/story-hands.jpg` |
| `gallery/gallery-1.jpg` | `public/gallery-1.jpg` |
| `gallery/gallery-2.jpg` | `public/gallery-2.jpg` |
| `gallery/gallery-3.jpg` | `public/gallery-3.jpg` |
| `gallery/gallery-4.jpg` | `public/gallery-4.jpg` |
| `gallery/gallery-5.jpg` | `public/gallery-5.jpg` |
| `gallery/gallery-6.jpg` | `public/gallery-6.jpg` |

Bucket `catalogs`:

| Object path | Sumber lokal |
| --- | --- |
| `mahar/gallery-1.jpg` | `public/gallery-1.jpg` |
| `mahar/gallery-4.jpg` | `public/gallery-4.jpg` |
| `seserahan/gallery-3.jpg` | `public/gallery-3.jpg` |
| `seserahan/gallery-2.jpg` | `public/gallery-2.jpg` |
| `bouquet/gallery-2.jpg` | `public/gallery-2.jpg` |
| `bouquet/gallery-5.jpg` | `public/gallery-5.jpg` |
| `hampers/gallery-1.jpg` | `public/gallery-1.jpg` |
| `hampers/gallery-6.jpg` | `public/gallery-6.jpg` |
| `gift-box/hero-mahar.jpg` | `public/hero-mahar.jpg` |
| `custom/story-hands.jpg` | `public/story-hands.jpg` |

Database menyimpan object path pada kolom `image_url`. Jangan menyimpan URL seperti
`https://project.supabase.co/storage/v1/object/public/...` di seed atau tabel.

Uploader admin menerima JPEG, PNG, dan WebP dengan ukuran maksimal 5 MB. Upload menghasilkan
nama unik dan menyimpan object path saja. Melepas referensi database tidak otomatis menghapus
file Storage; penghapusan permanen memerlukan konfirmasi terpisah.

## Perilaku Fetch

Route App Router mengambil data pada server:

```text
page/layout server component
-> lib/data/landing-page.ts
-> lib/supabase/storage.ts
-> Supabase public read query
-> props serializable
-> komponen UI
```

Halaman menggunakan:

```ts
export const revalidate = 300
```

Konten dapat diperbarui paling lambat setelah interval revalidasi berikutnya. Tidak ada query Supabase langsung dari komponen presentasional.

Resolver gambar mempertahankan URL `http(s)` dan path lokal yang diawali `/`. Object path
lain di-resolve terhadap bucket terkait melalui Supabase client.

## Fallback

Fallback lokal dipakai ketika:

- environment variable belum tersedia;
- URL Supabase tidak valid;
- query gagal;
- tabel belum dibuat;
- RLS menolak query;
- hasil dataset kosong.

Fallback dilakukan per dataset. Contoh: jika FAQ kosong tetapi produk tersedia, FAQ memakai data lokal sementara katalog tetap memakai data Supabase.
Jika env Storage tidak tersedia atau tidak valid, resolver mengembalikan path fallback lokal.

Jangan hapus `lib/katalog-data.ts` atau `lib/data/fallback.ts` sebelum verifikasi manual production selesai.

## Verifikasi Data Supabase

Periksa jumlah row melalui SQL Editor:

```sql
select count(*) from public.landing_sections where is_active;
select count(*) from public.navigation_items where is_active;
select count(*) from public.gallery_items where is_active;
select count(*) from public.testimonials where is_active;
select count(*) from public.faqs where is_active;
select count(*) from public.product_categories where is_active;
select count(*) from public.products where is_active;
select count(*) from public.leads;
select count(*) from public.lead_messages;
select count(*) from public.orders;
select count(*) from public.order_items;
select count(*) from public.order_status_histories;
select count(*) from public.feedback_requests;
select count(*) from public.feedback_submissions;
select id, name, public from storage.buckets where id in ('landing_page', 'catalogs', 'feedback_customer_photos');
select id, email, is_active from public.admin_users;
```

Expected seed:

| Dataset | Jumlah |
| --- | --- |
| Landing sections | 11 |
| Navigation items | 14 |
| Gallery | 6 |
| Testimonials | 7 |
| FAQ | 6 |
| Product categories | 6 |
| Products | 10 |
| Package tiers | 3 |
| Leads | 0 atau sesuai inquiry yang masuk |
| Lead messages | 0 atau sesuai inquiry/catatan yang masuk |
| Orders | 0 atau sesuai order manual yang dibuat |
| Order items | 0 atau sesuai item order manual |
| Order status histories | 0 atau sesuai perubahan status order |
| Feedback requests | 0 atau sesuai data admin |
| Feedback submissions | 0 atau sesuai data pelanggan |

## Verifikasi Fallback

1. Hentikan dev server.
2. Kosongkan sementara variable Supabase dari environment lokal.
3. Jalankan ulang `npm run dev`.
4. Pastikan halaman dan katalog tetap tampil.
5. Pastikan gambar berasal dari path lokal `/...`.
6. Kembalikan variable dan restart server.

Jangan commit perubahan `.env.local`.

## Docker dan CI

`.dockerignore` mengecualikan seluruh `.env*`. Dockerfile menerima:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

sebagai build arguments dan runtime environment.

Contoh build:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -t daztore:<commit-sha> .
```

Nilai `NEXT_PUBLIC_*` bersifat publik dan dapat masuk ke client bundle. Jangan pernah mengganti publishable key dengan service-role key. `SUPABASE_SERVICE_ROLE_KEY` diberikan hanya sebagai runtime env server, bukan build argument.

## Rollback

Rollback aplikasi tidak memerlukan penghapusan tabel:

1. deploy image commit sebelumnya;
2. local fallback lama tetap tersedia;
3. nonaktifkan row konten publik bermasalah dengan `is_active = false` jika diperlukan;
4. untuk lead/order bermasalah, ubah status ke `cancelled` atau batasi akses admin; jangan hapus massal.

Jangan menjalankan `drop table`, truncate, atau delete massal untuk rollback aplikasi.

## Needs Confirmation

- Apakah project Supabase target adalah environment development, staging, atau production.
- Siapa user pertama yang akan dimasukkan ke allowlist admin.
- Apakah penghapusan permanen data dan file Storage memerlukan approval tambahan.
- Apakah perubahan konten membutuhkan preview/draft workflow.
- Apakah revalidasi lima menit sesuai kebutuhan operasional.
