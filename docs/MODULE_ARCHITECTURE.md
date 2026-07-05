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
