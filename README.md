# CreatorFarm – Phase 6 (Clean Rebuild)

Clean Phase 6 focused on:
- Admin settings (prices + Razorpay plan IDs) stored in DB (`TierSettings` singleton)
- Membership page creates Razorpay subscriptions server-side

## Setup

1) Install dependencies
```bash
npm install
```

2) Create `.env` from `.env.example`

3) Push DB schema
```bash
npx prisma db push
npx prisma generate
```

4) Run
```bash
npm run dev
```

## Flow

1. Go to `/signin` and login using `ADMIN_EMAIL` + `ADMIN_PASSWORD`
2. Go to `/admin/settings` and save plan IDs:
   - `razorpayBasicPlanId`
   - `razorpayProPlanId`
3. Go to `/membership` and click Join Basic / Join Pro

## Why this avoids your earlier issues
- No nodemailer (so no `Can't resolve 'nodemailer'`)
- No `@/app/*` alias mistakes. All imports use `@/lib/...` which maps to `app/lib/...`
- Uses exact Prisma column names: `razorpayBasicPlanId`, `razorpayProPlanId`


## Phase 6+ (Auth + Razorpay + Chat)

### Required env vars
Auth:
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- ADMIN_EMAIL (optional, for env-admin credentials login)
- ADMIN_PASSWORD (optional)

Google OAuth:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

Magic link (SMTP):
- EMAIL_SERVER_HOST
- EMAIL_SERVER_PORT
- EMAIL_SERVER_USER
- EMAIL_SERVER_PASSWORD
- EMAIL_FROM

Razorpay:
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

DB:
- DATABASE_URL

### After pulling new schema
Run one of these (recommended):
- `npx prisma db push`
- or `npx prisma migrate dev`

Then:
- `npm install`
- `npm run dev`
