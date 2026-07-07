# Commerce Preparation

Dokumen ini berisi persiapan sebelum project masuk ke fitur commerce/order online.

Dokumen ini bukan izin untuk langsung membangun order, payment, shipping, cart, checkout, atau customer account. Implementasi hanya boleh dilakukan melalui task spesifik sesuai roadmap.

## Business Flow Recommended

Flow yang direkomendasikan:

```text
Landing Page
  -> Catalog
  -> Product Detail
  -> Inquiry / Consultation
  -> Admin Follow Up
  -> Manual Order
  -> Payment Invoice
  -> Production
  -> Shipping
  -> Tracking
  -> Completed
```

Untuk bisnis produk custom seperti mahar, seserahan, bouquet, hampers, dan wedding gift, lebih aman memulai dari inquiry dan manual order sebelum checkout publik penuh.

Alasan:

- Banyak pesanan membutuhkan konsultasi.
- Harga bisa bergantung pada custom request.
- Ketersediaan slot produksi perlu dikonfirmasi admin.
- Risiko refund/cancel lebih rendah jika order manual matang dulu.
- Payment online lebih aman jika order status dan invoice sudah stabil.

## What Not To Build Yet

Jangan membangun fitur berikut pada fase dokumentasi/persiapan:

- checkout publik;
- cart;
- customer account;
- payment gateway aktif;
- webhook payment production;
- shipping API production;
- tracking publik production;
- auto-create order dari form publik tanpa review admin.

## Data Yang Perlu Disiapkan

### Payment

Data umum:

- provider yang dipakai;
- mode sandbox/production;
- daftar payment method;
- aturan invoice expired;
- aturan settlement/reconciliation;
- aturan refund/cancel;
- mapping status provider ke status internal;
- owner operasional payment;
- runbook saat provider down.

### Xendit

Yang perlu disiapkan:

- Account Xendit.
- Secret key.
- Webhook token.
- Callback URL production.
- Payment method yang diaktifkan.
- Settlement/reconciliation flow.
- Testing/sandbox mode.
- Mapping status Xendit ke status internal.
- Runbook retry dan duplicate webhook.

### Midtrans

Yang perlu disiapkan:

- Account Midtrans.
- Server key.
- Client key.
- Merchant ID.
- Environment sandbox/production.
- Notification URL/webhook URL.
- Payment method yang diaktifkan.
- Testing/sandbox mode.
- Mapping status Midtrans ke status internal.
- Runbook retry dan duplicate notification.

Catatan: jangan hardcode provider. Gunakan payment provider abstraction agar provider dapat diganti atau ditambah di masa depan.

### Shipping

Yang perlu disiapkan:

- Provider ongkir/tracking, misalnya RajaOngkir/Komerce atau provider lain.
- API key.
- Origin city/subdistrict.
- Supported courier.
- Service type.
- Shipping rate endpoint.
- Tracking endpoint.
- Format resi.
- Handling manual shipment jika API gagal.
- Mapping status provider ke status internal.
- Kebijakan biaya handling/packing.

### Order

Yang perlu disiapkan:

- Format nomor order.
- Status order.
- Status payment.
- Status shipment.
- Invoice format.
- Flow refund/cancel.
- Admin role/permission untuk order.
- Public order tracking URL.
- Order expiration policy.
- Batas edit order setelah invoice/payment.
- Audit trail untuk perubahan status dan total.

### Customer

Yang perlu disiapkan:

- Nama customer.
- WhatsApp.
- Email opsional.
- Alamat.
- Kota/kecamatan.
- Catatan custom.
- Consent/privacy policy.
- Mekanisme update data.
- Mekanisme hapus/anonymize data jika dibutuhkan.

## Status Internal

### Lead Status

- `new`
- `contacted`
- `quoted`
- `converted`
- `cancelled`

## Phase 1 Product Detail And Lead Preparation

Bagian ini menyelesaikan preparation Phase 1. Ini bukan migration plan final dan belum membuat
fitur runtime.

### Product Detail Entry Point

Product detail adalah pintu masuk utama sebelum inquiry:

```text
/katalog
  -> /produk/[slug]
  -> inquiry / consultation
  -> admin follow-up
```

Keputusan:

- Route public yang disiapkan adalah `/produk/[slug]`.
- Detail produk hanya membaca produk aktif dari katalog dan kategori aktif.
- Produk yang berasal dari `feedback_request`, draft, inactive, atau tidak available untuk publik
  tidak boleh ditampilkan sebagai detail SEO.
