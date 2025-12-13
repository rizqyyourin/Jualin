# Jualin - E-Commerce Platform

Jualin adalah platform e-commerce modern yang dibangun dengan teknologi terkini, dirancang untuk performa tinggi dan kemudahan pengembangan.

## 🚀 Teknologi Stack

*   **Frontend:** Next.js 14, React, TailwindCSS, Zustand
*   **Backend:** Laravel 11, PHP 8.4, SQLite
*   **AI:** Google Gemma 3 27B (via API) untuk Chatbot Cerdas
*   **Infrastructure:** Docker & Docker Compose

## 📋 Prasyarat

Pastikan komputer Anda sudah terinstall:
1.  [Docker Desktop](https://www.docker.com/products/docker-desktop/) atau Docker Engine.
2.  [Git](https://git-scm.com/).

## 🛠️ Cara Menjalankan (Docker)

Kami telah menyederhanakan proses setup menggunakan Docker. Anda tidak perlu install PHP, Node.js, atau Composer secara manual di komputer Anda.

1.  **Clone Repository**
    ```bash
    git clone https://github.com/rizqyyourin/Jualin.git
    cd Jualin
    ```

2.  **Setup Environment Variables**
    Salin file contoh `.env` untuk backend:
    ```bash
    cp backend/.env.example backend/.env
    ```
    *Opsional: Edit `backend/.env` jika ingin mengubah konfigurasi database atau API Key Gemini.*

3.  **Jalankan Aplikasi**
    Cukup jalankan script berikut (Linux/Mac/WSL):
    ```bash
    chmod +x start_docker.sh
    ./start_docker.sh
    ```
    *Jika menggunakan Windows CMD/PowerShell, jalankan: `docker-compose up -d --build`*

4.  **Akses Aplikasi**
    Tunggu beberapa saat hingga container selesai dibangun.
    *   **Frontend (Toko):** [http://localhost:3000](http://localhost:3000)
    *   **Backend (API):** [http://localhost:8000](http://localhost:8000)

## 🐛 Troubleshooting

*   **Port Conflict:** Jika gagal jalan, pastikan port `3000` dan `8000` tidak sedang dipakai oleh aplikasi lain.
*   **Database:** Database SQLite tersimpan di `backend/database/database.sqlite`. Data akan tetap aman meskipun Docker dimatikan.
*   **Hot-Reload:** Development mode aktif secara default. Perubahan kode di folder `frontend` atau `backend` akan langsung terlihat tanpa restart Docker.

## 🤖 Fitur AI Chatbot

Project ini menggunakan **Google Gemma 3 27B** untuk fitur chatbot.
Pastikan Anda memiliki API Key Google AI Studio yang valid di `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```
