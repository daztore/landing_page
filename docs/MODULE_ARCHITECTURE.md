# Module Architecture

Dokumen ini menjelaskan arah arsitektur modular untuk pengembangan jangka panjang.

Pendekatan yang disarankan saat ini adalah modular monolith.

## Why Modular Monolith

Alasan:

- Project masih bisa dikelola dalam satu repo.
- Deployment lebih sederhana.
- Cocok untuk fase awal commerce.
- Lebih mudah menjaga konsistensi UI, auth, dan data model.
- Tetap bisa dipisah nanti jika kompleksitas meningkat.

Jangan langsung memisahkan frontend/backend hanya karena roadmap commerce ada. Pemisahan baru layak dievaluasi jika domain logic, traffic, background job, atau integrasi eksternal sudah cukup kompleks.

## Current Structure Summary

Struktur saat ini masih berbasis Next.js App Router:

```text
app/
  page.tsx
  katalog/
  feedback/
  admin-daz/
components/
  admin-daz/
  feedback/
  katalog/
  loading/
  shared/
  ui/
lib/
  admin-daz/
  data/
  feedback/
  security/
  supabase/
supabase/
  migrations/
  seed.sql
docs/
```

Struktur existing boleh dipertahankan. Modularisasi dilakukan bertahap saat fitur baru dibuat, bukan melalui refactor massal.

## Phase 1 Architecture Decision 2026-07-05

Keputusan untuk roadmap `[P0] Define modular architecture`:

- Project tetap memakai modular monolith di satu Next.js app.
- Folder `features/` mulai dibuat saat roadmap item baru membutuhkan domain module nyata,
  bukan sebagai folder kosong. Trigger pertama yang aman adalah implementasi product detail,
  lead/inquiry, order, payment, shipping, atau customer yang memiliki data contract dan service
  sendiri.
- Kode existing di `app/`, `components/`, dan `lib/` tidak dipindahkan massal. Jika fitur baru
  perlu memakai logic lama, buat adapter kecil atau public function yang jelas terlebih dahulu.
- `app/` hanya menjadi route orchestration dan presentation boundary: page/layout/Route Handler
  boleh memanggil service/query module, tetapi tidak boleh menyimpan business workflow besar,
  query kompleks, atau integrasi provider langsung.
- Data access lintas modul harus lewat service/query layer yang diexport secara eksplisit dari
  module terkait. Hindari deep import ke file internal module lain.

### When To Create `features/`

Buat `features/<domain>/` hanya jika minimal satu kondisi berikut terpenuhi:

- domain baru memiliki route/page/admin flow dari roadmap yang mulai diimplementasikan;
- domain membutuhkan data model, validation, dan service/query yang dipakai lebih dari satu
  route atau component;
- domain akan dipakai lintas area, misalnya product detail dipakai public page dan admin;
- integrasi eksternal atau workflow status perlu boundary yang mudah diaudit.

Jangan membuat `features/` hanya untuk merapikan tree. Untuk pekerjaan dokumentasi atau desain,
cukup update dokumen sampai ada implementasi yang benar-benar membutuhkan folder tersebut.

Struktur awal module yang disarankan saat module dibuat:

```text
features/<domain>/
  components/        UI spesifik domain bila tidak reusable global
  queries/           read-only data access dan list/detail query
  services/          mutation, workflow, provider orchestration
  validation/        schema input dan domain validation
  types.ts           kontrak data domain
  index.ts           public exports yang boleh dipakai module lain
```

Folder bersifat opsional. Buat hanya bagian yang benar-benar dipakai.

### Module Boundary Matrix

| Module | Tanggung jawab | Boleh depend ke | Tidak boleh depend ke |
| --- | --- | --- | --- |
| `features/catalog` | kategori, produk, product detail, pricing display | `shared`, `server` bila server-only | `orders`, `payments`, `shipping` |
| `features/feedback` | feedback request, submission, upload foto, admin review | `shared`, `server` bila server-only | `leads`, `orders`, `payments`, `shipping` |
| `features/leads` | inquiry, konsultasi awal, follow-up admin | `catalog` lewat query/service, `customers` bila sudah ada | `payments`, `shipping`, auto-create order publik |
| `features/customers` | identitas customer minimal, address, consent/privacy | `shared`, `server` bila server-only | `payments`, `shipping`; jangan expose data pribadi ke publik tanpa auth/token aman |
| `features/orders` | order manual, item snapshot, status workflow, history | `catalog`, `customers`, `leads` lewat service/query resmi | provider payment/shipping langsung, update status dari banyak tempat |
| `features/payments` | invoice, transaction, webhook event, provider abstraction | `orders` lewat order service | UI catalog, direct order table update tanpa order service |
| `features/shipping` | shipment, rate/tracking, tracking event, provider abstraction | `orders` lewat order service | payment state mutation |

