# Fleetify Logistics - Invoice & Resi Generator

Aplikasi web multi-step untuk mencatat pengiriman dan membuat invoice. 
Dibuat sebagai bagian dari Technical Test Junior Fullstack Engineer Fleetify.

## Fitur

- **Multi-Step Form:** Proses input dibagi 3 tahap — data pengirim/penerima, 
  daftar barang, dan review sebelum submit.
- **Zero-Trust Backend:** Harga selalu dihitung ulang dari database, 
  tidak bergantung pada data yang dikirim frontend.
- **Role-Based Access:** Admin dan Kerani punya perbedaan payload saat submit invoice.
- **ACID Transaction:** Penyimpanan header dan detail invoice dilakukan 
  dalam satu transaksi — kalau gagal, semua di-rollback.
- **Webhook:** Notifikasi dikirim secara async setelah invoice berhasil dibuat.
- **Docker Ready:** Satu perintah langsung jalan, tidak perlu install apapun manual.

## Tech Stack

- **Frontend:** Next.js 14 (Pages Router), TypeScript, Zustand, 
  TanStack Query v5, TailwindCSS
- **Backend:** Golang, Go Fiber, GORM
- **Database:** PostgreSQL
- **Infra:** Docker & Docker Compose (multi-stage build)

## Cara Menjalankan

Pastikan Docker sudah terinstall, lalu jalankan:

```bash
docker-compose up -d --build
```

Tunggu sampai semua container running, lalu buka:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

Database sudah otomatis terbuat dan terisi data dummy saat pertama jalan.

## Akun untuk Testing

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Kerani | `kerani` | `kerani123` |

Admin mengirim payload lengkap termasuk harga. 
Kerani tidak menyertakan data harga saat submit.

## Struktur Folder

- `/frontend` — Next.js app
- `/backend` — Golang API
- `docker-compose.yml` — orkestrasi semua service