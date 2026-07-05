# Package Manager Decision

Dokumen ini mencatat status keputusan package manager resmi project.

## Status

Status per 2026-07-03: `BLOCKED`, menunggu konfirmasi eksplisit owner project.

Rekomendasi teknis saat ini: jadikan npm sebagai package manager resmi, karena semua jalur
operasional aktif sudah memakai npm.

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

## Decision Needed

Owner project perlu mengonfirmasi:

- npm disetujui sebagai package manager resmi;
- versi npm yang akan ditulis pada `packageManager`, misalnya `npm@10.9.2` atau versi npm 10.x yang disepakati tim;
- apakah `pnpm-lock.yaml` boleh dihapus pada cleanup terpisah setelah npm resmi.

## Jika npm Disetujui

Langkah aman setelah approval:

1. Tambahkan field `packageManager` di `package.json`.
2. Pertahankan `package-lock.json` sebagai lockfile utama.
3. Pastikan local, CI, Docker, dan dokumentasi tetap memakai `npm ci`.
4. Jangan menjalankan `pnpm install`.
5. Hapus `pnpm-lock.yaml` hanya jika owner menyetujui cleanup lockfile.

## Yang Tidak Dilakukan Pada Task Ini

- Tidak menambahkan field `packageManager` karena keputusan final belum dikonfirmasi.
- Tidak menghapus `pnpm-lock.yaml`.
- Tidak mengubah Dockerfile, workflow CI, atau lockfile.
- Tidak mengganti package manager.

## Risiko Jika Dibiarkan Terbuka

- Dependency tree npm dan pnpm dapat berbeda.
- Developer baru dapat menjalankan package manager yang berbeda dari CI.
- Review dependency update menjadi lebih sulit karena dua lockfile harus diperhatikan.

## Rekomendasi Sementara

Sampai owner memberi keputusan final:

- gunakan npm untuk semua command local dan CI;
- gunakan `npm ci` setelah clone atau saat lockfile berubah;
- jangan memperbarui `pnpm-lock.yaml`;
- jangan menghapus `pnpm-lock.yaml` tanpa approval eksplisit.
