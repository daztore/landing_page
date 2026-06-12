# Supabase Migration

## Tujuan

Project membaca konten landing page dan katalog dari Supabase. Data lokal tetap dipertahankan sebagai fallback sampai migration production diverifikasi.

SDK yang digunakan:

```text
@supabase/supabase-js 2.108.0
```

Tidak ada service-role key di aplikasi. Query publik memakai publishable key dan dibatasi Row Level Security.

## File Implementasi

| File | Fungsi |
| --- | --- |
| `supabase/migrations/001_create_landing_page_tables.sql` | Membuat tabel, index, trigger `updated_at`, grant, dan RLS policy. |
| `supabase/migrations/002_create_storage_buckets.sql` | Membuat bucket gambar publik dan policy read-only. |
| `supabase/migrations/003_create_admin_access.sql` | Membuat allowlist admin serta policy CRUD database dan Storage. |
| `supabase/seed.sql` | Mengisi data lokal saat ini secara idempotent. |
| `lib/supabase/client.ts` | Membuat Supabase client dari environment variable. |
| `lib/supabase/storage.ts` | Mengubah object path Storage menjadi public URL dengan fallback aman. |
| `lib/data/landing-page.ts` | Data access layer dan fallback handling. |
| `lib/data/fallback.ts` | Salinan lokal yang dipakai bila env/query/data belum tersedia. |
| `lib/data/types.ts` | Kontrak data antara server dan komponen. |

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

Migration Storage hanya membuat policy `SELECT` untuk `anon` dan `authenticated`.
Migration admin menambahkan policy `INSERT`, `UPDATE`, dan `DELETE` khusus user
`authenticated` yang lolos `public.is_active_admin()`. Anonymous tetap tidak dapat menulis.

## Model Admin

Admin harus memenuhi dua syarat:

1. memiliki user email/password aktif di Supabase Auth;
2. UUID user terdaftar pada `public.admin_users` dengan `is_active = true`.

Route admin memakai session cookie Supabase SSR. Pemeriksaan route dilakukan di server,
sedangkan RLS tetap menjadi batas izin final untuk CRUD database dan Storage.

Tidak ada public registration dan aplikasi tidak menggunakan service-role key.

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

6. Upload file gambar sesuai daftar object path di bawah.

7. Setelah migration dan upload berhasil, jalankan:

```text
supabase/seed.sql
```

8. Buat `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

9. Restart development server:

```bash
npm run dev
```

10. Buat admin pertama menggunakan langkah berikut.
11. Verifikasi `/`, `/katalog`, dan `/admin-daz/login`.

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
select id, name, public from storage.buckets where id in ('landing_page', 'catalogs');
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
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

sebagai build arguments dan runtime environment.

Contoh build:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -t daztore:<commit-sha> .
```

Nilai `NEXT_PUBLIC_*` bersifat publik dan dapat masuk ke client bundle. Jangan pernah mengganti publishable key dengan service-role key.

## Rollback

Rollback aplikasi tidak memerlukan penghapusan tabel:

1. deploy image commit sebelumnya;
2. local fallback lama tetap tersedia;
3. nonaktifkan row bermasalah dengan `is_active = false` jika diperlukan.

Jangan menjalankan `drop table`, truncate, atau delete massal untuk rollback aplikasi.

## Needs Confirmation

- Apakah project Supabase target adalah environment development, staging, atau production.
- Siapa user pertama yang akan dimasukkan ke allowlist admin.
- Apakah penghapusan permanen data dan file Storage memerlukan approval tambahan.
- Apakah perubahan konten membutuhkan preview/draft workflow.
- Apakah revalidasi lima menit sesuai kebutuhan operasional.