- Harga di detail produk tetap ditampilkan sebagai estimasi, bukan invoice.
- CTA utama tetap konsultasi/inquiry. Jangan membuat cart atau checkout dari halaman detail.
- `/katalog` tetap menjadi list existing dan tidak boleh bergantung pada detail page agar fallback
  katalog lama tetap aman.

Implementasi Phase 2 pada 2026-07-06:

- Route `/produk/[slug]` sudah aktif untuk produk katalog aktif.
- Detail produk dibaca melalui `features/catalog` dengan cache `revalidate = 300`.
- Harga tetap estimasi dan CTA utama memakai konsultasi WhatsApp.
- Sitemap menambahkan URL produk aktif.
- Form inquiry tersimpan database, admin lead management, manual order, payment, shipping, cart,
  checkout, dan customer account belum dibuat.

Kontrak minimal product detail:

| Field | Tujuan |
| --- | --- |
| `slug` | URL public dan identifier stabil. |
| `title` | Nama produk. |
| `category` | Slug dan nama kategori aktif. |
| `description` | Deskripsi detail. |
| `price.start`, `price.end`, `price.label` | Estimasi harga, bukan total final. |
| `image.src`, `image.alt` | Gambar aman dari bucket `catalogs` atau fallback lokal. |
| `processingTime` | Estimasi pengerjaan. |
| `customizable` | Indikator bisa custom. |
| `available` | Sinyal ketersediaan untuk CTA. |
| `inquiry.defaultMessage` | Pesan awal untuk inquiry/konsultasi. |

### Lead Data Model Preparation

Tabel yang dirancang untuk Phase 2:

- `leads`
- `lead_messages`

Implementasi Phase 2 pada 2026-07-06:

- Tabel `leads` dan `lead_messages` sudah dibuat melalui migration
  `supabase/migrations/006_create_leads_feature.sql`.
- Public submit memakai `/api/leads`, validasi server-side, rate limit in-memory, honeypot, dan
  service-role server-only.
- Direct public insert/read Supabase untuk lead tidak dibuka.
- Admin lead management aktif di `/admin-daz/leads` dan `/admin-daz/leads/[id]`.
- Perubahan status disimpan di `lead_messages` melalui RPC `public.change_lead_status()`.
- Convert ke order tetap belum dibuat; Phase 3 manual order harus diminta terpisah.

Rancangan awal `leads`:

| Field | Tujuan |
| --- | --- |
| `id` | UUID internal. |
| `source` | Sumber lead: `product_detail`, `catalog`, `landing`, atau `admin_manual`. |
| `status` | Status lead dari daftar resmi. |
| `customer_name` | Nama customer. |
| `whatsapp_number` | Kontak follow-up utama. |
| `email` | Opsional. |
| `product_id` | Referensi produk bila lead berasal dari produk aktif. |
| `product_slug` | Snapshot slug untuk fallback diagnosis. |
| `product_snapshot` | Snapshot nama, kategori, harga estimasi, dan gambar produk saat inquiry dibuat. |
| `interest_category` | Minat umum jika belum memilih produk tertentu. |
| `event_date` | Tanggal acara bila customer mengisi. |
| `budget_range` | Range budget non-final. |
| `message` | Catatan customer. |
| `consent_accepted` | Wajib untuk submit public. |
| `consent_text` | Snapshot teks consent/privacy acknowledgement. |
| `metadata` | Source URL, campaign non-sensitif, atau user agent ringkas. |
| `created_at`, `updated_at` | Audit waktu dasar. |
| `last_contacted_at` | Diisi saat follow-up. |
| `assigned_admin_id` | Opsional untuk assignment admin. |

Rancangan awal `lead_messages`:

| Field | Tujuan |
| --- | --- |
| `id` | UUID internal. |
| `lead_id` | Relasi ke `leads`. |
| `message_type` | `customer_message`, `admin_note`, `status_change`, atau `system`. |
| `channel` | `form`, `whatsapp`, `phone`, `email`, `admin`, atau `system`. |
| `body` | Isi pesan atau catatan follow-up. |
| `status_from`, `status_to` | Diisi untuk event perubahan status. |
| `created_by` | Admin actor bila ada. |
| `created_at` | Waktu pesan/event. |

Status lead resmi:

| Status | Arti |
| --- | --- |
| `new` | Lead baru masuk dan belum difollow-up. |
| `contacted` | Admin sudah menghubungi customer. |
| `quoted` | Admin sudah memberi estimasi/penawaran. |
| `converted` | Lead berubah menjadi order manual pada fase order. |
| `cancelled` | Lead dibatalkan atau tidak dilanjutkan. |

### Admin Lead Flow Preparation

Flow admin yang disiapkan:

```text
lead masuk
  -> admin lihat list lead dengan pagination
  -> admin buka detail lead
  -> admin tambah note/follow-up
  -> admin ubah status melalui lead service
  -> bila cocok, admin convert ke manual order pada Phase 3
```

Aturan:

- Route admin lead yang disiapkan: `/admin-daz/leads` dan `/admin-daz/leads/[id]`.
- Lead list harus mendukung pagination, filter status, dan pencarian nama/WhatsApp/produk.
- Detail lead menampilkan snapshot produk agar konteks lama tidak berubah saat produk diedit.
- Status lead tidak boleh diubah langsung dari banyak tempat; gunakan lead service.
- Convert ke order tidak dibuat pada Phase 1 dan tidak boleh otomatis dari form public.

### Public Inquiry Abuse Prevention

Sebelum inquiry public aktif:

- submit harus lewat Route Handler server-side;
- direct public insert ke Supabase untuk `leads` dan `lead_messages` tidak dibuka;
- validasi wajib: nama, WhatsApp, source, product slug bila ada, consent, panjang pesan, dan body
  size;
- rate limit minimal berdasarkan IP dan source route;
- tambahkan honeypot dan time-to-submit jika spam mulai terlihat;
- error public harus generik;
- log server tidak boleh memuat data pribadi berlebihan;
- untuk multi-instance, ganti rate limit in-memory dengan store terpusat.

### Notification Preparation

Notifikasi awal tidak boleh menyimpan secret di client.

Opsi aman:

- tampilkan lead baru di admin dashboard/list sebagai baseline tanpa provider eksternal;
- gunakan WhatsApp deeplink public hanya sebagai CTA customer, bukan sebagai provider notification;
- jika email/WhatsApp provider dipakai nanti, panggil dari server-side notification service dengan
  secret runtime server-only;
- catat hasil notifikasi pada `lead_messages` atau metadata event tanpa menyimpan token/secret.

### Order Status

- `draft`
- `confirmed`
- `waiting_payment`
- `paid`
- `in_production`
- `ready_to_ship`
- `shipped`
- `completed`
- `cancelled`

## Phase 3 Manual Order Implementation

Implementasi Phase 3 pada 2026-07-06:

- Tabel `orders`, `order_items`, dan `order_status_histories` sudah dibuat melalui migration
  `supabase/migrations/007_create_orders_feature.sql`.
- Admin dapat membuat order manual dari lead atau input customer manual melalui
  `/admin-daz/orders/new`.
- Detail lead menyediakan shortcut ke create order. Jika order dibuat dari lead, lead ditandai
  `converted` melalui service/RPC lead existing.
- Order baru selalu berstatus `draft`; status ini bukan transaksi final dan belum berarti payment
  atau produksi dimulai.
- Item order menyimpan snapshot produk katalog saat order dibuat, termasuk nama, kategori, harga
  estimasi, dan metadata produk yang aman.
- Item manual didukung untuk kebutuhan custom yang tidak berasal dari katalog.
- Total order dihitung ulang server-side dari item dan diskon manual.
- Public order detail tersedia di `/order/[orderNumber]?token=...` dengan token publik yang
  disimpan sebagai hash di database.
- Halaman publik order menampilkan data terbatas: status, nama depan customer, tanggal relevan,
  item, total, dan timeline status tanpa WhatsApp/email/catatan admin.
- Payment provider, payment transaction, webhook payment, shipping/tracking, cart, checkout, dan
  customer account belum dibuat.

Aturan operasional Phase 3:

- Jangan mengubah status order langsung dari UI/route selain melalui order service.
- Status `paid`, `ready_to_ship`, dan `shipped` pada Phase 3 bersifat catatan manual admin, bukan
  hasil integrasi provider.
- Jika perlu membagikan order ke customer, gunakan link publik yang dibuat saat create order atau
  regenerasi link dari detail order.

### Payment Status

- `pending`
- `paid`
- `failed`
- `expired`
- `refunded`
- `cancelled`

### Shipment Status

- `pending`
- `ready_to_ship`
- `picked_up`
- `in_transit`
- `delivered`
- `failed`
- `returned`