### Import Rules

- `shared/*` boleh dipakai oleh semua module, tetapi `shared` tidak boleh import `features/*`.
- `server/*` hanya untuk server-side code dan tidak boleh diimport Client Component.
- `app/*` boleh import public API dari module, misalnya `features/catalog`, bukan file internal
  seperti `features/catalog/queries/private-query`.
- Module yang membutuhkan data module lain harus memakai function service/query yang diexport
  resmi, bukan query database langsung ke tabel milik module lain.
- Payment dan shipping tidak boleh mengubah order status langsung; gunakan order service.
- Client Component tidak boleh import service-role, server-only Supabase client, atau secret
  runtime.

### Service And Query Layer

Gunakan pembagian berikut saat module dibuat:

- `queries`: read-only, cache-aware bila cocok, memilih kolom yang dibutuhkan saja, dan aman
  dipakai oleh Server Component atau Route Handler.
- `services`: mutation, workflow status, transaksi bisnis, integrasi provider, dan operasi yang
  membutuhkan validasi server-side.
- `validation`: schema request/body/form dan domain validation yang bisa diuji tanpa UI.
- `types.ts`: tipe input/output public module dan snapshot data penting.
- `index.ts`: daftar export resmi module agar dependency antar module tetap terlihat.

Route Handler publik tetap wajib memvalidasi method, path param, body, rate limit, dan error
publik yang aman sebelum memanggil service.

## Phase 1 P1 Preparation 2026-07-05

Keputusan berikut menyelesaikan preparation untuk product detail, lead/inquiry, dan admin module
boundary. Tidak ada folder, route, migration, atau fitur runtime yang dibuat pada tahap ini.

### Product Detail Structure

Route public yang disiapkan:

```text
app/
  produk/
    [slug]/
      page.tsx
```

Keputusan:

- Route final adalah `/produk/[slug]`.
- Jangan membuat route group baru hanya untuk product detail. Route group `(marketing)` baru
  dievaluasi jika layout marketing benar-benar perlu dipisahkan.
- Data detail dibaca melalui `features/catalog/queries` saat module catalog mulai dibuat.
- Query detail harus membaca produk aktif saja, mengecualikan `source = 'feedback_request'`, dan
  memastikan kategori produk masih aktif.
- Jika slug tidak valid, produk tidak aktif, kategori tidak aktif, atau data tidak ditemukan,
  page harus memanggil `notFound()`.
- `/katalog` tetap berjalan dengan `getCatalogData()` dan contract `CatalogData` yang sudah ada.
  Product card boleh menambah link ke `/produk/[slug]` nanti, tetapi CTA WhatsApp existing tetap
  dipertahankan sebagai fallback konsultasi.

Kontrak data public yang disiapkan untuk product detail:

```ts
interface ProductDetail {
  slug: string
  title: string
  category: {
    slug: string
    name: string
  }
  description: string
  price: {
    start: number
    end?: number
    label: string
    isEstimate: true
  }
  image: {
    src: string
    alt: string
  }
  badge?: "bestseller" | "limited" | "loved"
  processingTime: string
  customizable: boolean
  available: boolean
  inquiry: {
    defaultMessage: string
  }
}
```

Slug policy:

- Gunakan `products.slug` sebagai sumber URL.
- Slug tetap unique dan mengikuti pola existing `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Jangan memakai nama produk sebagai primary identifier di route.
- Redirect slug lama hanya ditambahkan jika nanti ada kebutuhan rename slug production.

SEO dan image policy:

- `generateMetadata()` harus memakai title, deskripsi ringkas, canonical `/produk/[slug]`, dan OG
  image dari gambar produk yang sudah di-resolve aman.
- Produk detail aktif boleh masuk sitemap setelah route benar-benar dibuat.
- Produk draft/inactive, feedback request product, dan produk tanpa kategori aktif tidak boleh
  terindeks.
- Gambar tetap memakai object path bucket `catalogs` atau fallback lokal; jangan menyimpan full
  Supabase public URL sebagai source of truth.

### Phase 2 Product Detail Implementation 2026-07-06

Implementasi pertama `features/catalog` dibuat untuk roadmap Phase 2 `Product detail page`.

Struktur aktif:

```text
features/
  catalog/
    components/
      product-detail-view.tsx
    queries/
      product-detail.ts
    types.ts
    index.ts
