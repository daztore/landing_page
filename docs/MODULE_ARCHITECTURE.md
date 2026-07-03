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
