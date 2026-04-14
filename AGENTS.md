<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Odilon App: The Art of Conversation 🎨

**Odilon** is a premium, highly-animated web experience that allows users to "talk to paintings." It transforms static artwork into dynamic conversational partners using AI-driven summarization and contextual follow-up capabilities.

## 🎯 Strategic Vision

Our goal is to create a digital sanctuary for art that wins top-tier awards in:

- **Art**: For pushing the boundaries of how we interact with masterpieces.
- **Animated Website**: Only utilize `anime.js` or transitions IF explicitly requested in the user prompt. Do not add animations by default.
- **Accessibility**: Ensuring a world-class experience for everyone, adhering to strict WCAG guidelines so that the "voice of art" is accessible to all.

## 🛠 Core Features & Architecture

- **Persistent Painting Library**: A growing repository of artworks stored in the `paintings` table. Every new search (via ArtIC API) automatically syncs/upserts results to this local database.
- **Masonry Grid UI**: The `/paintings` page implements a fluid, server-paginated (20 per page) masonry grid with client-side filtering (`LibraryFilters`).
- **Dashboard Analytics**: Features a `ChatSidebar` for conversation history and a `RecentPaintings` carousel showing the last 8 unique paintings the user interacted with.
- **Vercel AI SDK & OpenRouter**: Built with `@ai-sdk/react` and `@openrouter/ai-sdk-provider` for self-hosted, streaming conversations.
- **Odilon Personality**: A poetic, soulful AI guide that blends art history expertise with concise, direct communication.
- **Context-Aware Interactions**: Injects real-time artwork metadata (artist, medium, origin) into the system prompt to ground every conversation.
- **Component-Based UI**: A strictly enforced, modular UI structure for scalability and "pixel-perfect" execution.

## 🤖 AI Implementation & Personality

Odilon's AI isn't just a chatbot; it's a "spirit of art" designed to make masterpieces approachable.

### 🧠 Core Logic (`/api/chat`)
- **Engine**: Vercel AI SDK `streamText` using OpenRouter as the provider.
- **Primary Model**: `google/gemini-2.0-flash-001` (default).
- **Context Injection**: 
    - The `Chat` component sends the current `artwork` metadata in the POST body.
    - The server dynamically constructs a `systemPrompt` that identifies the AI as the spirit of that specific painting.
- **State Management**:
    - Uses `useChat` hook for real-time streaming.
    - Persists messages to the `chats` table via a background server action (`updateConversationMessages`) triggered on `onFinish`.

## 🔐 Authentication & Security

Odilon uses a **custom, stateless JWT-based authentication system** to maintain branding control and eliminate external provider dependencies.

- **Session Management**: Stateless JWT sessions stored in a secure `odilon_session` HttpOnly cookie.
- **Library**: Uses `jose` for JWT signing/verification and `bcryptjs` for password hashing.
- **Route Protection**: Managed via the Next.js 16 `proxy.ts` convention (successor to `middleware.ts`).
- **Database Schema**: 
    - `users`: Core profile data.
    - `paintings`: Persistent mirror of ArtIC metadata; synced on-the-fly during search.
    - `chats`: Conversation history and metadata.
    - `email_verification_tokens`: Time-limited tokens for account activation.
    - `password_reset_tokens`: Secure recovery flow tokens.
- **Email Flows**: Transactional emails (Signup, Recovery) are handled via `nodemailer` using SMTP.

## 🖋 Design Principles

1. **Pixel Perfection**: Every element must align strictly with the branding guidelines.
2. **On-Demand Motion**: Animation is NOT a default; it should only be implemented when specifically defined in the user's request.
3. **No Italics**: The app should never use italic fonts. All text must be `font-style: normal`.
4. **Restricted Palette**: Do NOT use any colors outside of the defined Brand Color Palette.
5. **Accessible by Design**: Semantic HTML, ARIA excellence, and screen-readable canvas/visual content descriptions.

## 🔡 Visual Identity & Brand Colors

### Brand Color Palette
- **Backgrounds**: `#F6E6CB` (Page backgrounds, chat message backgrounds)
- **Primary Text**: `#6B4F4F` (Sub texts, descriptions, paragraphs, text on darker backgrounds)
- **Headings & Logo**: `#483434` (Logo, headings, titles, important texts, footer backgrounds)
- **Cards & Buttons**: `#E7D4B5` (Card backgrounds, button backgrounds)
- **Accent**: `#B6C7AA` (Icons, links, SVGs, effects)

### Typography
We use a curated selection of Google Fonts (Normal style only):
- **Logo Font**: `Gloock` "odilon".
- **Header & Title Font**: `Bree Serif`.
- **Main Body & UI Font**: `Assistant`.

## 🚀 Guidelines for Development

- **Component Integrity**: Use reusable components in `src/components`.
- **Branding Adherence**: Check `public/branding/` (or equivalent) for color tokens and logo usage.
- **Performance**: High-fidelity animations must remain performant on all devices.

## 📚 Documentation

- **anime.js**: https://animejs.com/documentation/
- **chatbot**: https://sdk.vercel.ai/docs/api-reference/use-chat
