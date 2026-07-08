# QA/UX Notes

Dokumen ini digunakan untuk mencatat revisi dari tim QA, UX, user lapangan, atau stakeholder.

Agent/Codex wajib membaca dokumen ini jika task berasal dari revisi QA/UX.

## Status Legend

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `CANCELLED`

## Priority Legend

- `P0` = Bug critical/security/breaking
- `P1` = Mengganggu flow utama
- `P2` = Improvement penting
- `P3` = Minor/nice to have

---

## Notes

### QAUX-0002 - Supabase Storage Image Optimizer 400

Status: `DONE`
Priority: `P1`
Source: `Production Debug`
Date: `2026-07-08`
Page/Module: `Public images / Next Image Optimizer`
Related Route: `/`, `/katalog`, `/produk/[slug]`
Related File: `next.config.mjs`, `Dockerfile`

#### Problem

Production evidence menunjukkan Supabase public Storage URL bisa diakses langsung dengan `200 OK`,
tetapi request melalui `/_next/image` mengembalikan `400 Bad Request` dengan pesan `"url"
parameter is not allowed`.

#### Expected Behavior

Gambar public dari bucket Supabase `landing_page` dan `catalogs` tetap diproses oleh Next Image
Optimizer, tidak memakai `unoptimized`, dan menghasilkan response image.

#### Acceptance Criteria

- [x] Next Image Optimizer tetap digunakan.
- [x] Tidak memakai `images.unoptimized`.
- [x] Tidak mengganti global ke `<img>`.
- [x] Request debug lokal ke `/_next/image` untuk Supabase Storage menghasilkan `200 OK`.
- [x] Content-Type hasil optimizer adalah `image/webp`.
- [x] Build production berhasil.
- [x] Docker local test dicoba dan blocker dicatat bila engine tidak tersedia.

#### Developer Notes

Fix yang dipilih adalah config-only: tetap memakai `remotePatterns`, menambahkan fallback
`images.domains` khusus hostname Supabase dari `NEXT_PUBLIC_SUPABASE_URL`, dan membatasi
`maximumRedirects` ke `0`. Next.js 16.2.10 memberi warning bahwa `images.domains` deprecated,
tetapi build/start tetap berhasil. Docker runtime juga harus membawa `next.config.mjs`; root cause
container adalah file config tidak tersalin ke stage runner sehingga `next start` memakai default
image allowlist.

#### Result Notes

Local `next start` dengan env public Supabase production menghasilkan:

```text
STATUS: 200 OK
CONTENT_TYPE: image/webp
```

Docker debug setelah `next.config.mjs` disalin ke runner juga menghasilkan:

```text
STATUS: 200 OK
CONTENT_TYPE: image/webp
```

### QAUX-0001 - Example Note Title

Status: `TODO`  
Priority: `P2`  
Source: `QA/UX/User/Stakeholder`  
Date: `YYYY-MM-DD`  
Page/Module: `example`  
Related Route: `/example`  
Related File: `optional/path.tsx`

#### Problem

Tuliskan masalahnya di sini.

#### Expected Behavior

Tuliskan hasil yang diharapkan.

#### Acceptance Criteria

- [ ] Kriteria 1
- [ ] Kriteria 2
- [ ] Kriteria 3

#### Developer Notes

Catatan teknis jika ada.

#### Result Notes

Diisi setelah selesai.
