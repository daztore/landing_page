# API and Integrations

## Ringkasan

Project tidak memiliki API route internal, tetapi sekarang menggunakan Supabase PostgREST melalui SDK resmi untuk membaca konten publik. Tidak ditemukan:

- Axios;
- API route;
- Server Action;
- GraphQL client;
- authentication provider;
- session store;
- payment gateway.

Data produk dan konten pemasaran dibaca pada server melalui `lib/data/landing-page.ts`. Source code lokal tetap menjadi fallback.

## Supabase

Package:

```text
@supabase/supabase-js 2.108.0
@supabase/ssr 0.12.0
```

Client dibuat oleh `lib/supabase/client.ts` menggunakan:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Query dilakukan oleh data access layer, bukan langsung dari komponen UI. Query:

- memilih kolom yang diperlukan;
- memfilter `is_active = true`;
- mengurutkan `sort_order`;
- menggunakan RLS public read-only;
- kembali ke fallback lokal saat gagal atau kosong.

Tidak ada service-role key atau public write policy. Modul `/admin-daz` menggunakan Supabase
Auth email/password dan RLS admin untuk CRUD serta upload.

### Supabase Storage

Gambar publik dibaca dari bucket:

- `landing_page` untuk hero, background hero mobile, story, dan galeri;
- `catalogs` untuk gambar produk katalog.

Kolom database menyimpan object path, lalu `lib/supabase/storage.ts` membentuk public URL
melalui Supabase client. URL `http(s)` dan fallback lokal yang diawali `/` tetap didukung.
Bucket tetap dapat dibaca publik. Insert/update/delete object hanya diizinkan untuk user
authenticated yang terdaftar sebagai admin aktif. Admin uploader menyimpan object path saja.

## WhatsApp

Integrasi utama adalah link `https://wa.me/...` dengan nomor:

```text
6287756877555
```

Lokasi penggunaan:

- `components/hero.tsx`;
- `components/faq-section.tsx`;
- `components/urgency-section.tsx`;
- `components/final-cta.tsx`;
- `components/whatsapp-button.tsx`;
- `components/site-navigation.tsx`;
- `components/katalog/product-card.tsx`;
- `components/packages.tsx`, belum aktif;
- `components/inquiry-form.tsx`, belum aktif.

Beberapa link menyertakan pesan URL-encoded. Kartu katalog memasukkan judul produk ke pesan:

```text
Pengguna klik CTA produk
-> browser membuka wa.me
-> WhatsApp menerima draft pesan berisi nama produk
```

Tidak ada data yang dikirim ke server project.

### Inquiry form

`InquiryForm` yang belum aktif mengumpulkan:

- nama;
- nomor WhatsApp;
- tanggal pernikahan;
- budget;
- pesan.

Saat submit, komponen membentuk pesan dan memanggil `window.open`. Nomor WhatsApp pengunjung disimpan di state, tetapi tidak dimasukkan ke draft pesan.

## Email

Alamat yang digunakan:

```text
hello@daztore.id
```

Link memakai protokol `mailto:` pada `FinalCta` dan `SiteFooter`. Aplikasi tidak mengirim email dan tidak memiliki SMTP integration.

## Instagram

Footer mengarah ke:

```text
https://instagram.com/daztore.id
```

Tidak ada Instagram API, feed embedding, access token, atau tracking khusus.

## Vercel Analytics

Package:

```text
@vercel/analytics 1.6.1
```

`Analytics` dirender oleh `app/layout.tsx` hanya ketika `NODE_ENV` bernilai `production`.

Tidak ditemukan konfigurasi consent banner, opt-out, atau dokumentasi privasi analytics.

> **Perhatian:** Kebutuhan consent dan privacy notice bergantung pada wilayah pengguna serta kebijakan bisnis. Needs confirmation.

## Google Fonts

Root layout memakai:

- Inter;
- Playfair Display.

Keduanya diintegrasikan melalui `next/font/google`, bukan tag stylesheet manual. Build CI dapat memerlukan akses jaringan untuk font processing.

## Data Katalog

Sumber utama: tabel `product_categories` dan `products`.

Fallback: `lib/katalog-data.ts`.

Model `Product`:

| Field | Type | Fungsi |
| --- | --- | --- |
| `id` | `string` | Identifier lokal. |
| `title` | `string` | Nama produk. |
| `category` | `Category` | Filter kategori. |
| `description` | `string` | Deskripsi kartu. |
| `startPrice` | `number` | Harga awal dalam Rupiah. |
| `endPrice` | `number?` | Harga akhir opsional. |
| `image` | `string` | Public Storage URL atau path fallback lokal setelah resolusi data layer. |
| `badge` | enum opsional | Best seller, limited, atau loved. |
| `processingTime` | `string` | Estimasi pengerjaan. |
| `customizable` | `boolean` | Menampilkan label custom. |
| `availability` | `boolean` | Menentukan badge keterbatasan. |

Tidak ada sinkronisasi dengan inventory, CMS lain, spreadsheet, atau checkout backend.

## Authentication, Cookie, dan Token

Route publik tidak memerlukan session. Route `/admin-daz/**` memakai Supabase Auth:

```text
login email/password
-> session cookie @supabase/ssr
-> proxy refresh token
-> server layout memvalidasi claims
-> admin_users memvalidasi izin
-> RLS membatasi CRUD database/Storage
```

Publishable key tetap merupakan credential publik. Akses admin berasal dari JWT user dan
allowlist, bukan dari kerahasiaan key.

`components/ui/sidebar.tsx` memiliki kode cookie untuk menyimpan state sidebar, tetapi komponen tersebut tidak dipakai oleh halaman aktif. Cookie itu bukan cookie autentikasi.

Tidak ada bearer token custom, local storage session custom, atau service-role key.

## Keamanan dan Privasi

- Link external dengan target tab baru umumnya memakai `rel="noreferrer"`.
- Tidak ada secret di URL integrasi yang ditemukan.
- Nomor WhatsApp, email, Instagram, dan alamat dibaca dari `site_settings`, dengan fallback lokal.
- Bila form kontak diaktifkan, kebijakan privasi perlu menjelaskan bahwa data diteruskan ke WhatsApp dan tidak disimpan oleh aplikasi.
- Link legal footer masih placeholder.

## Needs Confirmation

- Apakah kontak dan akun eksternal pada seed/fallback adalah identitas production resmi.
- Apakah Vercel Analytics digunakan saat aplikasi dijalankan di luar Vercel.
- Apakah ada backend atau CRM eksternal yang digunakan secara operasional tetapi belum terhubung ke repository.
- Apakah Supabase akan menjadi CMS permanen atau hanya sumber data sementara.
- Siapa owner dan proses operasional upload gambar Supabase Storage.
- Apakah bisnis memerlukan consent management atau privacy policy khusus analytics.