## Database Candidate

Tabel berstatus `ACTIVE` sudah memiliki migration sesuai phase. Tabel `PLANNED` belum boleh dibuat
tanpa task implementasi/migration khusus.

| Table | Status | Deskripsi singkat |
| --- | --- | --- |
| `customers` | PLANNED | Data profil customer minimal seperti nama, WhatsApp, email opsional, dan consent metadata. |
| `customer_addresses` | PLANNED | Alamat customer untuk pengiriman, dengan kota/kecamatan dan catatan alamat. |
| `leads` | ACTIVE PHASE 2 | Inquiry/konsultasi awal sebelum menjadi order. |
| `lead_messages` | ACTIVE PHASE 2 | Riwayat pesan/catatan follow-up lead dan status change. |
| `orders` | ACTIVE PHASE 3 | Header order manual, nomor order, customer, total, token publik hash, dan status. |
| `order_items` | ACTIVE PHASE 3 | Item order dengan snapshot produk, harga, opsi custom, catatan, dan quantity. |
| `order_status_histories` | ACTIVE PHASE 3 | Riwayat perubahan status order beserta actor, timestamp, dan catatan. |
| `payment_transactions` | PLANNED | Data transaksi payment provider, provider reference, amount, currency, dan status. |
| `payment_webhook_events` | PLANNED | Raw event webhook payment untuk idempotency, audit, dan diagnosis. |
| `shipments` | PLANNED | Data pengiriman, courier, service, resi, alamat ringkas, dan status. |
| `shipment_tracking_events` | PLANNED | Timeline tracking pengiriman dari provider atau input manual admin. |
| `audit_logs` | PLANNED | Catatan aktivitas sensitif admin/sistem untuk audit. |

## Important Commerce Rule

- Order item harus menyimpan snapshot produk.
- Payment webhook harus disimpan sebagai event.
- Perubahan status order harus masuk history.
- Jangan mengandalkan data produk live untuk order lama.
- Jangan update order status langsung dari banyak tempat; gunakan order service.
- Jangan update payment status dari client.
- Jangan update shipment status dari payment module.
- Jangan simpan credential provider di database aplikasi biasa.

## Payment Provider Abstraction

Interface awal yang perlu dirancang:

```ts
interface PaymentProvider {
  createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult>
  verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedWebhookEvent>
  getPaymentStatus(input: PaymentStatusInput): Promise<PaymentStatusResult>
}
```

Prinsip:

- Order module tidak tahu detail Xendit/Midtrans.
- Payment module tidak mengubah order langsung tanpa order service.
- Provider response disimpan secukupnya untuk audit.
- Secret provider hanya berada di server runtime.

## Shipping Provider Abstraction

Interface awal yang perlu dirancang:

```ts
interface ShippingProvider {
  getRates(input: ShippingRateInput): Promise<ShippingRateResult[]>
  getTrackingStatus(input: TrackingInput): Promise<TrackingResult>
}
```

Prinsip:

- Shipping module tidak mengubah payment.
- Shipment event selalu disimpan sebagai timeline.
- Provider failure harus punya fallback manual.
- Tracking publik hanya menampilkan data yang aman untuk customer.

## Recommended Rollout Sequence

1. Product detail.
2. Inquiry form.
3. Admin lead management.
4. Manual order management.
5. Public order detail.
6. Payment provider abstraction.
7. Payment sandbox integration.
8. Webhook validation and idempotency.
9. Manual shipping management.
10. Shipping rate/tracking provider.
11. Public checkout, bila fase sebelumnya stabil.

## Acceptance Criteria Before Payment Online

- Order data model stabil.
- Order item snapshot tersedia.
- Order status history tersedia.
- Admin bisa membuat dan mengoreksi order draft.
- Public order detail aman.
- Payment transaction table tersedia.
- Webhook event table tersedia.
- Webhook signature/token tervalidasi.
- Idempotency sudah diuji.
- Sandbox payment diuji end-to-end.
- Error handling dan reconciliation flow terdokumentasi.

## Acceptance Criteria Before Public Checkout

- Product detail stabil.
- Inquiry/order manual sudah berjalan.
- Payment online stabil.
- Shipping/tracking dasar siap.
- Customer privacy policy tersedia.
- Rate limit tersedia.
- Form validation server-side tersedia.
- Fraud/abuse scenario dasar dipikirkan.
- Performance baseline setelah payment/order masih aman.
