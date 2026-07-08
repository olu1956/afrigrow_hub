# AfriGrow Hub — production hosting

Deploy the Next.js app to **Vercel** (recommended) with **Supabase** for auth/data and your **custom domain**.

## Prerequisites

- [ ] Supabase project created (you already have `.env.local` keys)
- [ ] All SQL migrations applied (see below)
- [ ] Domain registered (DNS access at your registrar)
- [ ] Vercel account (free tier is fine)

---

## Step 1 — Supabase (database)

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**:

1. If this is a **new** project, run each file in `supabase/migrations/` **in filename order** (oldest first).
2. Then run the helper scripts in `supabase/scripts/` if not already applied:
   - `setup_inbound_leads.sql`
   - `setup_business_guides.sql`
   - `setup_site_analytics.sql` ← **public visit counter + member count**
   - `grant_platform_admin_read.sql`
   - `allowlist_self_read.sql`
3. Promote your admin user (replace email):

```sql
-- promote_platform_admin.sql pattern
insert into public.platform_admin_allowlist (email)
values ('your-login@email.com')
on conflict (email) do nothing;
```

**Authentication → URL configuration** (do again after domain is live):

| Field | Value |
|--------|--------|
| Site URL | `https://afrigrow.app` |
| Redirect URLs | `https://afrigrow.app/auth/callback` |
| | `http://localhost:3000/auth/callback` (for local dev) |

**Authentication → Providers:** enable Email; optional Google OAuth (add production redirect URLs).

Copy from **Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — recommended for admin features)

---

## Step 2 — Push code to GitHub

Vercel deploys from Git. From the project root:

```bash
cd /Users/oluojuroye/AndroidProjects/afrigrow_hub
git add -A
git commit -m "Prepare AfriGrow Hub for production deploy"
```

Create a **private** repo on GitHub (e.g. `afrigrow_hub`), then:

```bash
git remote add origin https://github.com/YOUR_USER/afrigrow_hub.git
git push -u origin main
```

---

## Step 3 — Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repo `afrigrow_hub`
3. Framework: **Next.js** (auto-detected)
4. **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `NEXT_PUBLIC_SITE_URL` | `https://afrigrow.app` |
| `PLATFORM_ADMIN_EMAILS` | Your login email(s), comma-separated |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase (secret) |

5. Click **Deploy** — wait for build (~2–5 min)
6. Note the `*.vercel.app` URL for smoke testing

**Alternative (no GitHub):** from project root run `npx vercel` and follow prompts (link project, add env vars in Vercel dashboard).

---

## Step 4 — Custom domain

1. Vercel → your project → **Settings → Domains**
2. Add `afrigrow.app` and `www.afrigrow.app`
3. At **Namecheap** → **Domain List** → **afrigrow.app** → **Manage** → **Advanced DNS**:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | **A Record** | `@` | `76.76.21.21` | Automatic |
   | **CNAME Record** | `www` | `cname.vercel-dns.com.` | Automatic |

   Remove any conflicting **Parking** or old **URL Redirect** records for `@` or `www`.

   **Option A — Vercel nameservers (alternative)**  
   Namecheap → **Nameservers** → Custom DNS → use the two nameservers Vercel provides.

4. Wait for DNS (often 5–60 minutes; up to 48h)
5. Vercel issues **SSL** automatically

Update `NEXT_PUBLIC_SITE_URL` to `https://afrigrow.app` and **Redeploy** if you deployed before the domain was set.

---

## Step 5 — Post-deploy checklist

- [ ] Homepage loads on `https://afrigrow.app`
- [ ] `/signup` creates an account (not preview/localStorage mode)
- [ ] `/login` → `/dashboard` works
- [ ] `/dashboard/profile` saves data
- [ ] `/contact` form → appears in `/dashboard/admin/enquiries`
- [ ] `/dashboard/admin/guides` (admin only) publishes a test guide
- [ ] `/learn/your-slug` shows the guide
- [ ] Google OAuth works (if enabled) with production redirect URL

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Auth redirects to localhost | Set `NEXT_PUBLIC_SITE_URL` + Supabase Site URL to production domain |
| Dashboard shows demo user “Amara” | Supabase env vars missing on Vercel — redeploy |
| Admin pages 403 | Add your email to `PLATFORM_ADMIN_EMAILS` + `platform_admin_allowlist` |
| Build fails on Vercel | Run `npm run build` locally; fix errors first |
| OAuth fails | Add exact callback URL in Google Cloud + Supabase |

---

## Local production test

```bash
cp .env.example .env.local   # or keep your existing .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run build
npm run start
```

Open http://localhost:3000
