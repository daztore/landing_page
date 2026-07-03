# Project Overview

## Ringkasan

`daztore.id` adalah landing page dan katalog produk untuk layanan wedding atelier yang menawarkan mahar, seserahan, bouquet, hampers, wedding gift box, dan paket custom. Aplikasi menampilkan informasi pemasaran, galeri, testimoni, FAQ, katalog statis, serta beberapa CTA yang mengarahkan pengunjung ke WhatsApp atau email.

Repository ini menggunakan Next.js dan Supabase untuk konten publik. Tidak ditemukan autentikasi, penyimpanan form, atau integrasi pembayaran.

## Teknologi Utama

| Area | Implementasi |
| --- | --- |
| Framework | Next.js `16.2.7` |
| Router | App Router, menggunakan folder `app/` |
| UI runtime | React `19.2.4` dan React DOM `19.2.4` |
| Bahasa | TypeScript `5.7.3` |
| Styling | Tailwind CSS `4.x`, PostCSS, CSS variables |
| Komponen UI | Radix UI, pola shadcn/ui, Lucide icons |
| Analytics | `@vercel/analytics`, aktif saat `NODE_ENV=production` |
| Database content | Supabase Postgres melalui `@supabase/supabase-js` |
| Container | Docker multi-stage berbasis `node:20-alpine` |
| Reverse proxy | Nginx `1.30.1-alpine` melalui Docker Compose |

## Tujuan Aplikasi

Aplikasi memiliki dua tujuan utama:

1. Menjadi landing page pemasaran yang menjelaskan positioning, proses layanan, galeri, testimoni, FAQ, dan jalur kontak.
2. Menjadi katalog statis yang memungkinkan pengunjung mencari, memfilter, mengurutkan, dan menghubungi bisnis terkait produk tertentu.

Seluruh CTA transaksi saat ini berakhir di kanal komunikasi eksternal. Tidak ada checkout atau pemesanan yang diproses oleh aplikasi.

## Struktur Repository

```text
app/
  layout.tsx                 Root layout, metadata global, font, analytics
  page.tsx                   Halaman utama
  globals.css                Tema dan utility CSS aktif
  katalog/
    layout.tsx               Layout responsif khusus katalog
    page.tsx                 Route /katalog
components/
  katalog/                   Komponen filter dan kartu produk
  ui/                        Koleksi primitive UI bergaya shadcn/ui
  *.tsx                      Section dan komponen landing page
hooks/                       Hook toast dan deteksi mobile
lib/
  data/                       Data access, tipe, dan fallback landing page
  supabase/client.ts          Supabase client dari environment
  katalog-data.ts            Fallback katalog dan pilihan sorting
  utils.ts                   Helper penggabungan class Tailwind
public/                      Gambar hero, galeri, dan background
supabase/
  migrations/                SQL schema, index, trigger, dan RLS
  seed.sql                   Seed idempotent dari konten lama
docker/
  nginx/default.conf         Reverse proxy ke service Next.js
  php/                       Konfigurasi PHP yang tidak dipakai Compose saat ini
  supervisord.conf           Konfigurasi lama/tidak terhubung ke image saat ini
.github/workflows/
  codeql.yml                 Security scanning JavaScript/TypeScript
Dockerfile                   Build dan runtime Next.js
docker-compose.yml           Service app dan Nginx
```

`styles/globals.css` juga tersedia, tetapi tidak diimpor oleh root layout. Tema yang aktif berasal dari `app/globals.css`.

## Route dan Halaman

| Route | Fungsi |
| --- | --- |
| `/` | Landing page utama dengan navigasi, hero, cerita, proses, keunggulan, galeri, testimoni, FAQ, urgency CTA, kontak, footer, dan tombol WhatsApp mengambang. |
| `/katalog` | Katalog produk statis dengan pencarian, filter kategori, sorting, kartu produk, favorite state lokal, dan CTA WhatsApp. |

Tidak ditemukan dynamic route, route handler API, middleware, custom loading page, custom error page, atau custom not-found page.

Detail route tersedia di [ROUTES_AND_PAGES.md](./ROUTES_AND_PAGES.md).

