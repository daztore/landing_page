# API and Integrations

## Ringkasan

Project menggunakan Supabase PostgREST melalui SDK resmi untuk membaca konten publik, menjalankan
admin CMS, memproses lead/inquiry, memproses order manual, dan memproses feedback pelanggan.

Tidak ditemukan:

- Axios;
- Server Action;
- GraphQL client;
- Pages Router API route;
- payment gateway;
- shipping provider.

Ditemukan:

- Supabase Auth untuk admin;
- Supabase SSR cookie session;
- Supabase Storage public/private;
- Server Component product detail `/produk/[slug]`;
- Server Component public order detail `/order/[orderNumber]`;
- Route Handler `POST` untuk submit inquiry lead;
- Route Handler `POST` untuk submit feedback;
- Route Handler admin untuk membuat dan mengubah status order;
- Route Handler `GET`/`POST` admin untuk feedback request.

Data produk dan konten pemasaran dibaca pada server melalui `lib/data/landing-page.ts` dan
`features/catalog/queries`. Source code lokal tetap menjadi fallback.

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

Modul `/admin-daz` menggunakan Supabase Auth email/password dan RLS admin untuk CRUD serta upload.
`SUPABASE_SERVICE_ROLE_KEY` hanya digunakan server-side untuk flow feedback, lead publik, dan
public order lookup yang sudah di-hardening agar data privat tidak dibaca/ditulis langsung oleh
client.

### Supabase Storage

Gambar publik dibaca dari bucket:

- `landing_page` untuk hero, background hero mobile, story, dan galeri;
- `catalogs` untuk gambar produk katalog.

Kolom database menyimpan object path, lalu `lib/supabase/storage.ts` membentuk public URL
melalui Supabase client. URL `http(s)` dan fallback lokal yang diawali `/` tetap didukung.
Bucket tetap dapat dibaca publik. Insert/update/delete object hanya diizinkan untuk user
authenticated yang terdaftar sebagai admin aktif. Admin uploader menyimpan object path saja.

Bucket `feedback_customer_photos` bersifat private setelah migration `005`. Foto pelanggan diupload melalui Route Handler server-side dan dibaca admin melalui signed URL atau akses admin yang sesuai.

## Route Handler Internal

| Route | File | Method | Akses | Catatan |
| --- | --- | --- | --- | --- |
| `/api/leads` | `app/api/leads/route.ts` | `POST` | Public | Submit inquiry produk dengan validasi, rate limit, honeypot, dan insert server-side. |
| `/feedback/[id]/submit` | `app/feedback/[id]/submit/route.ts` | `POST` | Public via UUID link | Validasi input, rate limit dasar, upload foto, dan insert feedback memakai service-role server-only. |
| `/admin-daz/feedback/requests` | `app/admin-daz/(protected)/feedback/requests/route.ts` | `GET` | Admin | List feedback request melalui session admin dan RLS. |
| `/admin-daz/feedback/requests` | `app/admin-daz/(protected)/feedback/requests/route.ts` | `POST` | Admin | Membuat feedback request dan asset terkait dari panel admin. |
| `/admin-daz/leads/[id]/actions` | `app/admin-daz/(protected)/leads/[id]/actions/route.ts` | `POST` | Admin | Menambah catatan follow-up atau mengubah status lead lewat service/RPC. |
| `/admin-daz/orders/actions` | `app/admin-daz/(protected)/orders/actions/route.ts` | `POST` | Admin | Membuat order manual draft dari JSON tervalidasi. |
| `/admin-daz/orders/[id]/actions` | `app/admin-daz/(protected)/orders/[id]/actions/route.ts` | `POST` | Admin | Mengubah status order atau membuat ulang link publik order. |

Tidak ada route payment, shipping, checkout, atau webhook provider.

## Product Detail Query

Route `/produk/[slug]` sudah aktif dan membaca detail produk melalui Server Component, bukan
Route Handler publik.

Alur public product detail:

```text
GET /produk/[slug]
  -> Server Component
  -> features/catalog/queries/getProductDetailBySlug()
  -> Supabase public read query
  -> ProductDetail props
```

Aturan query:

