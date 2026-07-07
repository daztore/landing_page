# Roadmap Task Prompt Template for Codex

Gunakan file ini sebagai template prompt setiap kali ingin melanjutkan task dari `docs/ROADMAP.md`.

Cara pakai:
1. Copy file ini menjadi file task baru jika perlu, contoh:
   - `docs/prompts/2026-07-03-sync-readme-docs.md`
   - `docs/prompts/2026-07-03-phase-0-security-audit.md`
2. Isi bagian `TASK CONFIG`.
3. Hapus placeholder yang tidak diperlukan.
4. Jalankan Codex dengan instruksi: `Baca dan kerjakan prompt di docs/prompts/nama-file.md`.

---

# TASK CONFIG

Task ID / Roadmap Item:
`[P0][TODO] <paste roadmap item here>`

Source Roadmap File:
`docs/ROADMAP.md`

Related Docs:
- `AGENTS.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/AGENT_GUIDE.md`
- `docs/MODULE_ARCHITECTURE.md`
- `docs/SECURITY_AND_PERFORMANCE.md`
- `docs/COMMERCE_PREPARATION.md` jika relevan
- `docs/QA_UX_NOTES.md` jika task berasal dari QA/UX/revisi user
- `docs/CHANGELOG_NOTES.md`

Target Module / Area:
`<example: docs, marketing, catalog, admin, feedback, leads, orders, payments, shipping, ci-cd, security, performance>`

Task Type:
`<Documentation | Bug Fix | Feature Preparation | Feature Implementation | Refactor | Security | Performance | QA/UX Revision | CI/CD>`

Priority:
`<P0 | P1 | P2 | P3>`

Current Status:
`<TODO | IN_PROGRESS | BLOCKED | DEFERRED>`

Expected Final Status:
`<DONE | IN_PROGRESS | BLOCKED>`

---

# OBJECTIVE

Kerjakan task berikut sesuai roadmap:

`<jelaskan tujuan task dengan singkat dan jelas>`

Contoh:
`Sinkronkan README dan dokumentasi existing dengan kondisi code saat ini tanpa mengubah logic aplikasi.`

---

# SCOPE AND ASSUMPTIONS

Scope kerja:

- `<file/module/area yang boleh disentuh>`
- `<file/module/area yang tidak boleh disentuh bila perlu>`

Asumsi:

- `<asumsi aman yang dipakai bila prompt ambigu>`
- Jika tidak ada asumsi tambahan, tulis `Tidak ada asumsi tambahan.`

---

# MANDATORY READING

Sebelum melakukan perubahan, wajib baca:

1. `AGENTS.md`
2. `docs/ROADMAP.md`
3. `docs/DEVELOPMENT_RULES.md`
4. `docs/AGENT_GUIDE.md`
5. `docs/MODULE_ARCHITECTURE.md`
6. `docs/SECURITY_AND_PERFORMANCE.md`
7. `docs/COMMERCE_PREPARATION.md` jika task berhubungan dengan commerce/order/payment/shipping/checkout/customer
8. `docs/QA_UX_NOTES.md` jika task berasal dari QA/UX/revisi user
9. `docs/CHANGELOG_NOTES.md`
10. File source code/dokumentasi yang relevan dengan task

Jika ada dokumen yang belum tersedia, jangan berhenti kecuali dokumen tersebut wajib untuk menyelesaikan task. Catat dokumen yang belum tersedia pada summary.

---

# SCOPE

Yang harus dikerjakan:

- [ ] `<subtask 1>`
- [ ] `<subtask 2>`
- [ ] `<subtask 3>`
- [ ] Update status item terkait di `docs/ROADMAP.md` jika relevan
- [ ] Tambahkan catatan perubahan di `docs/CHANGELOG_NOTES.md` jika perubahan berdampak pada dokumentasi/arsitektur/security/performance/flow bisnis

---

# OUT OF SCOPE

Jangan lakukan hal berikut kecuali diminta eksplisit:

