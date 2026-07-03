# CI/CD Implementation

## Workflow Aktif

Repository memiliki dua workflow yang berjalan berdampingan:

| Workflow | File | Fungsi |
| --- | --- | --- |
| `CI/CD` | `.github/workflows/ci-cd.yml` | Verify, build image, push GHCR, deploy, dan smoke test. |
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
4. tag full commit SHA dan `production`;
5. SSH ke server;
6. `docker compose pull`;
7. `docker compose up -d`;
8. smoke test `/` dan `/katalog`.

`workflow_dispatch` dapat digunakan untuk menjalankan verify secara manual. Publish dan deploy
tetap dibatasi pada push branch `main`.

## Status Prasyarat

- ESLint flat config Next.js/TypeScript tersedia.
- Typecheck berjalan terpisah dan `next build` juga gagal jika ada TypeScript error.
- `.dockerignore` mengecualikan dependency, build output, Git, env, docs, dan Compose.
- `docker-compose.production.yml` memakai image registry dan healthcheck.
- Dockerfile memakai Node.js 20, `npm ci`, build multi-stage, dan production dependency prune.
- Job deploy memakai GitHub Environment `production`.
- Server tidak menjalankan install atau build aplikasi.

## Image Tag

Setiap push ke `main` menghasilkan:

```text
ghcr.io/<owner>/<repo>:<full-commit-sha>
ghcr.io/<owner>/<repo>:production
```

Tag SHA digunakan oleh workflow deploy dan rollback. Tag `production` hanya alias convenience.

## Keamanan

- Permission default workflow hanya `contents: read`.
- `packages: write` hanya diberikan pada job image.
- Host key SSH diverifikasi melalui `PROD_KNOWN_HOSTS`.
- Private key deployment disimpan sebagai GitHub Secret.
- Nilai yang diteruskan ke remote shell di-base64 agar tidak dirangkai sebagai shell input mentah.
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

Server hanya menarik image yang telah lolos verify dan menjalankan ulang Compose.

## Dokumentasi Operasional

Daftar secrets, persiapan server satu kali, akses GHCR, deploy manual, log, dan rollback:

[CI/CD Deployment](./CI_CD_DEPLOYMENT.md)

## Referensi Resmi

- [GitHub Docs: Publishing Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Docker Docs: Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