- filter `products.slug = slug`;
- hanya produk `is_active = true`;
- kategori terkait harus `is_active = true`;
- produk dengan `source = 'feedback_request'` tidak tampil sebagai detail publik;
- pilih kolom yang diperlukan saja;
- resolve image via bucket `catalogs` dengan fallback lokal;
- panggil `notFound()` bila data tidak memenuhi syarat.

Jika Supabase tidak tersedia atau query error, query memakai fallback lokal. Jika Supabase berhasil
tetapi produk tidak ditemukan/tidak aktif, halaman tidak memakai fallback agar produk inactive tidak
muncul ulang.

## Lead/Inquiry Submit

Route Handler `/api/leads` sudah aktif untuk menyimpan inquiry/consultation setelah validasi
server-side.

Kontrak route:

| Route | Method | Akses | Tujuan |
| --- | --- | --- | --- |
| `/api/leads` | `POST` | Public | Menyimpan inquiry/consultation setelah validasi server-side. |

Request body:

| Field | Wajib | Catatan |
| --- | --- | --- |
| `name` | Ya | Nama customer, panjang dibatasi. |
| `whatsappNumber` | Ya | Dinormalisasi server-side. |
| `email` | Tidak | Validasi format bila diisi. |
| `productSlug` | Tidak | Harus mengarah ke produk aktif bila ada. |
| `interestCategory` | Tidak | Untuk inquiry umum tanpa produk spesifik. |
| `eventDate` | Tidak | Tanggal acara. |
| `budgetRange` | Tidak | Estimasi non-final. |
| `message` | Tidak | Panjang dibatasi. |
| `consentAccepted` | Ya | Harus `true`. |
| `source` | Ya | Contoh: `product_detail`, `catalog`, `landing`. |

Validasi dan security:

- hanya menerima method `POST`;
- membatasi content type `application/json` dan ukuran body 16 KB;
- validasi field server-side;
- rate limit in-memory per IP dan nomor WhatsApp sebelum operasi database;
- honeypot dan time-to-submit ringan;
- gunakan error publik generik;
- jangan log payload penuh atau data pribadi berlebihan;
- jangan membuka direct public insert Supabase untuk tabel `leads`;
- service-role hanya dipakai server-side karena RLS public write ditutup.

Response sukses:

```json
{
  "ok": true,
  "message": "Inquiry berhasil diterima. Tim daztore.id akan menghubungi Anda."
}
```

Jangan mengembalikan data internal seperti full row lead, admin assignment, atau detail error
database.

### Lead Notification

Notifikasi awal harus diproses server-side:

- baseline: lead tampil di admin list/dashboard tanpa provider eksternal;
- email/WhatsApp provider future harus memakai secret runtime server-only;
- hasil notifikasi dicatat sebagai event/catatan lead tanpa menyimpan secret;
- client hanya boleh menerima status submit dan CTA lanjutan yang aman.

## Manual Order

Order manual Phase 3 aktif untuk admin dan belum terhubung ke payment/shipping provider.

Alur admin:

```text
GET /admin-daz/orders
  -> list order via features/orders/queries/listAdminOrders()

GET /admin-daz/orders/new
  -> form create order
  -> optional leadId untuk prefill dari lead

POST /admin-daz/orders/actions
  -> validasi JSON server-side
  -> createAdminOrder()
  -> insert orders, order_items, order_status_histories
  -> optional lead status converted
```

Request create order admin:

| Field | Wajib | Catatan |
| --- | --- | --- |
| `leadId` | Tidak | UUID lead jika order dibuat dari lead. |
| `customerName` | Ya | Nama customer, dibatasi panjangnya. |
| `whatsappNumber` | Ya | Dinormalisasi server-side. |
| `email` | Tidak | Validasi format bila diisi. |
| `eventDate` | Tidak | Tanggal acara. |
| `dueDate` | Tidak | Target selesai. |
| `discountAmount` | Ya | Angka Rupiah, tidak boleh melebihi subtotal. |
| `adminNote` | Tidak | Catatan internal order. |
| `items` | Ya | 1 sampai 20 item manual/katalog. |

