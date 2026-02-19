# CreatorFarm

A Patreon-style creator membership platform built with Next.js 14, Prisma, PostgreSQL, and Razorpay.

## Features

- **Auth:** Email/password, Google OAuth, Magic links (NextAuth)
- **Password reset:** Forgot password → email link → reset flow
- **Tiers:** Free, Basic, Pro (Razorpay recurring subscriptions)
- **Content feed:** Posts with access control (FREE / BASIC / PRO / PAID)
- **Admin panel:** Create/edit/delete posts, manage creator profile, configure Razorpay plan IDs
- **Member chat:** 1:1 chat between members and admin (5s polling)
- **Media uploads:** Upload images/videos from admin post editor
- **Legal:** Terms of Service and Privacy Policy pages
- **Rate limiting:** Signup and auth routes protected against abuse

---

## Quick Deploy (Vercel + Neon)

### 1. Database

Create a free PostgreSQL database at https://neon.tech or https://supabase.com. Copy the connection string.

### 2. Clone & Install

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Key values you MUST set:
- DATABASE_URL – your Postgres connection string
- NEXTAUTH_URL – your site URL (e.g. https://yourapp.vercel.app)
- NEXTAUTH_SECRET – run: openssl rand -base64 32
- ADMIN_EMAIL + ADMIN_PASSWORD – your admin login
- RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET + RAZORPAY_WEBHOOK_SECRET
- EMAIL_SERVER_* + EMAIL_FROM – for magic links and password reset

### 4. Run Migrations

```bash
npx prisma migrate deploy
```

### 5. Deploy to Vercel

Add all .env.local values as environment variables in the Vercel dashboard, then deploy.

---

## Razorpay Setup

1. Create plans in Razorpay Dashboard -> Products -> Subscriptions -> Plans
2. Sign in as admin -> Admin Settings -> paste plan IDs
3. Add webhook: https://your-domain.com/api/razorpay/webhook
   Events: subscription.* and payment.*

---

## Email Setup (Gmail)

1. Enable 2FA on Google account
2. Google Account -> Security -> App Passwords -> create one for Mail
3. Use that 16-char password as EMAIL_SERVER_PASSWORD
