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

Seluruh tabel di bawah berstatus `PLANNED` dan belum boleh dibuat tanpa task implementasi/migration khusus.

| Table | Status | Deskripsi singkat |
| --- | --- | --- |
| `customers` | PLANNED | Data profil customer minimal seperti nama, WhatsApp, email opsional, dan consent metadata. |
| `customer_addresses` | PLANNED | Alamat customer untuk pengiriman, dengan kota/kecamatan dan catatan alamat. |
| `leads` | PLANNED | Inquiry/konsultasi awal sebelum menjadi order. |
| `lead_messages` | PLANNED | Riwayat pesan/catatan follow-up lead. |
| `orders` | PLANNED | Header order, nomor order, customer, total, status, dan metadata invoice. |
| `order_items` | PLANNED | Item order dengan snapshot produk, harga, opsi custom, dan quantity. |
| `order_status_histories` | PLANNED | Riwayat perubahan status order beserta actor, timestamp, dan catatan. |
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
