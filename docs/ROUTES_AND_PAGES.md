# Routes and Pages

## Router

Project menggunakan Next.js App Router karena route didefinisikan melalui folder `app/`.

## Daftar Route

| Route | File | Jenis | Tujuan |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Halaman utama | Landing page pemasaran dan kontak. |
| `/katalog` | `app/katalog/page.tsx` | Halaman katalog | Pencarian, filter, sorting, dan CTA produk. |
| `/produk/[slug]` | `app/produk/[slug]/page.tsx` | Publik dynamic | Detail produk katalog aktif, harga estimasi, dan form inquiry. |
| `/order/[orderNumber]` | `app/order/[orderNumber]/page.tsx` | Publik dynamic via token | Ringkasan order publik terbatas dengan metadata `noindex`. |
| `/api/leads` | `app/api/leads/route.ts` | Route Handler publik | Submit inquiry produk melalui `POST`. |
| `/feedback/[id]` | `app/feedback/[id]/page.tsx` | Publik dynamic | Form feedback pelanggan berbasis UUID, `force-dynamic`, dan `noindex`. |
| `/feedback/[id]/submit` | `app/feedback/[id]/submit/route.ts` | Route Handler publik | Submit feedback pelanggan melalui `POST`. |
| `/admin-daz` | `app/admin-daz/page.tsx` | Redirect | Redirect ke `/admin-daz/dashboard`. |
| `/admin-daz/login` | `app/admin-daz/login/page.tsx` | Publik | Login email/password admin. |
| `/admin-daz/forgot-password` | `app/admin-daz/forgot-password/page.tsx` | Publik | Form meminta email recovery password admin tanpa user enumeration. |
| `/admin-daz/forgot-password/request` | `app/admin-daz/forgot-password/request/route.ts` | Route Handler publik | `POST` request email recovery admin dengan validasi dan rate limit. |
| `/admin-daz/auth/callback` | `app/admin-daz/auth/callback/route.ts` | Route Handler publik | Callback Supabase Auth PKCE untuk recovery password admin. |
| `/admin-daz/reset-password` | `app/admin-daz/reset-password/page.tsx` | Publik via recovery session | Form membuat password admin baru setelah callback recovery valid. |
| `/admin-daz/unauthorized` | `app/admin-daz/unauthorized/page.tsx` | Publik | Halaman akses ditolak untuk user non-admin. |
| `/admin-daz/dashboard` | `app/admin-daz/(protected)/dashboard/page.tsx` | Protected | Ringkasan dan shortcut admin. |
| `/admin-daz/landing/**` | `app/admin-daz/(protected)/landing/` | Protected | CRUD konten landing page. |
| `/admin-daz/catalog/**` | `app/admin-daz/(protected)/catalog/` | Protected | CRUD kategori dan produk. |
| `/admin-daz/leads` | `app/admin-daz/(protected)/leads/page.tsx` | Protected | List lead dengan pagination, filter status, dan pencarian. |
| `/admin-daz/leads/[id]` | `app/admin-daz/(protected)/leads/[id]/page.tsx` | Protected dynamic | Detail lead, catatan follow-up, dan timeline status. |
| `/admin-daz/leads/[id]/actions` | `app/admin-daz/(protected)/leads/[id]/actions/route.ts` | Route Handler admin | `POST` update status/catatan lead. |
| `/admin-daz/orders` | `app/admin-daz/(protected)/orders/page.tsx` | Protected | List order dengan pagination, filter status, dan pencarian. |
| `/admin-daz/orders/new` | `app/admin-daz/(protected)/orders/new/page.tsx` | Protected | Form admin membuat order manual dari lead atau customer. |
| `/admin-daz/orders/actions` | `app/admin-daz/(protected)/orders/actions/route.ts` | Route Handler admin | `POST` membuat order manual draft. |
| `/admin-daz/orders/[id]` | `app/admin-daz/(protected)/orders/[id]/page.tsx` | Protected dynamic | Detail order, item, total, history, dan action status. |
| `/admin-daz/orders/[id]/actions` | `app/admin-daz/(protected)/orders/[id]/actions/route.ts` | Route Handler admin | `POST` update status order atau regenerasi link publik. |
| `/admin-daz/feedback` | `app/admin-daz/(protected)/feedback/page.tsx` | Protected | Kelola feedback request dan submission. |
| `/admin-daz/feedback/requests` | `app/admin-daz/(protected)/feedback/requests/route.ts` | Route Handler admin | `GET`/`POST` request feedback admin. |
| `/admin-daz/media` | `app/admin-daz/(protected)/media/page.tsx` | Protected | Shortcut pengelolaan media. |
| `/admin-daz/settings` | `app/admin-daz/(protected)/settings/page.tsx` | Protected | CRUD site settings. |
| `/robots.txt` | `app/robots.ts` | Metadata route | Robots policy; menolak `/admin-daz` dan `/feedback`. |
| `/sitemap.xml` | `app/sitemap.ts` | Metadata route | Sitemap untuk `/`, `/katalog`, dan produk aktif `/produk/[slug]`. |

