# Billys Hub

Internal operations platform for the Billys.gr team. Built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Leave Management** — Submit, approve/reject leave requests with auto-calculated working days
- **Team Calendar** — Shared monthly view of absences and public holidays
- **Knowledge Center** — Company wiki with rich text articles, search, and categories
- **Announcements** — Internal news feed with pinned posts and read tracking
- **Employee Directory** — Searchable team directory with editable profiles
- **Admin Panel** — User management, departments, holidays, and audit log

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js v5 with Google OAuth (@billys.gr domain only)
- **UI:** Custom shadcn/ui components with Billys brand
- **Email:** Resend

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or Docker)
- Google OAuth credentials configured for your domain

## Setup

### 1. Clone and install

```bash
git clone <repo-url> billys-hub
cd billys-hub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
- `RESEND_API_KEY` — From resend.com (optional, emails will be logged to console without it)

### 3. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env`

### 4. Set up database

**Option A: Docker (recommended)**

```bash
docker compose up db -d
```

**Option B: Local PostgreSQL**

Create a database named `billys_hub`.

### 5. Run migrations and seed

```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 6. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Docker Deployment

```bash
docker compose up --build
```

This starts both PostgreSQL and the Next.js app. After first run:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx prisma/seed.ts
```

## Seeded Users

| Email | Role |
|---|---|
| ceo@billys.gr | Super Admin |
| hr@billys.gr | HR Admin |

## Project Structure

```
app/
  api/              # API routes
  (auth)/login/     # Login page
  (app)/            # Authenticated routes
    dashboard/      # Main dashboard
    leaves/         # Leave management
    calendar/       # Team calendar
    knowledge/      # Knowledge base
    announcements/  # Company announcements
    directory/      # Employee directory
    admin/          # Admin panel
components/
  ui/               # Base UI components
  leaves/           # Leave-specific components
  knowledge/        # Knowledge base components
  admin/            # Admin components
  shared/           # Shared layout components
lib/
  auth.ts           # NextAuth configuration
  prisma.ts         # Prisma client singleton
  holidays.ts       # Orthodox Easter calculation
  email.ts          # Email templates (Resend)
  utils.ts          # Utility functions
prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed data
```

## Greek Public Holidays

The system includes all official Greek public holidays (2024-2030), including Orthodox Easter-dependent moveable holidays calculated using the Julian calendar Meeus algorithm.

## Roles

| Role | Access |
|---|---|
| Super Admin | Full access to everything |
| HR Admin | Manage leaves, holidays, knowledge base, users |
| Manager | Approve leaves for their department |
| Employee | Submit leaves, view calendar, read knowledge base |
