# Sync existing README and docs with current code


# TASK CONFIG

Task ID / Roadmap Item:
`[P0][TODO] Sync existing README and docs with current code`

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
`<docs>`

Task Type:
`<Documentation>`

Priority:
`<P0>`

Current Status:
`<TODO>`

Expected Final Status:
`<DONE>`

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

- [ ] Audit dokumen existing terhadap route aktif.
- [ ] Sinkronkan catatan API route, feedback route, dan service-role usage.
- [ ] Sinkronkan port Compose lokal dan production.
- [ ] Sinkronkan status CI/CD yang benar-benar aktif.
- [ ] Catat gap yang tidak langsung diperbaiki di `docs/CHANGELOG_NOTES.md`.
- [ ] Update status item terkait di `docs/ROADMAP.md` jika relevan
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

---

# ACCEPTANCE CRITERIA

Task dianggap selesai jika:

- [ ] Perubahan sesuai dengan roadmap item yang diminta.
- [ ] Tidak ada fitur di luar scope yang dibuat.
- [ ] Fitur/code lama tetap backward-compatible.
- [ ] Dokumentasi diperbarui jika ada perubahan pada roadmap, env, API, DB, security, performance, deployment, atau flow bisnis.
- [ ] Security dan performance tidak menurun.
- [ ] Tidak ada secret asli di code atau dokumentasi.
- [ ] Roadmap status diperbarui dengan benar jika relevan.
- [ ] Changelog note ditambahkan jika relevan.

---

# IMPLEMENTATION GUIDANCE

Ikuti prinsip berikut:

1. Mulai dari membaca dokumen dan file terkait.
2. Buat perubahan sekecil mungkin.
3. Pertahankan pattern project yang sudah ada.
4. Jangan memindahkan struktur besar tanpa kebutuhan jelas.
5. Prioritaskan security, performance, dan backward compatibility.
6. Jika menemukan issue di luar scope, catat di roadmap/changelog, jangan langsung diperbaiki.
7. Jika task berhubungan dengan QA/UX, update `docs/QA_UX_NOTES.md` sesuai hasil pengerjaan.
8. Jika task berhubungan dengan commerce, pastikan tidak melompat fase roadmap.

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

## Risk
- Low / Medium / High

## Test Recommendation
- ...
```

Jangan klaim test berhasil jika tidak benar-benar dijalankan.

---
