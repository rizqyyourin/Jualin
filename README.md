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

## 🌐 Setup Domain (VPS)

Jika ingin menggunakan domain sendiri (contoh: `jualin.yourin.my.id`), gunakan **Nginx** sebagai Reverse Proxy.

1.  **Install Nginx** (di VPS):
    ```bash
    sudo apt update
    sudo apt install nginx -y
    ```

2.  **Pasang Konfigurasi:**
    Kami sudah sediakan file config siap pakai `nginx.conf`.
    ```bash
    # Salin config ke folder Nginx
    sudo cp nginx.conf /etc/nginx/sites-available/jualin
    
    # Aktifkan config
    sudo ln -s /etc/nginx/sites-available/jualin /etc/nginx/sites-enabled/
    
    # Cek config error
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    ```

3.  **Pasang SSL (HTTPS Gratis):**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d jualin.yourin.my.id
    ```

