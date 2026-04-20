<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Odilon App: The Art of Conversation 🎨

**Odilon** is a premium, highly-animated web experience that allows users to "talk to paintings." It transforms static artwork into dynamic conversational partners using AI-driven summarization and contextual follow-up capabilities.

## 🎯 Strategic Vision

Our goal is to create a digital sanctuary for art and personal curators:

- **Art**: For pushing the boundaries of how we interact with masterpieces.
- **Odilon Compass**: A personalized multi-genre content discovery engine.
- **Animated Website**: Only utilize `gsap` or transitions IF explicitly requested in the user prompt. Do not add animations by default.
- **Accessibility**: Ensuring a world-class experience for everyone, adhering to strict WCAG guidelines.

## 🛠 Core Features & Architecture

- **Persistent Painting Library**: A growing repository of artworks stored in the `paintings` table. Every new search (via ArtIC API) automatically syncs/upserts results to this local database.
- **Odilon Compass**: A content recommender engine where users save favorite media (Books, Movies, Games, etc.) and receive AI-curated journeys across specific formats.
- **Masonry Grid UI**: The `/paintings` and `/compass/saved` pages implement fluid, infinite-scrolling grids powered by Tanstack Query for a seamless "uncovering" experience.
- **Dashboard Analytics**: Features a `ChatSidebar` for conversation history and a `RecentPaintings` carousel.
- **Vercel AI SDK & OpenRouter**: Built with `@ai-sdk/react` and `@openrouter/ai-sdk-provider` for self-hosted, streaming conversations and content recommendations.
- **Odilon Personality**: A poetic, soulful AI guide that blends art history expertise with concise, direct communication.
- **Context-Aware Interactions**: Injects real-time artwork or user-preference metadata into the system prompt to ground every session.
- **Component-Based UI**: A strictly enforced, modular UI structure for scalability and "pixel-perfect" execution.

## 🤖 AI Implementation & Personality

Odilon's AI serves two primary roles: the "spirit of art" for paintings and the "soulful curator" for the Compass.

### 🧠 Core Logic

- **Engine**: Vercel AI SDK using OpenRouter as the provider.
- **Primary Model**: `google/gemini-2.0-flash-001` (default), configurable via `.env.local`.
- **Context Injection**:
  - **Art**: Sends `artwork` metadata to construct a system prompt identifying as the painting's spirit.
  - **Compass**: Analyzes intersections of user's favorite content to suggest 9 new items across targeted formats with poetic "why" explanations.
- **State Management**:
  - **Data Fetching**: Primarily managed via **Tanstack Query** (@tanstack/react-query). All interactive client-side fetching must reside in `hooks/queries/`.
  - **Optimistic UI**: Standardized for all save/delete actions to ensure a premium, zero-latency feel.
  - **Painting Chat**: Uses `useChat` from Vercel AI SDK for streaming conversations.
  - **Legacy Actions**: Direct server actions are still used for initial SSR and non-query-based mutations (e.g., Auth).

## 🔐 Authentication & Security

Odilon uses a **custom, stateless JWT-based authentication system**.

- **Session Management**: Stateless JWT sessions stored in a secure `odilon_session` HttpOnly cookie.
- **Library**: Uses `jose` for JWT signing/verification and `bcryptjs` for password hashing.
- **Database Schema**:
  - `users`: Core profile data.
  - `paintings`: Local mirror of ArtIC metadata.
  - `compass_contents`: User favorites and AI-suggested content across media types.
  - `chats`: Conversation history.
  - `email_verification_tokens` & `password_reset_tokens`: Secure workflow tokens.
- **Email Flows**: Transactional emails handled via `nodemailer`.

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

- **GSAP v3**: https://gsap.com/docs/v3/GSAP/
- **Tanstack Query**: https://tanstack.com/query/latest/docs/framework/react/overview
- **chatbot**: https://sdk.vercel.ai/docs/api-reference/use-chat