```

Keputusan implementasi:

- `app/produk/[slug]/page.tsx` menjadi route orchestration dan presentation entry point.
- Query detail produk berada di `features/catalog/queries/getProductDetailBySlug()`.
- Kontrak `ProductDetail` berada di `features/catalog/types.ts` dan diexport melalui
  `features/catalog/index.ts`.
- Product detail memakai public Supabase read/RLS dan tidak memakai service-role.
- Product detail fallback lokal hanya dipakai saat Supabase tidak tersedia atau query error.
- Tidak ada dependency dari `features/catalog` ke leads, orders, payments, shipping, atau admin.
- Tidak ada migration, endpoint lead, cart, checkout, order, payment, atau shipping yang dibuat
  pada implementasi ini.

### Lead And Inquiry Module

Route/API yang disiapkan untuk implementasi berikutnya:

```text
app/
  api/
    leads/
      route.ts

features/
  leads/
    queries/
    services/
    validation/
    types.ts
    index.ts
```

Keputusan:

- Form inquiry public harus submit ke Route Handler server-side, bukan insert langsung dari client
  ke Supabase.
- Lead tidak boleh otomatis menjadi order. Konversi ke order manual dilakukan admin pada Phase 3.
- Lead boleh menyimpan referensi produk dan snapshot produk ringkas agar perubahan produk nanti
  tidak mengubah konteks inquiry lama.
- Lead service menjadi satu-satunya tempat perubahan status lead.
- Notification awal harus server-side. Jangan menaruh token WhatsApp provider, SMTP credential,
  atau secret integrasi lain di Client Component atau `NEXT_PUBLIC_*`.

Tabel yang disiapkan untuk migration khusus Phase 2:

```text
leads
lead_messages
```

Rancangan `leads`:

| Field | Catatan |
| --- | --- |
| `id uuid primary key` | Identifier internal. |
| `source text` | Contoh: `product_detail`, `catalog`, `landing`, `admin_manual`. |
| `status text` | `new`, `contacted`, `quoted`, `converted`, `cancelled`. |
| `customer_name text` | Wajib, dibatasi panjangnya. |
| `whatsapp_number text` | Wajib untuk follow-up awal. |
| `email text null` | Opsional. |
| `product_id uuid null` | Referensi produk jika inquiry berasal dari produk aktif. |
| `product_slug text null` | Snapshot slug untuk diagnosis dan fallback. |
| `product_snapshot jsonb not null default '{}'` | Nama, harga estimasi, kategori, dan gambar saat inquiry dibuat. |
| `interest_category text null` | Minat umum bila tidak memilih produk spesifik. |
| `event_date date null` | Tanggal acara bila tersedia. |
| `budget_range text null` | Range budget non-final. |
| `message text null` | Catatan customer. |
| `consent_accepted boolean` | Wajib `true` untuk submit publik. |
| `consent_text text` | Snapshot consent/privacy acknowledgement. |
| `metadata jsonb` | User agent ringkas, source URL, atau campaign non-sensitif. |
| `created_at timestamptz` | Waktu dibuat. |
| `updated_at timestamptz` | Diperbarui trigger. |
| `last_contacted_at timestamptz null` | Diisi saat admin follow-up. |
| `assigned_admin_id uuid null` | Opsional, referensi `admin_users`. |

Rancangan `lead_messages`:

| Field | Catatan |
| --- | --- |
| `id uuid primary key` | Identifier internal. |
| `lead_id uuid` | FK ke `leads` dengan `on delete cascade`. |
| `message_type text` | `customer_message`, `admin_note`, `status_change`, `system`. |
| `channel text` | `form`, `whatsapp`, `phone`, `email`, `admin`, `system`. |
| `body text` | Isi pesan/catatan tanpa secret. |
| `status_from text null` | Untuk event perubahan status. |
| `status_to text null` | Untuk event perubahan status. |
| `created_by uuid null` | Admin actor bila ada. |
| `created_at timestamptz` | Waktu event. |

RLS dan akses:

- Public `anon` tidak mendapat direct insert/update ke `leads` atau `lead_messages`.
- Route Handler public memakai validasi server-side dan memilih apakah memakai authenticated
  server client atau service-role server-only dengan alasan yang jelas.
- Admin read/write dibatasi ke authenticated user yang lolos `public.is_active_admin()`.
- Data lead tidak boleh dibaca oleh halaman publik tanpa token/auth khusus.

Abuse prevention minimal:

- Validasi method, content type, body size, nama, nomor WhatsApp, consent, produk, dan panjang
  pesan.
- Rate limit berdasarkan IP dan fingerprint non-sensitif; tambahkan key nomor WhatsApp bila aman.
- Honeypot field dan time-to-submit dapat ditambahkan sebelum form public aktif.
- Error public harus generik dan tidak membocorkan detail database.
- In-memory rate limit boleh untuk baseline single-instance, tetapi store terpusat diperlukan
  jika deployment multi-instance.

### Phase 2 Lead Implementation 2026-07-06

Implementasi `features/leads` dibuat untuk roadmap Phase 2 `Inquiry form`, `Admin lead
management`, dan `Lead status workflow`.

Struktur aktif:

```text
features/
  leads/
    components/
      admin-lead-actions.tsx
      lead-inquiry-form.tsx
    queries/
      admin-leads.ts
    services/
      admin-leads.ts
      create-lead.ts
    validation/
      lead-request.ts
    types.ts
    index.ts
    server.ts
