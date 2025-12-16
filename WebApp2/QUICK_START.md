# n8n WebApp - Quick Start

## Cara Menjalankan Aplikasi

### Development Mode (Recommended untuk testing)
\`\`\`bash
npm run dev
\`\`\`
Buka http://localhost:3000

### Production Mode
\`\`\`bash
npm run build
npm start
\`\`\`

## Konfigurasi Environment Variable

Tambahkan environment variable `N8N_WEBHOOK_URL` di v0 Vars section:

1. Buka sidebar kanan > **Vars**
2. Tambah variable baru:
   - **Key**: `N8N_WEBHOOK_URL`
   - **Value**: URL webhook n8n Anda (contoh: `https://your-n8n-instance.com/webhook/test`)

## Struktur Project

\`\`\`
app/
├── page.tsx          # Frontend UI (Client Component)
├── layout.tsx        # Layout
├── globals.css       # Global styles
└── api/
    ├── ask/route.ts  # API untuk kirim pertanyaan ke n8n
    └── health/route.ts # Health check endpoint
\`\`\`

## API Endpoints

### POST /api/ask
Mengirimkan pertanyaan ke n8n webhook

**Request:**
\`\`\`json
{
  "question": "Pertanyaan Anda di sini"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": { ... response dari n8n ... }
}
\`\`\`

### GET /api/health
Check status server

**Response:**
\`\`\`json
{
  "status": "ok"
}
\`\`\`

## Troubleshooting

### Error: "Could not find a production build"
Jalankan `npm run build` sebelum `npm start`

### Error: N8N_WEBHOOK_URL not set
Pastikan environment variable sudah ditambahkan di Vars section

### Error: Connection refused
- Pastikan webhook URL benar
- Pastikan n8n server sedang running
- Check firewall/network settings
\`\`\`
</parameter>

```markdown file="" isHidden
