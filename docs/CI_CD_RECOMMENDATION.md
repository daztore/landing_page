# CI/CD Recommendation

## Workflow Yang Sudah Ada

Repository memiliki `.github/workflows/codeql.yml`.

Behavior saat ini:

- berjalan pada push ke `main`;
- berjalan pada pull request ke `main`;
- berjalan setiap Senin pukul `02:20` UTC;
- menganalisis JavaScript/TypeScript;
- memakai query `security-extended`;
- memiliki concurrency cancellation;
- timeout 20 menit.

Workflow tersebut hanya melakukan security scanning. Belum ada CI lint/build, Docker build/push, deployment, smoke test, atau rollback automation.

## Prasyarat Sebelum Deployment Otomatis

1. Tambahkan dependency dan konfigurasi ESLint agar `npm run lint` benar-benar berjalan.
2. Hapus atau evaluasi `typescript.ignoreBuildErrors`.
3. Tambahkan `.dockerignore`.
4. Buat production Compose yang memakai `image: ${APP_IMAGE}:${APP_TAG}` tanpa bind mount source.
5. Tambahkan health check.
6. Pastikan server dapat login ke registry secara aman.

## Stage Yang Direkomendasikan

1. Checkout.
2. Install dependencies dengan `npm ci`.
3. Lint.
4. Build Next.js.
5. Docker build.
6. Docker push dengan tag commit SHA.
7. SSH ke production.
8. `docker compose pull`.
9. `docker compose up -d`.
10. Health check dan smoke test.

## Pemisahan Event

Pull request:

- install;
- lint;
- type check;
- build;
- optional Docker build tanpa push;
- CodeQL.

Push ke `main`:

- seluruh quality gate;
- build dan push image;
- deployment production setelah image tersedia;
- smoke test.

## Contoh GitHub Actions

Contoh ini menggunakan GitHub Container Registry. Sesuaikan nama Compose production, environment protection, dan command health check.

> **Peringatan:** Untuk supply-chain hardening, pin setiap action ke full commit SHA. Major tag dipakai di contoh agar mudah dibaca.

```yaml
name: CI and Deploy

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Build application
        run: npm run build

  image:
    if: github.event_name == 'push'
    needs: verify
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read
      packages: write
    outputs:
      image: ${{ steps.image.outputs.image }}
      tag: ${{ steps.image.outputs.tag }}
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Set image coordinates
        id: image
        shell: bash
        run: |
          echo "image=${REGISTRY}/${IMAGE_NAME,,}" >> "$GITHUB_OUTPUT"
          echo "tag=${GITHUB_SHA}" >> "$GITHUB_OUTPUT"

      - name: Login to GHCR
        uses: docker/login-action@v4
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Docker metadata
        id: meta
        uses: docker/metadata-action@v6
        with:
          images: ${{ steps.image.outputs.image }}
          tags: |
            type=sha,format=long,prefix=
            type=raw,value=production

      - name: Build and push image
        uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    if: github.event_name == 'push'
    needs: image
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production
    steps:
      - name: Configure SSH
        shell: bash
        env:
          SSH_KEY: ${{ secrets.PROD_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.PROD_KNOWN_HOSTS }}
        run: |
          install -m 700 -d ~/.ssh
          printf '%s\n' "$SSH_KEY" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          printf '%s\n' "$KNOWN_HOSTS" > ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Pull and restart production
        shell: bash
        env:
          PROD_HOST: ${{ secrets.PROD_HOST }}
          PROD_USER: ${{ secrets.PROD_USER }}
          PROD_PORT: ${{ secrets.PROD_PORT }}
          PROD_APP_DIR: ${{ secrets.PROD_APP_DIR }}
          APP_IMAGE: ${{ needs.image.outputs.image }}
          APP_TAG: ${{ needs.image.outputs.tag }}
        run: |
          ssh -p "$PROD_PORT" "$PROD_USER@$PROD_HOST" \
            "cd '$PROD_APP_DIR' && \
             APP_IMAGE='$APP_IMAGE' APP_TAG='$APP_TAG' \
             docker compose -f docker-compose.production.yml pull && \
             APP_IMAGE='$APP_IMAGE' APP_TAG='$APP_TAG' \
             docker compose -f docker-compose.production.yml up -d"

      - name: Smoke test
        env:
          PROD_URL: ${{ secrets.PROD_URL }}
        run: curl --fail --show-error --silent --retry 10 --retry-delay 5 "$PROD_URL/"
```

## Secret dan Variable Yang Diperlukan

| Nama | Jenis | Fungsi |
| --- | --- | --- |
| `PROD_HOST` | Secret | Hostname atau IP server. |
| `PROD_USER` | Secret | User SSH deployment dengan privilege terbatas. |
| `PROD_PORT` | Secret | Port SSH, biasanya `22`. |
| `PROD_SSH_KEY` | Secret | Private key khusus deployment. |
| `PROD_KNOWN_HOSTS` | Secret | Host key server yang sudah diverifikasi. |
| `PROD_APP_DIR` | Secret | Path direktori Compose production. |
| `PROD_URL` | Secret/Variable | URL untuk smoke test. |
| `GITHUB_TOKEN` | Built-in | Push package ke GHCR dengan permission `packages: write`. |

Server perlu credential read-only untuk menarik private image GHCR. Simpan credential itu pada Docker credential store atau mekanisme registry login server, bukan di repository.

## Kenapa Server Tidak Menjalankan `npm run build`

Build langsung di production server:

- membuat artifact sulit direproduksi;
- memakai CPU/RAM production;
- memerlukan source code dan dev dependency di server;
- memperbesar downtime;
- memungkinkan hasil deploy berbeda dari hasil CI;
- menyulitkan rollback;
- meningkatkan exposure secret dan toolchain.

Server production idealnya hanya:

```text
pull image tervalidasi
-> restart container
-> health check
```

## Rollback CI/CD

Simpan tag commit SHA setiap release. Rollback dapat berupa workflow manual yang menerima `APP_TAG` known-good dan menjalankan:

```bash
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

Jangan membangun ulang commit lama saat rollback jika image immutable-nya masih tersedia.

## Referensi Resmi

- [GitHub Docs: Publishing Docker images](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images)
- [Docker Docs: Docker Build GitHub Actions](https://docs.docker.com/build/ci/github-actions/)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Metadata Action](https://github.com/docker/metadata-action)