- Jangan membuat fitur baru di luar task ini.
- Jangan melakukan refactor besar.
- Jangan mengubah UI/UX di luar scope.
- Jangan mengubah route lama tanpa alasan kuat.
- Jangan mengubah database schema tanpa migration dan catatan.
- Jangan menambahkan dependency baru kecuali benar-benar diperlukan.
- Jangan mengubah package manager.
- Jangan membuat fitur order/payment/shipping/checkout jika task ini bukan task roadmap terkait.
- Jangan hardcode secret/API key/token.
- Jangan menggunakan service role Supabase di client-side code.

Tambahan out of scope khusus task ini:

- `<tambahkan batasan khusus jika ada>`

---

# ACCEPTANCE CRITERIA

Task dianggap selesai jika:

- [ ] Perubahan sesuai dengan roadmap item yang diminta.
- [ ] Tidak ada fitur di luar scope yang dibuat.
- [ ] Fitur/code lama tetap backward-compatible.
- [ ] Dokumentasi diperbarui jika ada perubahan pada roadmap, env, API, DB, security, performance, deployment, atau flow bisnis.
- [ ] Security dan performance tidak menurun.
- [ ] Tidak ada secret asli di code atau dokumentasi.
- [ ] Scope dan asumsi dicatat bila task ambigu.
- [ ] Roadmap status diperbarui dengan benar jika relevan.
- [ ] Changelog note ditambahkan jika relevan.

Acceptance criteria khusus task ini:

- [ ] `<criteria 1>`
- [ ] `<criteria 2>`
- [ ] `<criteria 3>`

---

# IMPLEMENTATION GUIDANCE

Ikuti prinsip berikut:

1. Mulai dari membaca dokumen dan file terkait.
2. Buat perubahan sekecil mungkin.
3. Pertahankan pattern project yang sudah ada.
4. Jangan memindahkan struktur besar tanpa kebutuhan jelas.
5. Prioritaskan security, performance, dan backward compatibility.
6. Tulis scope dan asumsi sebelum edit bila prompt ambigu.
7. Jika menemukan issue di luar scope, catat di roadmap/changelog, jangan langsung diperbaiki.
8. Jika task berhubungan dengan QA/UX, update `docs/QA_UX_NOTES.md` sesuai hasil pengerjaan.
9. Jika task berhubungan dengan commerce, pastikan tidak melompat fase roadmap.

---

# VALIDATION

Jalankan validasi yang relevan jika tersedia dan aman dijalankan:

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Test/unit/integration jika tersedia
- [ ] Manual check route/page yang terdampak
- [ ] Cek tidak ada secret/API key asli yang tertulis
- [ ] Cek perubahan tidak memuat dependency tidak perlu

Jika validasi tidak dijalankan, jelaskan alasannya di final response.

---

# REQUIRED FINAL RESPONSE FORMAT

Setelah selesai, jawab dalam Bahasa Indonesia dengan format:

```text
## Summary
- ...

## Files Changed
- ...

## Roadmap Status Updated
- ...

## Notes
- ...
- Scope: ...
- Assumptions: ...

## Risk
- Low / Medium / High

## Test Recommendation
- ...
```

Jangan klaim test berhasil jika tidak benar-benar dijalankan.

---

# EXAMPLE PROMPT USAGE

Contoh saat menjalankan Codex:

```text
Baca dan kerjakan prompt di `docs/prompts/2026-07-03-sync-readme-docs.md`.
Ikuti `AGENTS.md` dan semua dokumentasi project yang disebut di prompt tersebut.
Jangan mengerjakan di luar scope.
```

Contoh task sederhana langsung dari chat:

```text
Lanjutkan task `[P0][TODO] Sync existing README and docs with current code` dari `docs/ROADMAP.md`.
Gunakan template aturan di `docs/prompts/ROADMAP_TASK_PROMPT_TEMPLATE.md`.
Ikuti `AGENTS.md` dan jangan mengerjakan di luar scope.
```
