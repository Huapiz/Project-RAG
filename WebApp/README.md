# n8n Webhook WebApp

Aplikasi web sederhana untuk mengirimkan pertanyaan ke n8n webhook endpoint dan menerima response. Dibangun dengan Next.js 16 dan TypeScript.

## 📋 Fitur

- ✅ Frontend modern dengan React + Tailwind CSS
- ✅ Backend Next.js API Routes
- ✅ Kirim pertanyaan ke n8n webhook
- ✅ Tampilkan response dari n8n dengan formatting JSON
- ✅ Real-time server status monitoring
- ✅ Error handling yang informatif
- ✅ Copy response ke clipboard
- ✅ Keyboard shortcut support (Ctrl + Enter)

## 🚀 Setup & Instalasi

### 1. Clone atau Download Project
\`\`\`bash
git clone <your-repo-url>
cd n8n-webhook-webapp
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Environment Variables

Tambahkan `N8N_WEBHOOK_URL` di v0 sidebar > **Vars** section, atau buat file `.env.local`:

\`\`\`
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
\`\`\`

### 4. Run Server

**Development Mode (dengan auto-reload):**
\`\`\`bash
npm run dev
\`\`\`

**Production Mode:**
\`\`\`bash
npm run build
npm start
\`\`\`

Server akan berjalan di `http://localhost:3000`

## 📖 Cara Menggunakan

1. Buka http://localhost:3000 di browser
2. Masukkan pertanyaan di textarea
3. Klik tombol "Kirim ke n8n" atau tekan `Enter`
4. Tunggu response dari n8n
5. Response akan ditampilkan di section bawah dengan format JSON
6. Klik "Copy Response" untuk copy ke clipboard

## 🔧 Struktur Project

\`\`\`
n8n-webhook-webapp/
├── app/
│   ├── page.tsx              # Main page (React Client Component)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── ask/route.ts      # POST endpoint untuk kirim pertanyaan
│       └── health/route.ts   # GET endpoint untuk health check
├── public/                   # Static files & icons
├── components/               # UI components (shadcn/ui)
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

## 📡 API Endpoints

### POST /api/ask
Mengirim pertanyaan ke n8n webhook

**Request:**
\`\`\`json
{
  "question": "Pertanyaan Anda di sini"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "success": true,
  "data": { /* response dari n8n */ },
  "message": "Question processed successfully"
}
\`\`\`

**Response (Error):**
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": null
}
\`\`\`

### GET /api/health
Check status server

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2025-11-29T10:30:00.000Z"
}
\`\`\`

## 🔗 Integrasi dengan n8n

1. Buka n8n workflow Anda
2. Tambahkan node "Webhook" dengan method POST
3. Copy webhook URL dari n8n
4. Add environment variable `N8N_WEBHOOK_URL` dengan URL tersebut
5. Restart application atau re-deploy

Contoh workflow n8n:
\`\`\`
Webhook (POST) 
  ↓
Function (Process question)
  ↓
OpenAI / LLM (Get response)
  ↓
Return response
\`\`\`

## 🛠️ Technologies

- **Frontend:** React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **HTTP Client:** Axios
- **Environment:** Node.js, Vercel

## 📝 Troubleshooting

### ❌ "Could not find a production build"
\`\`\`bash
npm run build
npm start
\`\`\`

### ❌ "N8N_WEBHOOK_URL not set"
- Di v0: Tambahkan via sidebar > Vars section
- Lokal: Buat/update `.env.local` file

### ❌ "Failed to process question"
- Pastikan N8N_WEBHOOK_URL sudah benar
- Pastikan n8n instance sedang running
- Check firewall/network settings
- Lihat error detail di browser console

### ❌ Timeout Error
- Default timeout adalah 30 detik (configurable di `app/api/ask/route.ts`)
- Check n8n workflow processing time

## 🚀 Deployment ke Vercel

1. Push project ke GitHub
2. Buka https://vercel.com/new dan import repository
3. Add environment variable:
   - **Key:** `N8N_WEBHOOK_URL`
   - **Value:** Your n8n webhook URL
4. Deploy!

## 📄 License

MIT

## 📧 Support

Jika ada pertanyaan atau issue, buat GitHub issue baru.
