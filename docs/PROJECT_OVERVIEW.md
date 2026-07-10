# Project Overview

## Ringkasan

`daztore.id` adalah landing page, katalog produk, admin CMS, dan flow feedback pelanggan untuk layanan wedding atelier yang menawarkan mahar, seserahan, bouquet, hampers, wedding gift box, dan paket custom. Aplikasi menampilkan informasi pemasaran, galeri, testimoni, FAQ, katalog, form feedback berbasis link, serta beberapa CTA yang mengarahkan pengunjung ke WhatsApp atau email.

Repository ini menggunakan Next.js dan Supabase untuk konten publik, admin CMS, feedback, lead,
manual order, Storage, Auth, dan RLS. Belum ada integrasi payment gateway, shipping, cart,
checkout, customer account, SMTP, atau backend terpisah.

## Teknologi Utama

| Area | Implementasi |
| --- | --- |
| Framework | Next.js `16.2.10` |
| Router | App Router, menggunakan folder `app/` |
| UI runtime | React `19.2.7` dan React DOM `19.2.7` |
| Bahasa | TypeScript `5.7.3` |
| Styling | Tailwind CSS `4.x`, PostCSS, CSS variables |
| Komponen UI | Radix UI, pola shadcn/ui, Lucide icons |
| Analytics | Belum aktif; import `@vercel/analytics` dikomentari dan package tidak terdaftar |
| Database content | Supabase Postgres melalui `@supabase/supabase-js` |
| Auth dan session | Supabase Auth + `@supabase/ssr` untuk admin |
| Storage | Supabase Storage untuk asset publik, katalog, dan foto feedback private |
| Container | Docker multi-stage berbasis `node:20-alpine` |
| Reverse proxy | Nginx `1.30.1-alpine` melalui Docker Compose |

## Tujuan Aplikasi

Aplikasi memiliki tiga tujuan utama:

1. Menjadi landing page pemasaran yang menjelaskan positioning, proses layanan, galeri, testimoni, FAQ, dan jalur kontak.
2. Menjadi katalog statis yang memungkinkan pengunjung mencari, memfilter, mengurutkan, dan menghubungi bisnis terkait produk tertentu.
3. Menjadi admin CMS, lead/order manual, dan feedback collection tool untuk konten, katalog,
   request feedback, submission feedback, dan upload gambar.

CTA publik tetap berawal dari konsultasi/inquiry. Order hanya dibuat manual oleh admin dari hasil
konsultasi; belum ada checkout publik atau payment gateway aktif.

## Struktur Repository

```text
app/
  layout.tsx                 Root layout, metadata global, font, loading provider
  page.tsx                   Halaman utama
  globals.css                Tema dan utility CSS aktif
  katalog/
    layout.tsx               Layout responsif khusus katalog
    page.tsx                 Route /katalog
  feedback/[id]/
    page.tsx                 Form feedback pelanggan berbasis UUID
    submit/route.ts          Route Handler POST feedback
  admin-daz/
    page.tsx                 Redirect ke dashboard admin
    login/page.tsx           Login admin
    (protected)/             Route admin terproteksi
components/
  admin-daz/                 Komponen admin CMS
  feedback/                  Komponen form feedback
  katalog/                   Komponen filter dan kartu produk
  ui/                        Koleksi primitive UI bergaya shadcn/ui
  *.tsx                      Section dan komponen landing page
hooks/                       Hook toast dan deteksi mobile
lib/
  admin-daz/                  Auth, service CRUD admin, permission, dan validation
  data/                       Data access, tipe, dan fallback landing page
  feedback/                   Kontrak, storage, dan data access feedback
  security/                   Helper keamanan seperti safe image source
  supabase/client.ts          Supabase client dari environment
  supabase/service-role.ts    Supabase service-role client server-only
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
  ci-cd.yml                  Verify, build image, dan push GHCR
  codeql.yml                 Security scanning JavaScript/TypeScript
Dockerfile                   Build dan runtime Next.js
docker-compose.yml           Service app dan Nginx
docker-compose.override.yml  Override local untuk in-memory rate limiter
docker-compose.production.yml Compose production berbasis image GHCR
```

`styles/globals.css` juga tersedia, tetapi tidak diimpor oleh root layout. Tema yang aktif berasal dari `app/globals.css`.

## Route dan Halaman

