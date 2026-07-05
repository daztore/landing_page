# Package Manager Decision

Dokumen ini mencatat status keputusan package manager resmi project.

## Status

Status per 2026-07-05: `DONE`.

Keputusan resmi: gunakan npm sebagai package manager project dengan pin
`packageManager: "npm@10.9.0"` di `package.json`.

`package-lock.json` adalah lockfile utama. `pnpm-lock.yaml` masih dipertahankan sebagai
legacy lockfile yang tidak dipakai oleh jalur operasional aktif dan tidak boleh diperbarui.
Penghapusan `pnpm-lock.yaml` membutuhkan approval cleanup terpisah.

## Audit 2026-07-03

Temuan:

- `package-lock.json` tersedia dengan `lockfileVersion: 3`.
- `pnpm-lock.yaml` juga tersedia dengan `lockfileVersion: 9.0`.
- `package.json` belum memiliki field `packageManager`.
- Dockerfile memakai `COPY package.json package-lock.json ./` lalu `npm ci`.
- Workflow `.github/workflows/ci-cd.yml` memakai `actions/setup-node` dengan `cache: npm`.
- Workflow verify menjalankan `npm ci`, `npm run lint`, `npm run typecheck`, dan `npm run build`.
- README dan dokumen setup lokal sudah mengarahkan developer memakai `npm ci`.
- Environment lokal audit memiliki Node.js `v22.13.1`, npm `10.9.2`, dan tidak memiliki `pnpm` di PATH.

## Decision 2026-07-05

Owner menyetujui rekomendasi teknis untuk memakai package manager resmi yang sudah menjadi
jalur operasional aktif project. Karena Dockerfile, CI, README, dan setup lokal sudah memakai
npm, keputusan final adalah npm.

Versi yang dipin adalah `npm@10.9.0`, mengikuti versi `npm.cmd --version` pada environment
lokal saat keputusan dibuat. Audit 2026-07-03 sempat mencatat npm `10.9.2`; bila tim nanti
menetapkan versi npm lain, update `packageManager` dan dokumen ini dalam task tooling
terpisah.

## Implementation

- `package.json` memiliki field `packageManager: "npm@10.9.0"`.
- `package-lock.json` dipertahankan sebagai lockfile utama.
- Dockerfile tetap memakai `COPY package.json package-lock.json ./` dan `npm ci`.
- Workflow `.github/workflows/ci-cd.yml` tetap memakai `actions/setup-node` dengan cache npm,
  lalu `npm ci`, `npm run lint`, `npm run typecheck`, dan `npm run build`.
- README, setup lokal, troubleshooting, dan maintenance notes diarahkan ke npm.
- `pnpm-lock.yaml` tidak dihapus karena belum ada approval eksplisit untuk cleanup lockfile.

## Operational Rules

- Gunakan `npm ci` setelah clone atau saat memastikan install bersih.
- Gunakan `npm install` hanya di development branch ketika memang mengubah dependency dan perlu
  memperbarui `package-lock.json`.
- Jangan menjalankan `pnpm install` untuk project ini.
- Jangan memperbarui `pnpm-lock.yaml`.
- Jangan menghapus `pnpm-lock.yaml` tanpa approval eksplisit owner untuk cleanup lockfile.
- Jangan mengganti command CI, Docker, atau deployment ke package manager lain tanpa decision
  record baru.

## Remaining Follow-Up

- Cleanup opsional: hapus `pnpm-lock.yaml` pada task terpisah jika owner memberi approval
  eksplisit.
- Jika standardisasi Node/npm tim berubah, update `packageManager`, local docs, dan CI/Docker
  secara bersamaan.
