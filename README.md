# Odilon App: The Art of Conversation 🎨

**Odilon** is a premium, AI-powered web experience designed for art enthusiasts and personal curators. It transforms static media into dynamic, conversational, and exploratory journeys.

## 🛠 Core Tools

### 🏛 Odilon Museum (Talk to Paintings)

Unlock the "spirit" of world-class masterpieces. Using the ArtIC API and advanced AI, Odilon allows you to have deep, poetic conversations with paintings. Each artwork is synchronized to a local library, creating a personal sanctuary of artistic dialogue.

### 🧭 Odilon Compass (Content Recommender)

A multi-genre discovery engine for your soul. Save your favorite books, movies, games, and more. Odilon Compass analyzes your taste to curate unique journeys across different media formats, complete with poetic explanations for every recommendation.

## 🚀 Local Setup Guide

Follow these steps to get Odilon running on your machine:

### 1. Prerequisites

- **Node.js** (v18 or higher recommended)
- **PNPM** or **NPM**
- **PostgreSQL** database

### 2. Clone & Install

```bash
git clone https://github.com/your-username/odilonapp.git
cd odilonapp
pnpm install # or npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following:

```env
# AI Provider (OpenRouter)
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-001

# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/odilon

# Authentication & URL
AUTH_SECRET=your_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=email1@example.com,email2@example.com # Comma-separated list for dashboard access

# Email (Optional/SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=Odilon <noreply@yourdomain.com>
```

### 4. Database Setup

Push the schema to your local PostgreSQL instance:

```bash
pnpm db:push # or npm run db:push
```

### 5. Launch the App

```bash
pnpm dev # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start your artistic journey.

---

Built with **Next.js**, **Drizzle ORM**, and the **Vercel AI SDK**. Inspired by the poetic soul of art.