Dynamic route aktif saat ini adalah `/produk/[slug]`, `/order/[orderNumber]`, dan `/feedback/[id]`.
Route group aktif adalah `app/admin-daz/(protected)`. Tidak ada catch-all route, parallel route,
atau intercepting route.

## Root Layout

File `app/layout.tsx` berlaku untuk seluruh route dan bertanggung jawab atas:

- elemen `<html lang="id">`;
- font Inter dan Playfair Display melalui `next/font/google`;
- metadata default;
- viewport dan theme color;
- import `app/globals.css`;
- provider global untuk route transition loading;
- Vercel Analytics belum aktif; import dan render analytics masih dikomentari.

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
- link detail ke `/produk/[slug]`;
- CTA WhatsApp per produk.

Pilihan `newest` tidak melakukan sorting tambahan karena data tidak memiliki tanggal. Urutan yang tampil adalah urutan array source.

## Route `/produk/[slug]`

`app/produk/[slug]/page.tsx` adalah halaman detail produk public dengan:

- `revalidate = 300`;
- validasi slug sesuai pola katalog;
- data detail dari `features/catalog/queries/getProductDetailBySlug()`;
- `notFound()` untuk slug invalid, produk tidak aktif, produk `source = 'feedback_request'`, atau
  kategori tidak aktif;
- metadata SEO dengan canonical `/produk/[slug]` dan Open Graph image produk;
- harga sebagai estimasi, bukan invoice final;
- form inquiry lead tanpa cart, checkout, order, payment, atau shipping;
- opsi lanjut WhatsApp setelah inquiry berhasil terkirim.

Jika Supabase tidak tersedia atau query error, halaman memakai fallback lokal untuk produk yang
ada di `lib/katalog-data.ts`. Jika Supabase berhasil tetapi produk tidak ditemukan/tidak aktif,
fallback tidak dipakai agar produk inactive tidak muncul ulang.

## Route `/feedback/[id]`

`app/feedback/[id]/page.tsx` adalah halaman feedback pelanggan dengan:

- `dynamic = "force-dynamic"`;
- metadata `robots` noindex/nofollow;
- validasi UUID melalui `getPublicFeedbackRequest()`;
- data request feedback dibaca server-side menggunakan service-role client;
- gambar produk di-resolve melalui Supabase Storage dan `getSafeImageSrc()`;
- form submit memakai `FeedbackSubmissionForm`.

Status request yang didukung:

- `pending`;
- `submitted`;
- `expired`.

Jika UUID tidak valid atau request tidak ditemukan, halaman memanggil `notFound()`.

## Route `/feedback/[id]/submit`

`app/feedback/[id]/submit/route.ts` menerima `POST` form feedback pelanggan.

Validasi yang dilakukan:

- UUID feedback request;
- rate limit in-memory per IP sebelum parsing form/upload;
- konfigurasi service-role Supabase;
- rating integer 1 sampai 5;
- minimal kritik/saran atau testimoni;
- jumlah foto maksimal 5;
- rekomendasi hanya dari daftar yang diperbolehkan;
- MIME type dan ukuran foto melalui helper feedback storage.

