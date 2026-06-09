# Components

## Layout Utama

### `RootLayout`

Lokasi: `app/layout.tsx`

Tanggung jawab:

- metadata global;
- font global;
- stylesheet global;
- bahasa dokumen;
- Vercel Analytics pada production.

### `KatalogLayout`

Lokasi: `app/katalog/layout.tsx`

Tanggung jawab:

- memilih navigasi desktop atau header katalog mobile;
- menambahkan spacing untuk fixed navigation;
- menampilkan footer hanya pada desktop.

Route layout tetap Server Component agar dapat mengambil data Supabase. `KatalogLayoutShell` menggunakan `window.innerWidth` dan event `resize`.

## Komponen Aktif Halaman Utama

| Komponen | Tanggung jawab |
| --- | --- |
| `SiteNavigation` | Header fixed, menu mobile, bottom navigation mobile, deteksi halaman katalog, dan navigation props dari Supabase. |
| `Hero` | Hero copy, statistik, CTA, parallax ringan, gambar prioritas, dekorasi bunga. |
| `Story` | Narasi brand, gambar, dan tiga nilai layanan. |
| `OurProcess` | Empat langkah proses layanan. |
| `WhyChooseUs` | Empat alasan memilih layanan. |
| `Gallery` | Grid portofolio, lazy image, loading shimmer, dan lightbox keyboard. |
| `TestimonialsEnhanced` | Grid tiga testimonial statis. |
| `FaqSection` | Accordion FAQ berbasis state lokal. |
| `UrgencySection` | Social proof, informasi slot, dan CTA WhatsApp. |
| `FinalCta` | CTA akhir menuju WhatsApp dan email. |
| `SiteFooter` | Informasi brand, menu, kontak, Instagram, dan legal placeholder. |
| `WhatsappButton` | Tombol fixed yang muncul setelah scroll lebih dari 400px. |

## Komponen Katalog

### `KatalogPage`

Lokasi: `components/katalog/katalog-page.tsx`

State:

| State | Fungsi |
| --- | --- |
| `selectedCategory` | Filter kategori atau semua kategori. |
| `searchQuery` | Query pencarian client-side. |
| `sortBy` | Pilihan sorting. |
| `showFilters` | Membuka/menutup filter mobile. |

Data produk/kategori diterima dari Server Component dan difilter serta diurutkan melalui `useMemo`.

### `ProductCard`

Lokasi: `components/katalog/product-card.tsx`

Props:

| Prop | Type | Fungsi |
| --- | --- | --- |
| `product` | `Product` | Data produk yang akan ditampilkan. |

Tanggung jawab:

- format harga Rupiah;
- gambar produk;
- badge produk;
- processing time dan status custom;
- favorite state sementara;
- CTA WhatsApp dengan judul produk.

Favorite tidak dipersist ke local storage atau backend.

### `KatalogHeader`

Lokasi: `components/katalog/katalog-header.tsx`

Props:

| Prop | Type | Kondisi saat ini |
| --- | --- | --- |
| `searchQuery` | `string` | Diterima tetapi tidak digunakan dalam render. |
| `onSearchChange` | `(query: string) => void` | Diterima tetapi tidak dipanggil. |

Header mobile menyediakan tombol kembali dan tombol search visual. Tombol search belum memiliki handler.

## Komponen Pendukung

### `Reveal`

Props:

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` | wajib |
| `className` | `string` | tidak ada |
| `delay` | `number` | `0` |

Menggunakan `IntersectionObserver` untuk menambahkan class `is-visible`.

### `FloatingFlower`

Props:

| Prop | Type | Default |
| --- | --- | --- |
| `delay` | `number` | `0` |
| `duration` | `number` | `6` |
| `xStart` | `number` | `0` |
| `className` | `string` | string kosong |

Merender dekorasi SVG setelah component mount dan menjalankan animasi CSS fixed-position.

### `cn`

Lokasi: `lib/utils.ts`

Menggabungkan class menggunakan `clsx` dan menyelesaikan konflik utility Tailwind menggunakan `tailwind-merge`.

## Data Props

Section aktif menerima object typed dari `lib/data/types.ts`. Default prop berasal dari `lib/data/fallback.ts`, sehingga komponen tetap dapat dirender saat Supabase belum siap.

## Komponen Tersedia Tetapi Tidak Aktif

| Komponen | Kondisi |
| --- | --- |
| `Packages` | Render masih dikomentari sebagai Coming Soon; data tersedia di `package_tiers` dan fallback lokal. |
| `InquiryForm` | Tidak diimpor oleh route aktif; submit membuka WhatsApp. |
| `Testimonials` | Carousel testimonial alternatif, tidak dipakai. |
| `ThemeProvider` | Wrapper `next-themes`, tidak dipasang di root layout. |
| Toast/Toaster | Implementasi tersedia, tetapi tidak dipasang di layout aktif. |

`InquiryForm` menyimpan input nomor telepon di state, tetapi nomor tersebut tidak dimasukkan ke pesan WhatsApp yang dibentuk. Karena komponen belum aktif, hal ini belum memengaruhi user flow saat ini.

## Koleksi `components/ui`

Folder ini berisi sekitar 50 primitive UI bergaya shadcn/ui, termasuk button, form, dialog, sheet, sidebar, toast, chart, calendar, carousel, table, dan tooltip.

Komponen halaman aktif saat ini sebagian besar menggunakan elemen HTML dan class Tailwind secara langsung. Primitive UI tersebut tersedia untuk pengembangan masa depan, tetapi banyak dependency terkait belum menjadi bagian dari user flow aktif.

## Styling dan Tema

`app/globals.css` mendefinisikan:

- palet cream, gold, white, espresso, dan beige;
- token warna Tailwind;
- font family;
- smooth scrolling;
- reveal animation;
- shimmer;
- gold gradient text;
- animasi dekorasi dan hero.

`styles/globals.css` memiliki tema lain dan tidak diimpor oleh root layout.

## Catatan Aksesibilitas

- Gallery lightbox memiliki `role="dialog"` dan kontrol keyboard.
- Beberapa tombol memiliki `aria-label`.
- Favorite button memiliki label berbahasa Inggris.
- FAQ button belum mendefinisikan `aria-expanded` atau relasi panel.
- Lightbox belum mengelola focus trap atau mengembalikan fokus setelah ditutup.
- Animasi belum terlihat memiliki penanganan `prefers-reduced-motion`.

## Needs Confirmation

- Apakah primitive UI yang tidak terpakai sengaja dipertahankan sebagai design system.
- Apakah komponen alternatif/inaktif masih berada dalam roadmap.
- Apakah tema dark mode dibutuhkan; provider tidak aktif dan tema aktif tidak mendefinisikan mode gelap khusus.
