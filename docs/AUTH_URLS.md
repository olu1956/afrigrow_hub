# AfriGrow — custom domain & auth URLs (after DNS works)

## Vercel environment

**Project → Settings → Environment Variables**

Set (or update):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.afrigrow.app` |

Keep Production + Preview checked. **Redeploy** after changing.

## Supabase Authentication → URL configuration

| Field | Value |
|--------|--------|
| **Site URL** | `https://www.afrigrow.app` |
| **Redirect URLs** (add all) | `https://www.afrigrow.app/auth/callback` |
| | `https://afrigrow.app/auth/callback` |
| | `http://localhost:3000/auth/callback` |

Save. Then test: sign up / magic-link / password reset emails should land on `www.afrigrow.app`.

## Smoke test

- [ ] `https://www.afrigrow.app` loads
- [ ] Sign up → confirmation email (if enabled) → callback works
- [ ] Log in → dashboard
- [ ] Google OAuth (if enabled) uses production callback