```

Route aktif:

```text
app/
  api/
    leads/
      route.ts
  admin-daz/
    (protected)/
      leads/
        page.tsx
        [id]/
          page.tsx
          actions/
            route.ts
```

Keputusan implementasi:

- Form inquiry public berada di `features/leads/components/lead-inquiry-form.tsx` dan dipasang
  oleh route `/produk/[slug]`.
- Route Handler `/api/leads` menjadi satu-satunya public write entry point untuk inquiry.
- Public direct insert/read Supabase ke `leads` dan `lead_messages` tidak dibuka.
- Public lead insert memakai service-role server-only melalui `features/leads/services/create-lead.ts`
  karena RLS public write ditutup.
- Admin lead list/detail memakai Supabase Auth cookie session dan RLS admin, bukan service-role.
- Perubahan status admin melewati service lead dan RPC `public.change_lead_status()` agar status
  change dan history tersimpan bersama.
- `features/leads` boleh membaca produk aktif untuk snapshot lead, tetapi tidak membuat order.
- Tidak ada dependency dari `features/leads` ke orders, payments, shipping, cart, checkout, atau
  customers.

### Phase 3 Manual Order Implementation 2026-07-06

Implementasi `features/orders` dibuat untuk roadmap Phase 3 `Manual Order Management`.

Struktur aktif:

```text
features/
  orders/
    components/
      admin-order-actions.tsx
      admin-order-form.tsx
    queries/
      admin-orders.ts
      public-order.ts
    services/
      admin-orders.ts
      public-token.ts
    validation/
      order-request.ts
    types.ts
    index.ts
    server.ts
```

Route aktif:

```text
app/
  order/
    [orderNumber]/
      page.tsx
  admin-daz/
    (protected)/
      orders/
        page.tsx
        new/
          page.tsx
        actions/
          route.ts
        [id]/
          page.tsx
          actions/
            route.ts
