# Performance Baseline

Dokumen ini mencatat baseline performance Phase 0 sebelum fitur commerce besar dibuat.
Angka di bawah adalah lab measurement lokal, bukan field data dari user production.

## Measurement Context

Tanggal audit: 2026-07-03.

Environment:

- Next.js `16.2.7`;
- Lighthouse `12.8.2` via `npx --yes lighthouse`;
- Chrome headless lokal;
- local production server dari `npm run start`;
- Node.js lokal `v22.13.1`;
- npm lokal `10.9.2`;
- server sementara berjalan di `127.0.0.1:4123` untuk route publik dan `127.0.0.1:4124` untuk admin login.

Catatan:

- `.env.local` tersedia saat `next start`, tetapi value secret tidak dibaca atau dicatat.
- Lighthouse memakai data dan asset yang tersedia dari env lokal saat audit.
- Windows pada mesin audit me-reserve range port `2917-3216`, sehingga port baseline memakai `4123` dan `4124`.
- Lighthouse tidak mengukur INP field data. `TBT` dipakai sebagai proxy lab untuk interactivity risk.

Commands:

```bash
npm run build
npm run start -- -H 127.0.0.1 -p 4123
npx --yes lighthouse http://127.0.0.1:4123/ --output=json --quiet
npx --yes lighthouse http://127.0.0.1:4123/katalog --output=json --quiet
npx --yes lighthouse http://127.0.0.1:4123/ --preset=desktop --output=json --quiet
npx --yes lighthouse http://127.0.0.1:4123/katalog --preset=desktop --output=json --quiet
```

Admin login baseline memakai port `4124` dengan pattern command yang sama untuk
`/admin-daz/login`.

## Lighthouse Baseline

| Route | Mode | Performance | FCP | LCP | TBT | CLS | Speed Index | Transfer | A11y | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | Mobile | 90 | 1.33s | 3.32s | 39ms | 0.000 | 4.10s | 493.7 KB | 96 | 96 | 100 |
| `/katalog` | Mobile | 92 | 1.06s | 3.39s | 43ms | 0.000 | 1.42s | 454.1 KB | 88 | 96 | 100 |
| `/` | Desktop | 100 | 0.33s | 0.69s | 0ms | 0.000 | 0.44s | 535.4 KB | 96 | 96 | 100 |
| `/katalog` | Desktop | 100 | 0.29s | 0.63s | 0ms | 0.000 | 0.29s | 498.8 KB | 92 | 96 | 100 |

Interpretasi:

- Mobile LCP berada di sekitar 3.3s untuk `/` dan `/katalog`; ini masih usable, tetapi perlu dijaga saat menambah fitur commerce.
- CLS `0.000` pada route publik adalah baseline yang harus dipertahankan.
- TBT mobile masih rendah, tetapi script transfer publik perlu dipantau ketika menambah Client Component atau dependency.
- Accessibility `/katalog` lebih rendah dari `/` dan perlu diaudit bila ada pekerjaan UX/accessibility terpisah.

## Admin Route Baseline

Route admin yang dapat diukur tanpa credential adalah `/admin-daz/login`.

| Route | Mode | Performance | FCP | LCP | TBT | CLS | Speed Index | Transfer | Script Transfer | A11y | Best Practices | SEO |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/admin-daz/login` | Mobile | 98 | 1.07s | 2.27s | 75ms | 0.000 | 1.07s | 345.1 KB | 223.5 KB | 95 | 96 | 66 |
| `/admin-daz/login` | Desktop | 100 | 0.29s | 0.66s | 0ms | 0.000 | 0.29s | 345.1 KB | 223.5 KB | 95 | 96 | 66 |

Catatan:

- SEO admin login bukan target publik dan tidak perlu dioptimalkan seperti halaman marketing.
- Protected admin pages memerlukan session sehingga tidak diukur pada baseline ini.

## Resource Transfer Baseline

| Route | Mode | Total | Script | Image | Font | CSS | Document |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | Mobile | 489.8 KB | 189.8 KB | 155.4 KB | 85.4 KB | 26.0 KB | 24.5 KB |
| `/katalog` | Mobile | 450.3 KB | 174.2 KB | 152.1 KB | 85.4 KB | 26.0 KB | 12.5 KB |
| `/` | Desktop | 531.5 KB | 189.8 KB | 197.1 KB | 85.4 KB | 26.0 KB | 24.5 KB |
| `/katalog` | Desktop | 494.9 KB | 174.2 KB | 188.9 KB | 85.4 KB | 26.0 KB | 12.5 KB |
| `/admin-daz/login` | Mobile/Desktop | 345.1 KB | 223.5 KB | 0 KB | 85.4 KB | 26.0 KB | n/a |

Public script requests loaded by Lighthouse did not include admin route URLs. Source scan
also did not find `admin-daz` imports in the public landing/katalog entry points checked
during this audit.

## Image Baseline

Largest local fallback files in `public/`:

| Asset | Size |
| --- | ---: |
| `hero-mahar.webp` | 299.0 KB |
| `gallery-1.jpg` | 167.2 KB |
| `gallery-6.jpg` | 165.7 KB |
| `gallery-3.jpg` | 161.6 KB |
| `hero-mahar.jpg` | 124.0 KB |
| `hero-mahar-old.jpg` | 124.0 KB |
| `story-hands.jpg` | 91.6 KB |
| `gallery-4.jpg` | 75.9 KB |
| `gallery-5.jpg` | 73.6 KB |
| `bouquet-bg.jpg` | 67.1 KB |
| `gallery-2.jpg` | 66.1 KB |

Largest image transfers observed in mobile Lighthouse:

| Route | Image role | Transfer |
| --- | --- | ---: |
| `/` | Story/section image from Storage via Next Image | 87.6 KB |
| `/` | Hero image from Storage via Next Image | 67.8 KB |
| `/katalog` | Product/catalog image from Storage via Next Image | 60.0 KB |
| `/katalog` | Product/catalog image from Storage via Next Image | 52.3 KB |
| `/katalog` | Product/catalog image from Storage via Next Image | 22.4 KB |
| `/katalog` | Product/catalog image from Storage via Next Image | 17.4 KB |

## Regression Checklist

Jalankan sebelum merge fitur besar, terutama commerce, catalog, admin, dan image changes:

- `npm run build`;
- Lighthouse mobile dan desktop untuk `/`;
- Lighthouse mobile dan desktop untuk `/katalog`;
- cek `/admin-daz/login` jika task menyentuh admin shell/auth;
- pastikan public route tidak memuat request admin route atau data admin;
- pastikan mobile CLS tetap `<= 0.05`;
- pastikan mobile TBT tetap `<= 100ms` untuk route publik;
- pastikan mobile LCP `/` dan `/katalog` tidak naik jauh dari baseline 3.3s tanpa alasan;
- pastikan script transfer publik tidak naik lebih dari sekitar 15% tanpa justifikasi;
- audit ukuran image bila hero, gallery, atau catalog asset berubah.

## Follow-Up Candidates

- Optimalkan LCP mobile pada `/` dan `/katalog` jika fitur baru menambah beban.
- Review accessibility `/katalog` dalam task QA/accessibility terpisah.
- Pertimbangkan image budget untuk asset Supabase Storage sebelum katalog bertambah besar.
- Pertimbangkan field monitoring atau RUM bila traffic production sudah stabil.
