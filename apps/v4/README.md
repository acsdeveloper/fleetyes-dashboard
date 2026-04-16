# FleetYes Dashboard (v4)

Next.js app built with React 19 and Tailwind v4.

---

## Deployment Guide

### 1. Environment Setup

Create the `.env` file inside `apps/v4/` — **not** in the repo root. Next.js only loads env files from the app's own directory.

```
apps/v4/.env
```

Minimum required variable:

```env
NEXT_PUBLIC_ONTRACK_HOST=https://rsp-api.fleetyes.com
```

> If `.env` is missing or placed in the wrong directory, the app falls back to `https://ontrack-api.agilecyber.com` which is the development API.

---

### 2. Install Dependencies

```bash
cd /var/www/html/fleetyes-dashboard
pnpm install
```

---

### 3. Build the App

```bash
pnpm v4:build
```

This runs `next build` scoped to the `v4` app via the root `package.json` script.

---

### 4. Start with PM2

```bash
PORT=4000 pm2 start "pnpm --filter=v4 start" --name fleetyes-dashboard
```

- Runs the app on port **4000**
- PM2 process name: `fleetyes-dashboard`
- Uses `--filter=v4` to target this app within the monorepo

---

### 5. Verify the Process

```bash
pm2 status
```

The process should show `online` status. To view logs:

```bash
pm2 logs fleetyes-dashboard
```

To restart after a new deployment:

```bash
pnpm v4:build && pm2 restart fleetyes-dashboard
```

---

## Notes

| Item | Detail |
|------|--------|
| `.env` location | `apps/v4/.env` (not repo root) |
| Port | `4000` |
| PM2 process name | `fleetyes-dashboard` |
| Package manager | `pnpm` |
| Build command | `pnpm v4:build` |
| Start command | `pnpm --filter=v4 start` |