Setiap item berisi `productSlug` opsional, `itemName`, `quantity`, `unitPrice`, opsi custom, dan
catatan admin. Jika `productSlug` diisi, server memvalidasi produk aktif dan menyimpan snapshot.
Total order dihitung ulang server-side.

Status order diubah melalui:

```text
POST /admin-daz/orders/[id]/actions
  action=update_status
```

Link publik order dibuat ulang melalui action yang sama dengan `action=regenerate_public_link`.

## Public Order Detail

Route publik:

| Route | Method | Akses | Tujuan |
| --- | --- | --- | --- |
| `/order/[orderNumber]?token=...` | `GET` | Public via token | Menampilkan ringkasan order terbatas. |

Aturan security:

- order number harus mengikuti format `DZT-YYYYMMDD-xxxxx`;
- token publik diverifikasi server-side terhadap hash di database;
- database tidak menyimpan raw token publik;
- halaman publik tidak menampilkan WhatsApp, email, catatan admin, atau full customer profile;
- metadata route memakai `noindex,nofollow`;
- public direct read Supabase untuk tabel order tidak dibuka.

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
- `app/produk/[slug]/page.tsx`;
- `features/catalog/components/product-detail-view.tsx`;
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

`LeadInquiryForm` aktif di `/produk/[slug]` dan mengirim data ke `/api/leads`.
Form mengumpulkan:

- nama;
- nomor WhatsApp;
- email opsional;
- tanggal acara opsional;
- budget opsional;
- catatan kebutuhan;
- consent penggunaan data.

Saat submit berhasil, data tersimpan sebagai lead dan user diberi opsi lanjut chat WhatsApp.
Komponen lama `components/inquiry-form.tsx` masih tersedia tetapi tidak dipakai route aktif.

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

## Analytics

Analytics belum aktif.

`app/layout.tsx` masih memiliki import/render `@vercel/analytics/next` yang dikomentari, dan package `@vercel/analytics` tidak terdaftar di `package.json`. Tidak ada analytics runtime aktif saat ini.

Jika analytics diaktifkan kembali, perlu ditambahkan dependency, consent/privacy review, dan dokumentasi opt-out bila diwajibkan.

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
| `id` | `string` | Identifier lokal dan slug URL detail `/produk/[slug]`. |
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

Route `/feedback/[id]` dan `/feedback/[id]/submit` tidak memakai session user. Aksesnya berbasis UUID request feedback dan diproses server-side. Submit feedback juga memiliki rate limit in-memory per IP sebelum parsing form dan upload foto.

`components/ui/sidebar.tsx` memiliki kode cookie untuk menyimpan state sidebar, tetapi komponen tersebut tidak dipakai oleh halaman aktif. Cookie itu bukan cookie autentikasi.

Tidak ada bearer token custom atau local storage session custom. Service-role key ada, tetapi hanya berada di server-only code untuk feedback.

## Keamanan dan Privasi

- Link external dengan target tab baru umumnya memakai `rel="noreferrer"`.
- Tidak ada secret di URL integrasi yang ditemukan.
- Nomor WhatsApp, email, Instagram, dan alamat dibaca dari `site_settings`, dengan fallback lokal.
- Feedback pelanggan disimpan di Supabase melalui Route Handler server-side; data feedback dan foto pelanggan perlu diperlakukan sebagai data privat.
- Submit feedback dapat mengembalikan HTTP `429` dengan header `Retry-After` jika rate limit terlampaui.
- Bila form kontak/inquiry diaktifkan, kebijakan privasi perlu menjelaskan data apa yang disimpan atau diteruskan ke WhatsApp.
- Link legal footer masih placeholder.

## Needs Confirmation

- Apakah kontak dan akun eksternal pada seed/fallback adalah identitas production resmi.
- Apakah analytics akan diaktifkan kembali dan provider apa yang dipakai.
- Apakah ada backend atau CRM eksternal yang digunakan secara operasional tetapi belum terhubung ke repository.
- Apakah Supabase akan menjadi CMS permanen atau hanya sumber data sementara.
- Siapa owner dan proses operasional upload gambar Supabase Storage.
- Apakah bisnis memerlukan consent management atau privacy policy khusus analytics.
