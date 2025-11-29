# n8n Webhook WebApp - Setup Guide

## 📋 Persyaratan

- Node.js 18+ 
- npm atau yarn
- n8n instance dengan webhook endpoint

## 🚀 Setup Local

### 1. Environment Variables

Copy `.env.local.example` ke `.env.local`:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` dan set `N8N_WEBHOOK_URL`:

\`\`\`
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Buka http://localhost:3000

## 🔗 Integrasi dengan n8n

### Step 1: Setup n8n Workflow

1. Buka n8n instance Anda
2. Buat workflow baru
3. Tambahkan node **Webhook**:
   - Method: **POST**
   - Path: `/your-webhook-id` (atau path yang Anda inginkan)

### Step 2: Configure n8n Workflow

Contoh workflow untuk AI question answering:

\`\`\`
Webhook (POST)
  ↓
[Extract question dari body]
  ↓
OpenAI / Claude / LLM Node
  ↓
Function [Transform response]
  ↓
Respond to Webhook
\`\`\`

### Step 3: Get Webhook URL

1. Deploy workflow di n8n
2. Copy webhook URL dari trigger node
3. Paste ke `.env.local` sebagai `N8N_WEBHOOK_URL`
4. Restart dev server

## 📱 Menggunakan WebApp

1. Buka http://localhost:3000
2. Masukkan pertanyaan
3. Klik "Kirim ke n8n"
4. Tunggu response dari n8n
5. Response ditampilkan dalam format JSON
6. Copy response dengan tombol "Copy Response"

## 📊 API Endpoints

### POST /api/ask

Mengirim pertanyaan ke n8n webhook.

**Request:**
\`\`\`json
{
  "question": "Your question here"
}
\`\`\`

**Response Success:**
\`\`\`json
{
  "success": true,
  "data": { /* n8n response */ },
  "message": "Question processed successfully"
}
\`\`\`

**Response Error:**
\`\`\`json
{
  "success": false,
  "error": "Error message",
  "details": null
}
\`\`\`

### GET /api/health

Check status server API.

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub

\`\`\`bash
git add .
git commit -m "Add n8n webhook integration"
git push origin main
\`\`\`

### 2. Deploy ke Vercel

- Buka https://vercel.com/new
- Connect GitHub repository
- Vercel akan auto-detect sebagai Next.js project
- Add environment variable di **Environment Variables**:
  - Key: \`N8N_WEBHOOK_URL\`
  - Value: \`https://your-n8n-instance.com/webhook/your-webhook-id\`
- Click **Deploy**

### 3. Verifikasi

Setelah deploy selesai:
1. Buka deployed URL
2. Test dengan mengisi pertanyaan
3. Verify response dari n8n

## 🔧 Troubleshooting

### ❌ "Failed to process question"

**Solusi:**
- Check \`N8N_WEBHOOK_URL\` di environment variables
- Pastikan n8n instance accessible (buka URL di browser)
- Check CORS settings jika n8n di server berbeda
- Verify n8n webhook sudah active

### ❌ Timeout Error

**Solusi:**
- N8N workflow terlalu kompleks/slow
- Increase timeout di \`app/api/ask/route.ts\` (ubah 30000 menjadi lebih besar)
- Optimize n8n workflow

### ❌ "ERR_CONNECTION_REFUSED"

**Solusi:**
- N8N instance tidak running
- URL salah di environment variables
- Firewall blocking koneksi

### ❌ CORS Issues

**Solusi:**
- CORS sudah handled by Next.js API Route
- Verify n8n webhook tidak redirect
- Check browser console untuk error details

## 📞 Support

Jika ada masalah:

1. Check console logs (F12 → Console tab)
2. Check server logs (terminal tempat running \`npm run dev\`)
3. Verify environment variables
4. Test n8n webhook direct dengan cURL:

\`\`\`bash
curl -X POST https://your-n8n-url/webhook/your-id \\
  -H "Content-Type: application/json" \\
  -d '{"question":"test question"}'
\`\`\`
\`\`\`