## Struktur Halaman Utama

Urutan section yang dirender oleh `app/page.tsx`:

1. `SiteNavigation`
2. `Hero`
3. `Story`
4. `OurProcess`
5. `WhyChooseUs`
6. `Gallery`
7. `TestimonialsEnhanced`
8. `FaqSection`
9. `UrgencySection`
10. `FinalCta`
11. `SiteFooter`
12. `WhatsappButton`

Komponen `Packages` diimpor tetapi pemanggilannya dikomentari sebagai "Coming Soon". Beberapa link masih menunjuk ke `#packages`, sehingga link tersebut saat ini tidak memiliki target section aktif.

`TestimonialsEnhanced` tidak mendefinisikan `id="testimonials"`, walaupun navigasi dan footer memiliki link ke `#testimonials`. Ini adalah ketidaksesuaian navigasi yang perlu diperbaiki pada pekerjaan terpisah.

## Struktur Katalog

Data katalog diambil oleh Server Component dari Supabase. `KatalogPage` menerima hasil sebagai props dan melakukan:

- filter kategori;
- pencarian terhadap judul dan deskripsi;
- sorting berdasarkan badge atau harga;
- rendering kartu produk;
- reset filter jika hasil kosong.

Jika query gagal atau kosong, data berasal dari `lib/katalog-data.ts`. Favorite state pada `ProductCard` hanya berada di memory React dan hilang saat refresh.

## Alur Data Tingkat Tinggi

```text
Supabase products/product_categories
        |
        v
data access layer + fallback lokal
        |
        v
KatalogPage (client state)
        |
        +--> filter pencarian/kategori
        +--> sorting
        |
        v
ProductCard
        |
        v
WhatsApp wa.me dengan pesan yang sudah diisi
```

Untuk halaman utama:

```text
Supabase landing tables
        |
        v
data access layer + fallback lokal
        |
        v
Server dan client component Next.js
        |
        +--> gambar lokal dari public/
        +--> CTA WhatsApp
        +--> mailto
        +--> Instagram
        +--> Vercel Analytics saat production
```

## Build dan Runtime

- Development dijalankan dengan `next dev`.
- Build production dijalankan dengan `next build`.
- Runtime production dijalankan dengan `next start` pada port default `3000`.
- Docker builder menggunakan Node.js 20 Alpine dan `npm ci`.
- Nginx pada Compose meneruskan port host `8002` ke service `app:3000`.
- Optimasi image bawaan Next.js aktif untuk gambar publik yang sudah masuk remote pattern.
- Error TypeScript menggagalkan build; CI juga menjalankan `npm run typecheck`.

Lihat [DOCKER_AND_DEPLOYMENT.md](./DOCKER_AND_DEPLOYMENT.md) untuk batasan konfigurasi production saat ini.

## Integrasi Eksternal

| Integrasi | Penggunaan |
| --- | --- |
| WhatsApp `wa.me` | Semua CTA konsultasi dan produk; nomor berasal dari `site_settings` dengan fallback lokal. |
| Email | Link `mailto:hello@daztore.id`. |
| Instagram | Link menuju akun `daztore.id`. |
| Vercel Analytics | Dirender oleh root layout hanya pada mode production. |
| Google Fonts | `Inter` dan `Playfair Display` dimuat melalui `next/font/google`. |

Tidak ditemukan Axios client, API route internal, cookie autentikasi, session, storage eksternal, maps, SMTP, atau payment gateway.

## Needs Confirmation

- Apakah nomor WhatsApp, email, akun Instagram, alamat Jakarta, dan klaim pengiriman nasional merupakan data production resmi.
- Apakah klaim jumlah pelanggan, rating, tahun pengalaman, response time, support 24/7, dan kapasitas delapan slot per bulan sudah tervalidasi bisnis.
- Apakah Supabase menjadi sumber konten production permanen dan siapa owner datanya.
- Apakah komponen `Packages`, `InquiryForm`, dan `Testimonials` akan diaktifkan kembali.
- Apakah file PHP dan Supervisor di folder `docker/` masih diperlukan oleh sistem lain.