Route ini memakai `SUPABASE_SERVICE_ROLE_KEY` server-only melalui `lib/supabase/service-role.ts` karena public direct insert/read untuk tabel feedback sudah di-hardening oleh migration `005`.
Jika rate limit terlampaui, route mengembalikan HTTP `429` dengan header `Retry-After`.

## Route `/api/leads`

`app/api/leads/route.ts` menerima `POST` JSON untuk inquiry produk publik.

Validasi yang dilakukan:

- content type `application/json`;
- ukuran body maksimal 16 KB;
- rate limit in-memory per IP dan nomor WhatsApp;
- nama, WhatsApp, email opsional, product slug atau minat produk, tanggal acara, budget, catatan,
  consent, honeypot, dan time-to-submit ringan;
- validasi produk aktif server-side sebelum menyimpan `product_id` dan `product_snapshot`.

Route ini memakai `SUPABASE_SERVICE_ROLE_KEY` server-only melalui `lib/supabase/service-role.ts`
karena direct public insert/read untuk tabel `leads` dan `lead_messages` tidak dibuka.
Response public tidak mengembalikan full row lead.

## Route `/order/[orderNumber]`

`app/order/[orderNumber]/page.tsx` adalah halaman ringkasan order publik berbasis token dengan:

- `dynamic = "force-dynamic"`;
- query string wajib `?token=...`;
- validasi format order number `DZT-YYYYMMDD-xxxxx`;
- lookup server-side melalui `features/orders/queries/getPublicOrderDetail()`;
- verifikasi token terhadap hash di database;
- metadata `robots` noindex/nofollow;
- tampilan data terbatas: status, nama depan customer, tanggal relevan, item, total, dan timeline
  status;
- tanpa WhatsApp, email, catatan admin, token hint, atau data admin.

Jika order number/token invalid, service-role belum tersedia, atau hash token tidak cocok, halaman
memanggil `notFound()`. Route `/order` juga ditambahkan ke `robots.txt` disallow.

## Layout `/katalog`

`app/katalog/layout.tsx` mengambil navigation/contact dari Supabase. Deteksi viewport dipindahkan ke `KatalogLayoutShell`, sebuah Client Component:

- desktop menampilkan `SiteNavigation` dan `SiteFooter`;
- mobile menampilkan `KatalogHeader`;
- sebelum mount, layout sementara menampilkan navigasi dan footer standar.

`KatalogLayoutShell` memakai `matchMedia("(max-width: 767px)")` agar update hanya terjadi saat melewati breakpoint. Tombol back pada `KatalogHeader` memakai `router.back()`.

## Route Handlers

Route Handler aktif:

| File | Method | Akses | Fungsi |
| --- | --- | --- | --- |
| `app/api/leads/route.ts` | `POST` | Public | Submit inquiry produk dengan validasi dan rate limit. |
| `app/feedback/[id]/submit/route.ts` | `POST` | Public via link UUID | Submit feedback pelanggan dengan rate limit dasar dan upload foto ke bucket private. |
| `app/admin-daz/forgot-password/request/route.ts` | `POST` | Public via forgot password form | Meminta email recovery admin dengan validasi JSON, body limit, rate limit per IP/email hash, dan response generik. |
| `app/admin-daz/auth/callback/route.ts` | `GET` | Public via Supabase recovery link | Menukar recovery `code` menjadi session SSR dan redirect aman ke reset password. |
| `app/admin-daz/(protected)/feedback/requests/route.ts` | `GET` | Admin | List feedback request. |
| `app/admin-daz/(protected)/feedback/requests/route.ts` | `POST` | Admin | Membuat feedback request dari panel admin. |
| `app/admin-daz/(protected)/leads/[id]/actions/route.ts` | `POST` | Admin | Tambah catatan follow-up atau update status lead. |
| `app/admin-daz/(protected)/orders/actions/route.ts` | `POST` | Admin | Membuat order manual draft dari JSON tervalidasi. |
| `app/admin-daz/(protected)/orders/[id]/actions/route.ts` | `POST` | Admin | Update status order atau regenerasi link publik. |