```

Keputusan implementasi:

- `features/orders` menjadi boundary untuk order manual, order item snapshot, token publik,
  status workflow, dan history.
- Order dapat dibuat admin dari lead lewat `/admin-daz/orders/new?leadId=...` atau dari customer
  manual tanpa customer account.
- `features/orders` membaca produk aktif melalui API server `features/catalog/server.ts` untuk
  membuat snapshot item katalog.
- `features/orders` memakai API server `features/leads/server.ts` untuk validasi lead dan
  menandai lead sebagai `converted` saat order dibuat dari lead.
- Public order detail memakai `/order/[orderNumber]?token=...`; raw token tidak disimpan di
  database, hanya hash dan hint.
- Public direct read/write Supabase untuk `orders`, `order_items`, dan `order_status_histories`
  tidak dibuka. Admin memakai Supabase Auth cookie session dan RLS admin.
- Tidak ada dependency dari `features/orders` ke payments, shipping, cart, checkout, atau customer
  account.

### Admin Module Boundary

Route admin tetap berada di:

```text
/admin-daz/**
```

Rencana resource admin per domain:

| Domain | Route admin | Pola implementasi |
| --- | --- | --- |
| Landing/content | `/admin-daz/landing/**`, `/admin-daz/settings` | Generic resource manager tetap cukup. |
| Catalog | `/admin-daz/catalog/**` | Generic resource manager untuk kategori/produk; product detail tetap public concern. |
| Feedback | `/admin-daz/feedback` | Dedicated service/component karena punya workflow dan private photo. |
| Leads | `/admin-daz/leads`, `/admin-daz/leads/[id]` | Dedicated lead service/component, bukan generic CRUD murni. |
| Orders | `/admin-daz/orders/**` | Dedicated order workflow service aktif Phase 3. |
| Payments | `/admin-daz/payments/**` | Future read/audit workflow; provider action server-side. |
| Shipping | `/admin-daz/shipments/**` | Future shipment workflow service. |
| Customers | `/admin-daz/customers/**` | Future privacy-aware customer service. |

Aturan:

- Protected admin layout tetap memanggil `requireAdmin()`.
- CRUD admin tetap berjalan lewat Supabase Auth cookie session dan RLS. Service-role tidak boleh
  dipakai di Client Component admin.
- Generic `AdminResourceManager` hanya dipakai untuk resource konten atau katalog yang
  operasinya sederhana.
- Domain workflow seperti feedback, leads, orders, payments, shipping, dan customers memakai
  dedicated service agar status transition, audit, pagination, dan permission dapat dikontrol.
- Public page tidak boleh import `lib/admin-daz/*`, komponen admin, atau data admin.
- Audit trail untuk operasi sensitif disiapkan sebagai future `audit_logs` dan wajib dievaluasi
  sebelum order/payment/shipping production aktif.

## Recommended Future Structure

Struktur target jangka panjang:

```text
app/
  (marketing)/
    page.tsx
    katalog/
      page.tsx
    produk/
      [slug]/
        page.tsx

  (customer)/
    order/
      [orderNumber]/
        page.tsx
    checkout/
      page.tsx

  admin-daz/
    (protected)/
      dashboard/
      catalog/
      feedback/
      leads/
      orders/
      payments/
      shipments/
      customers/

  api/
    payments/
      xendit/
        webhook/
          route.ts
      midtrans/
        webhook/
          route.ts
    shipping/
      rates/
        route.ts
      tracking/
        route.ts

features/
  content/
  catalog/
  feedback/
  leads/
  orders/
  payments/
  shipping/
  customers/

shared/
  ui/
  lib/
  config/
  security/

server/
  supabase/
```

Catatan:

- Struktur ini adalah target bertahap.
- Jangan memindahkan folder besar hanya untuk membuat tree terlihat ideal.
- Buat module baru saat fitur baru benar-benar dibuat.
- Route lama harus tetap kompatibel.

## Module Responsibilities

### `features/content`

Untuk konten landing page, navigation, FAQ, gallery, testimonial, dan site settings.

Aturan:

- Tidak boleh bergantung pada order/payment/shipping.
- Boleh menyediakan read model untuk halaman publik.
- Boleh dipakai admin CMS.

### `features/catalog`

Untuk kategori produk, produk katalog, product detail, pricing display, dan product query.

Aturan:

- `features/catalog` tidak boleh import dari `features/orders`.
- `features/catalog` tidak boleh import dari `features/payments`.
- Data produk live tidak boleh menjadi satu-satunya sumber data order lama.
- Jika order membutuhkan produk, gunakan service/query catalog yang jelas.

### `features/feedback`

Untuk request feedback, submission, upload foto feedback, dan admin review feedback.

Aturan:

- Tetap pisahkan data feedback dari testimonial publik.
- Upload foto harus tervalidasi.
- Service-role key hanya boleh dipakai server-side.

### `features/leads`

Untuk inquiry, konsultasi awal, dan follow-up calon customer.

Aturan:

- Jangan langsung membuat order dari form publik tanpa review admin.
- Status lead harus terdokumentasi.
- Form publik harus divalidasi dan dirate-limit.

### `features/orders`

Untuk order manual, order item, status workflow, invoice data, dan history.

Aturan:

- `features/orders` boleh membaca catalog melalui service/query yang jelas.
- Order item wajib menyimpan snapshot produk.
- Perubahan status wajib melalui order service.
- Status history wajib dicatat.
- Jangan update order status langsung dari banyak tempat.

### `features/payments`

Untuk invoice payment, payment transaction, webhook event, dan provider abstraction.

Aturan:

- `features/payments` boleh depend ke `features/orders`.
- `features/payments` tidak boleh langsung mengubah order via query random.
- Update order harus melalui order service.
- Webhook wajib validasi signature/token dan idempotent.
- Jangan hardcode provider ke UI atau order domain.

### `features/shipping`

Untuk shipping rate, shipment, tracking event, dan provider abstraction.

Aturan:

- `features/shipping` boleh depend ke `features/orders`.
- `features/shipping` tidak boleh mengubah payment.
- Tracking event harus punya history.
- Jika API gagal, flow manual harus tetap mungkin.

### `features/customers`

Untuk data customer, address book, dan privacy/consent.

Aturan:

- Simpan data pribadi minimal sesuai kebutuhan bisnis.
- Data customer tidak boleh muncul di halaman publik tanpa token/auth yang aman.
- Customer account ditunda sampai checkout/order foundation stabil.

## Shared and Server Layers

### `shared/ui`

Untuk komponen UI reusable lintas fitur.

Aturan:

- Tidak boleh import logic domain.
- Tidak boleh import Supabase client langsung.
- Tidak boleh menyimpan business rule spesifik.

### `shared/lib`

Untuk helper umum seperti formatter, date, currency, validation helper umum, dan utility kecil.

Aturan:

- Tidak boleh memiliki dependency ke fitur domain.
- Hindari helper terlalu umum yang menyembunyikan business logic.

### `shared/config`

Untuk config typed yang aman, seperti public site URL, feature flag, dan metadata.

Aturan:

- Secret server-only jangan diexport ke client.
- Validasi env harus membedakan public dan server-only.

### `shared/security`

Untuk helper validasi input, safe URL, upload policy, dan security utility umum.

Aturan:

- Helper security harus kecil, jelas, dan mudah diaudit.

### `server/supabase`

Untuk Supabase client server, browser, service-role, dan admin helper bila nanti dipindah dari `lib/supabase`.

Aturan:

- Browser client memakai publishable key.
- Server/admin session client memakai publishable key + cookie/RLS.
- Service-role client memakai `server-only`.
- Service-role tidak boleh diimport dari Client Component.

## Dependency Direction

Allowed direction:

```text
shared -> boleh dipakai semua
server -> hanya server-side
features/catalog -> catalog only
features/orders -> boleh depend ke catalog/customers
features/payments -> boleh depend ke orders
features/shipping -> boleh depend ke orders
app -> orchestration/presentation only
```

Detailed rules:

- `app` boleh import feature service dan UI untuk render/orchestration.
- `app` tidak boleh menyimpan business rule besar.
- `shared` tidak boleh import `features`.
- `server` tidak boleh diimport oleh Client Component.
- `features/catalog` tidak boleh import `features/orders`.
- `features/orders` boleh membaca catalog/customer lewat service yang jelas.
- `features/payments` harus update order lewat order service.
- `features/shipping` tidak boleh mengubah payment state.

## Data Access Rules

- Query database harus berada di data/service layer.
- Component presentasional tidak boleh berisi query kompleks.
- Public query harus memilih kolom yang dibutuhkan saja.
- Admin query harus tetap dibatasi auth/RLS.
- Service-role query harus server-only dan punya alasan jelas.
- Hindari N+1 query.
- Tambahkan pagination untuk list yang bisa membesar.

## Route Group Plan

Route group seperti `(marketing)` dan `(customer)` hanya boleh dibuat bila:

- ada kebutuhan layout yang berbeda;
- route lama tetap kompatibel;
- tidak memindahkan file besar tanpa manfaat jelas;
- migration route diuji manual.

Untuk saat ini, route existing tetap boleh berada di struktur saat ini.

## Backend Separation Readiness

Pemisahan backend/frontend dapat dipertimbangkan bila:

- route handler payment/shipping/order makin kompleks;
- butuh background worker/job queue;
- butuh API contract publik/partner;
- Next.js route handler tidak cukup untuk workload tertentu;
- observability dan scaling terpisah benar-benar dibutuhkan.

Opsi masa depan:

- Next.js modular monolith tetap dipertahankan.
- Supabase Edge Function untuk webhook/worker kecil.
- Node.js/NestJS untuk backend domain yang kompleks.
- Go untuk service throughput tinggi.
- Laravel bila tim operasional lebih kuat di ekosistem PHP.

Keputusan pemisahan harus didahului API contract, migration plan, observability plan, dan rollback plan.

## Migration Strategy Toward Modules

Tahap aman:

1. Dokumentasikan boundary.
2. Tambahkan fitur baru ke modul baru.
3. Hindari memindahkan kode lama tanpa kebutuhan.
4. Jika kode lama perlu dipakai modul baru, buat adapter kecil.
5. Setelah fitur stabil, refactor bertahap dengan test/regression check.

Jangan melakukan "big bang refactor" hanya untuk merapikan struktur.
