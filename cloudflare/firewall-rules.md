# Cloudflare Security Rules Documentation

Berdasarkan screenshot yang Anda berikan, berikut adalah dokumentasi firewall rules dalam format Markdown:

## Rule 1: Limit HTTP Methods

**Rule Name:** Limit HTTP Methods

**Purpose:** Membatasi HTTP methods yang diizinkan dan memblokir hostname tertentu

### Conditions:
- **Request Method:** is not in `GET`, `POST`
- **AND**
- **Hostname:** does not equal `n8n-rag.haqeemproject.site`

### Expression:
```
(not http.request.method in {"GET" "POST"} and http.host ne "n8n-rag.haqeemproject.site")
```

### Action:
- **Action Type:** Block
- **Description:** Blocks matching requests and stops evaluating other rules

### Placement:
- **Order:** First

---

## Rule 2: Allow Only Telegram and Vercel

**Rule Name:** Allow Only Telegram and Vercel

**Purpose:** Membatasi akses berdasarkan IP source dan referer

### Conditions:

**Condition 1 - IP Source Address:**
- **Field:** IP Source Address
- **Operator:** is not in
- **Values:**
  - `91.108.4.0/22`
  - `91.108.8.0/22`
  - `91.108.12.0/22`
  - `91.108.16.0/22`
  - `91.108.56.0/22`
  - `149.154.160.0/20`
  - `149.154.164.0/22`

**AND**

**Condition 2 - Referer:**
- **Field:** Referer
- **Operator:** does not contain
- **Value:** `vercel.app`

**AND**

**Condition 3 - Hostname:**
- **Field:** Hostname
- **Operator:** does not equal
- **Value:** `n8n-rag.haqeemproject.site`

### Expression:
```
(not ip.src in {91.108.4.0/22 91.108.8.0/22 91.108.12.0/22 91.108.16.0/22 91.108.56.0/22 149.154.160.0/20 149.154.164.0/22} and not http.referer contains "vercel.app" and http.host ne "n8n-rag.haqeemproject.site")
```

### Action:
- **Action Type:** Block
- **Description:** Blocks matching requests and stops evaluating other rules

### Placement:
- **Order:** Custom
- **Fire After:** Limit HTTP Methods

---

## IP Ranges Reference

### Telegram IP Ranges:
```
91.108.4.0/22
91.108.8.0/22
91.108.12.0/22
91.108.16.0/22
91.108.56.0/22
149.154.160.0/20
149.154.164.0/22
```

### Allowed Referers:
- `vercel.app`

### Protected Hostnames:
- `haqeemproject.site`
- `n8n-rag.haqeemproject.site` (excluded from restrictions)

---

## Implementation Notes

1. **Rule Order:** Rule 1 executes first, followed by Rule 2
2. **Exclusion:** Hostname `n8n-rag.haqeemproject.site` dikecualikan dari semua pembatasan
3. **HTTP Methods:** Hanya GET dan POST yang diizinkan untuk domain lain
4. **IP Whitelisting:** Traffic dari IP Telegram dan referer Vercel diizinkan
5. **Default Action:** Block untuk request yang tidak memenuhi kriteria

---

## Testing Recommendations

- Test akses dari IP Telegram
- Test akses dengan referer Vercel
- Test HTTP methods selain GET/POST
- Verify akses ke n8n-rag subdomain tidak terganggu

---

## Security Impact

### Rule 1 Impact:
- Memblokir semua HTTP methods selain GET dan POST
- Melindungi dari potential attack methods (PUT, DELETE, PATCH, etc.)
- Hostname `n8n-rag.haqeemproject.site` dapat menggunakan semua HTTP methods

### Rule 2 Impact:
- Hanya mengizinkan traffic dari IP Telegram atau dengan referer Vercel
- Memblokir akses langsung dari browser atau tools lain
- Melindungi API endpoint dari unauthorized access

---

## Maintenance

### Update Telegram IP Ranges:
Telegram IP ranges dapat berubah seiring waktu. Check official documentation:
- [Telegram Bot API Documentation](https://core.telegram.org/bots/webhooks)

### Monitor & Adjust:
- Review Cloudflare Security Analytics secara berkala
- Adjust rules berdasarkan legitimate traffic yang terblokir
- Update IP ranges jika Telegram menambah datacenter baru