Tidak ditemukan:

- Pages Router API route;
- Server Action;
- payment/shipping webhook.

Route admin, feedback, lead detail privat, dan order tokenized tetap tidak boleh masuk sitemap.
Robots menolak `/admin-daz`, `/feedback`, dan `/order`; route inquiry API tidak perlu diindeks.

## Admin Password Recovery

Flow lupa password admin:

```text
/admin-daz/login
-> /admin-daz/forgot-password
-> POST /admin-daz/forgot-password/request
-> Supabase recovery email
-> /admin-daz/auth/callback?next=/admin-daz/reset-password
-> /admin-daz/reset-password
-> /admin-daz/login?reset=success
```

Callback hanya menerima `next` internal yang diawali `/admin-daz/` dan menolak URL eksternal.
Jika code recovery invalid, callback mengarahkan user kembali ke `/admin-daz/forgot-password`
dengan pesan aman. Halaman reset password memerlukan session Supabase valid dan cookie recovery
singkat yang dibuat oleh callback. Setelah password diperbarui melalui `supabase.auth.updateUser()`,
client memanggil `supabase.auth.signOut()` dan kembali ke halaman login.

Form forgot password menampilkan pesan generik:

```text
Jika email tersebut terdaftar, link untuk mengatur ulang password akan dikirim.
```

Dengan demikian UI tidak mengonfirmasi apakah email tertentu terdaftar. Supabase Dashboard harus
mengizinkan Redirect URL aktual `/admin-daz/auth/callback`; `/admin-daz/reset-password` adalah
redirect internal aplikasi setelah code exchange, bukan redirect langsung dari Supabase.
Route request forgot password memvalidasi JSON, membatasi body 4 KB, dan menerapkan rate limit
in-memory per IP serta hash email sebelum memanggil Supabase Auth.

## Middleware

`proxy.ts` berjalan hanya untuk `/admin-daz/:path*` dan menyegarkan cookie Supabase Auth.
Protected route group memeriksa JWT melalui `getClaims()` dan allowlist `admin_users`.
User anonymous diarahkan ke login; user non-admin diarahkan ke halaman akses ditolak.
Route `/admin-daz/login`, `/admin-daz/forgot-password`, `/admin-daz/forgot-password/request`,
`/admin-daz/auth/callback`, dan `/admin-daz/reset-password` tetap boleh dilewati proxy karena proxy
hanya menyegarkan session dan tidak melakukan redirect akses.

## Loading, Error, dan Not Found

File loading yang tersedia:

- `app/loading.tsx`;
- `components/loading/daztore-loader.tsx`;
- `components/loading/route-loading-provider.tsx`.

Root layout memasang `RouteLoadingProvider` untuk klik navigasi internal. Loader:

- menunggu sekitar 180ms sebelum tampil agar transisi cepat tidak terasa lebih lambat;
- berhenti saat pathname berubah;
- memiliki minimum display pendek dan safety timeout;
- mengabaikan link external, WhatsApp, email, telepon, tab baru, download, dan hash-only anchor.

Belum ditemukan file:

- `error.tsx`;
- `global-error.tsx`;
- `not-found.tsx`.

Next.js tetap memakai perilaku default framework untuk error dan not found.

## Rendering dan Caching

Halaman utama, katalog, product detail, dan layout katalog menetapkan `revalidate = 300`. Konten Supabase diambil pada server dan dapat diperbarui melalui ISR, sedangkan interaksi katalog, inquiry form, dan section tertentu di-hydrate sebagai Client Component.

Route feedback, `/api/leads`, `/order/[orderNumber]`, dan protected admin bersifat dynamic karena
bergantung pada request/session, token, dan data privat.

Jika Supabase gagal atau dataset kosong, data lokal digunakan.

## Needs Confirmation

- Apakah route legal akan dibuat atau link footer harus diarahkan ke dokumen eksternal.
- Apakah anchor paket dan testimoni akan diaktifkan/diperbaiki.
- Apakah katalog harus tetap statis atau akan mengambil data dari backend/CMS.
