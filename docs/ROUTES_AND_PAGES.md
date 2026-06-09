# Routes and Pages

## Router

Project menggunakan Next.js App Router karena route didefinisikan melalui folder `app/`.

## Daftar Route

| Route | File | Jenis | Tujuan |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Halaman utama | Landing page pemasaran dan kontak. |
| `/katalog` | `app/katalog/page.tsx` | Halaman katalog | Pencarian, filter, sorting, dan CTA produk. |

Tidak ada dynamic route seperti `[id]`, catch-all route, route group, parallel route, atau intercepting route.

## Root Layout

File `app/layout.tsx` berlaku untuk seluruh route dan bertanggung jawab atas:

- elemen `<html lang="id">`;
- font Inter dan Playfair Display melalui `next/font/google`;
- metadata default;
- viewport dan theme color;
- import `app/globals.css`;
- Vercel Analytics saat `NODE_ENV=production`.

Metadata default:

- title: `daztore.id - Premium Mahar, Seserahan & Flower Bouquet`;
- deskripsi layanan;
- keyword pemasaran;
- Open Graph dasar;
- generator `v0.app`.

## Route `/`

`app/page.tsx` adalah async Server Component yang memanggil `getLandingPageData()` lalu menyusun halaman dari section berikut:

| Urutan | Komponen | Tujuan |
| --- | --- | --- |
| 1 | `SiteNavigation` | Header desktop/mobile dan bottom navigation mobile. |
| 2 | `Hero` | Value proposition, CTA, statistik, dan gambar utama. |
| 3 | `Story` | Cerita brand dan nilai layanan. |
| 4 | `OurProcess` | Empat tahap proses layanan. |
| 5 | `WhyChooseUs` | Alasan memilih layanan. |
| 6 | `Gallery` | Portofolio gambar dengan lightbox. |
| 7 | `TestimonialsEnhanced` | Tiga testimonial statis. |
| 8 | `FaqSection` | Accordion FAQ. |
| 9 | `UrgencySection` | Informasi keterbatasan slot dan CTA. |
| 10 | `FinalCta` | CTA WhatsApp dan email. |
| 11 | `SiteFooter` | Menu, alamat, email, Instagram, dan legal placeholder. |
| 12 | `WhatsappButton` | Floating CTA setelah pengunjung scroll. |

### Anchor yang tersedia

| Anchor | Lokasi |
| --- | --- |
| `#top` | `Hero` |
| `#story` | `Story` |
| `#gallery` | `Gallery` |
| `#contact` | `FinalCta` |

### Anchor yang bermasalah

| Anchor | Kondisi |
| --- | --- |
| `#packages` | Link tersedia di beberapa menu, tetapi komponen `Packages` tidak dirender. |
| `#testimonials` | Link tersedia, tetapi `TestimonialsEnhanced` tidak memiliki ID tersebut. |

`SiteFooter` juga menampilkan link Kebijakan Privasi dan Syarat & Ketentuan dengan `href="#"`. Belum ada route legal yang nyata.

## Route `/katalog`

`app/katalog/page.tsx` menambahkan metadata khusus:

- title: `Katalog Premium | daztore.id`;
- description katalog.

Halaman mengambil `getCatalogData()` pada server lalu merender `KatalogPage`, yang merupakan Client Component.

Fitur route:

- daftar sepuluh produk dari `lib/katalog-data.ts`;
- filter enam kategori;
- pencarian judul dan deskripsi;
- sorting terbaru, populer, harga, dan premium;
- tampilan filter overlay pada mobile;
- favorite toggle lokal;
- CTA WhatsApp per produk.

Pilihan `newest` tidak melakukan sorting tambahan karena data tidak memiliki tanggal. Urutan yang tampil adalah urutan array source.

## Layout `/katalog`

`app/katalog/layout.tsx` mengambil navigation/contact dari Supabase. Deteksi viewport dipindahkan ke `KatalogLayoutShell`, sebuah Client Component:

- desktop menampilkan `SiteNavigation` dan `SiteFooter`;
- mobile menampilkan `KatalogHeader`;
- sebelum mount, layout sementara menampilkan navigasi dan footer standar.

`KatalogHeader` menerima `searchQuery` dan `onSearchChange`, tetapi layout mengirim nilai kosong/no-op dan komponen belum menghubungkan tombol search ke input katalog. Tombol back menggunakan `router.back()`.

## API Routes

Tidak ditemukan:

- `app/api/**/route.ts`;
- route handler `GET`, `POST`, `PUT`, `PATCH`, atau `DELETE`;
- Pages Router API route;
- Server Action.

## Middleware

Tidak ditemukan `middleware.ts` atau `middleware.js`. Tidak ada redirect, rewrite, autentikasi, locale routing, atau header security yang diterapkan melalui middleware.

## Loading, Error, dan Not Found

Tidak ditemukan file:

- `loading.tsx`;
- `error.tsx`;
- `global-error.tsx`;
- `not-found.tsx`.

Next.js akan memakai perilaku default framework. Tidak ada UI loading atau error khusus project.

## Rendering dan Caching

Halaman utama, katalog, dan layout katalog menetapkan `revalidate = 300`. Konten Supabase diambil pada server dan dapat diperbarui melalui ISR, sedangkan interaksi katalog dan section tertentu di-hydrate sebagai Client Component.

Jika Supabase gagal atau dataset kosong, data lokal digunakan.

## Needs Confirmation

- Apakah route legal akan dibuat atau link footer harus diarahkan ke dokumen eksternal.
- Apakah halaman detail produk direncanakan.
- Apakah anchor paket dan testimoni akan diaktifkan/diperbaiki.
- Apakah katalog harus tetap statis atau akan mengambil data dari backend/CMS.
