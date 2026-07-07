# CI/CD Implementation

## Workflow Aktif

Repository memiliki dua workflow yang berjalan berdampingan:

| Workflow | File | Fungsi |
| --- | --- | --- |
| `CI/CD` | `.github/workflows/ci-cd.yml` | Verify, build image, dan push GHCR. |
| `CodeQL Security Scan` | `.github/workflows/codeql.yml` | Analisis keamanan JavaScript/TypeScript. |

Workflow CodeQL tidak dihapus atau digabungkan dengan deployment.

## Stage

Pull request ke `main`:

1. `npm ci`;
2. `npm run lint`;
3. `npm run typecheck`;
4. `npm run build`.

Push ke `main`:

1. seluruh verify gate;
2. Docker Buildx build;
3. push image ke `ghcr.io/<owner>/<repo>`;
4. tag full commit SHA, `main`, dan `production`.

`workflow_dispatch` dapat digunakan untuk menjalankan verify secara manual. Publish image tetap dibatasi pada push branch `main`.

Job deploy via SSH sudah dihapus. Server production perlu menarik image GHCR dan menjalankan Compose melalui proses manual/operasional terpisah.

## Status Prasyarat

- ESLint flat config Next.js/TypeScript tersedia.
- Typecheck berjalan terpisah dan `next build` juga gagal jika ada TypeScript error.
- `.dockerignore` mengecualikan dependency, build output, Git, env, docs, dan Compose.
- `docker-compose.production.yml` memakai image registry dan healthcheck.
- Dockerfile memakai Node.js 20, `npm ci`, build multi-stage, dan production dependency prune.
- Server tidak menjalankan install atau build aplikasi.

## Image Tag

Setiap push ke `main` menghasilkan:

```text
ghcr.io/<owner>/<repo>:<full-commit-sha>
ghcr.io/<owner>/<repo>:main
ghcr.io/<owner>/<repo>:production
```

Tag SHA tersedia untuk rollback immutable. Tag `main` dan `production` adalah alias convenience.

## Keamanan

- Permission default workflow hanya `contents: read`.
- `packages: write` hanya diberikan pada job image.
- Service-role key hanya dibutuhkan sebagai runtime secret di server untuk fitur feedback privat.
- Server private GHCR harus memakai credential read-only `read:packages`.

Untuk supply-chain hardening berikutnya, pin GitHub Actions ke full commit SHA, bukan hanya
major version tag.

## Kenapa Build Tidak Dilakukan di Server

Build langsung di production server:

- membuat artifact sulit direproduksi;
- memakai CPU/RAM production;
- memerlukan source code dan dev dependency;
- memperbesar downtime;
- menyulitkan rollback;
- dapat menghasilkan artifact berbeda dari CI.

Server hanya menarik image yang telah lolos verify dan menjalankan ulang Compose melalui proses deployment manual/operasional.

## Dokumentasi Operasional

Daftar secrets, persiapan server satu kali, akses GHCR, deploy manual, log, dan rollback:

[CI/CD Deployment](./CI_CD_DEPLOYMENT.md)

## Referensi Resmi

- [GitHub Docs: Publishing Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Docker Docs: Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