| Route | Fungsi |
| --- | --- |
| `/` | Landing page utama dengan navigasi, hero, cerita, proses, keunggulan, galeri, testimoni, FAQ, urgency CTA, kontak, footer, dan tombol WhatsApp mengambang. |
| `/katalog` | Katalog produk statis dengan pencarian, filter kategori, sorting, kartu produk, favorite state lokal, dan CTA WhatsApp. |
| `/produk/[slug]` | Detail produk aktif dengan harga estimasi dan form inquiry. |
| `/order/[orderNumber]/access?token=...` | Exchange token order menjadi cookie `HttpOnly` dan redirect ke URL bersih. |
| `/order/[orderNumber]` | Ringkasan order publik berbasis cookie access proof dan `noindex`. |
| `/feedback/[id]` | Halaman feedback pelanggan berbasis UUID, `force-dynamic`, dan `noindex`. |
| `/feedback/[id]/submit` | Route Handler `POST` untuk submit rating, kritik/saran, testimoni, rekomendasi, dan foto pelanggan. |
| `/admin-daz` | Redirect ke `/admin-daz/dashboard`. |
| `/admin-daz/login` | Login email/password admin melalui Supabase Auth. |
| `/admin-daz/**` | Admin CMS terproteksi untuk dashboard, landing content, katalog, leads, orders, feedback, media, dan settings. |

Route dynamic aktif adalah `/produk/[slug]`, `/order/[orderNumber]`, dan `/feedback/[id]`. Route
Handler aktif berada pada lead submit, order access/admin actions, feedback submit, dan admin
feedback requests. `proxy.ts` berjalan untuk `/admin-daz/:path*` guna refresh cookie Supabase Auth
serta `/order/:path*` untuk header keamanan dan kompatibilitas link token lama. Custom
loading tersedia; custom `error.tsx`, `global-error.tsx`, dan `not-found.tsx` belum tersedia.

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
```

## Build dan Runtime

- Development dijalankan dengan `next dev`.
- Build production dijalankan dengan `next build`.
- Runtime production dijalankan dengan `next start` pada port default `3000`.
- Docker builder menggunakan Node.js 20 Alpine dan `npm ci`.
- Nginx pada Compose lokal meneruskan port host `8002` ke service `app:3000`.
- Nginx pada Compose production saat ini meneruskan port host `8003` ke service `app:3000`.
- Optimasi image bawaan Next.js aktif untuk gambar publik yang sudah masuk remote pattern.
- Error TypeScript menggagalkan build; CI juga menjalankan `npm run typecheck`.

Lihat [DOCKER_AND_DEPLOYMENT.md](./DOCKER_AND_DEPLOYMENT.md) untuk batasan konfigurasi production saat ini.

## Integrasi Eksternal

| Integrasi | Penggunaan |
| --- | --- |
| WhatsApp `wa.me` | Semua CTA konsultasi dan produk; nomor berasal dari `site_settings` dengan fallback lokal. |
| Email | Link `mailto:hello@daztore.id`. |
| Instagram | Link menuju akun `daztore.id`. |
| Supabase Auth | Login dan session admin melalui cookie `@supabase/ssr`. |
| Supabase Storage | Asset publik, katalog, dan foto feedback pelanggan private. |
| Google Fonts | `Inter` dan `Playfair Display` dimuat melalui `next/font/google`. |

Tidak ditemukan Axios client, Pages Router API route, Server Action, GraphQL client, maps, SMTP,
active analytics package, payment gateway, shipping provider, cart, checkout, atau customer
account.

## Needs Confirmation

- Apakah nomor WhatsApp, email, akun Instagram, alamat Jakarta, dan klaim pengiriman nasional merupakan data production resmi.
- Apakah klaim jumlah pelanggan, rating, tahun pengalaman, response time, support 24/7, dan kapasitas delapan slot per bulan sudah tervalidasi bisnis.
- Apakah Supabase menjadi sumber konten dan feedback production permanen serta siapa owner datanya.
- Apakah komponen `Packages`, `InquiryForm`, dan `Testimonials` akan diaktifkan kembali.
- Apakah file PHP dan Supervisor di folder `docker/` masih diperlukan oleh sistem lain.
- Apakah deploy SSH otomatis akan diaktifkan kembali atau tetap manual pull dari GHCR.
