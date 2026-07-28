# TermResult Finance

React admin for TermResult platform subscription billing (per school session/term).

## Features

- First-time finance admin setup + email/password login
- Dashboard with real collection trends
- Active TermResult schools directory with billing profiles
- Invoice generation for unbilled current session/term (active student snapshot)
- Email invoice send + reminder scheduling (WhatsApp later)
- Manual bank-transfer payment confirmation
- Settings (org + settlement account)
- School Portal stub (later)

## Stack

- React 19 + Vite
- React Router + TanStack Query + Axios
- Recharts, Lucide

## Run

```bash
cd finance
npm install
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8000`. Optional: set `VITE_API_URL` in `.env`.

Backend routes live under `/api/finance-admin/*` in `termresult-backend`.

Brand assets live in `public/brand/`.
