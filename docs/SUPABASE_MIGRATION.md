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
| `supabase/seed.sql` | Mengisi data lokal saat ini secara idempotent. |
| `lib/supabase/client.ts` | Membuat Supabase client dari environment variable. |
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

## Setup Manual

1. Buka dashboard project Supabase.
2. Masuk ke **SQL Editor**.
3. Jalankan seluruh isi:

```text
supabase/migrations/001_create_landing_page_tables.sql
```

4. Setelah migration berhasil, jalankan:

```text
supabase/seed.sql
```

5. Buat `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

6. Restart development server:

```bash
npm run dev
```

7. Verifikasi `/` dan `/katalog`.

Migration dan seed tidak dijalankan otomatis oleh aplikasi.

## Perilaku Fetch

Route App Router mengambil data pada server:

```text
page/layout server component
-> lib/data/landing-page.ts
-> Supabase public read query
-> props serializable
-> komponen UI
```

Halaman menggunakan:

```ts
export const revalidate = 300
```

Konten dapat diperbarui paling lambat setelah interval revalidasi berikutnya. Tidak ada query Supabase langsung dari komponen presentasional.

## Fallback

Fallback lokal dipakai ketika:

- environment variable belum tersedia;
- URL Supabase tidak valid;
- query gagal;
- tabel belum dibuat;
- RLS menolak query;
- hasil dataset kosong.

Fallback dilakukan per dataset. Contoh: jika FAQ kosong tetapi produk tersedia, FAQ memakai data lokal sementara katalog tetap memakai data Supabase.

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
5. Kembalikan variable dan restart server.

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
- Siapa owner yang memiliki hak tulis untuk mengelola konten.
- Apakah gambar akan tetap di `public/` atau dipindahkan ke Supabase Storage.
- Apakah perubahan konten membutuhkan preview/draft workflow.
- Apakah revalidasi lima menit sesuai kebutuhan operasional.
