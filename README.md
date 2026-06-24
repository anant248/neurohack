<!-- back to top anchor -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/anant248/neurohack">
    <!-- 📸 IMAGE PLACEHOLDER: drop a square logo (80×80 px) at images/logo.png -->
    <img src="images/logo.png" alt="Interprep Logo" width="140" height="140">
  </a>

  <h3 align="center">Interprep</h3>

  <p align="center">
    AI-powered interview prep — behavioural coaching with real-time face analysis and a live coding environment.
    <br />
    <br />
    <a href="https://neurohack25.vercel.app">🚀 Live Demo</a>
    &middot;
    <a href="https://github.com/anant248/neurohack/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/anant248/neurohack/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#file-structure">File Structure</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

<!-- ABOUT THE PROJECT -->
## About The Project

<!-- 📸 IMAGE PLACEHOLDER: drop a full-width screenshot at images/screenshot.png (recommended ~1400×800 px) -->
[![Interprep Screenshot][product-screenshot]](https://neurohack25.vercel.app)

Interprep is a full-stack interview preparation platform built for the [NeuroHack 2025 hackathon](https://devpost.com/software/interprep-0bt7uy). It combines in-browser **face landmark detection** with **Gemini-powered AI coaching** to give candidates actionable feedback on both their presence and their answers.

**Behavioural Practice (`/practice`)**
- Paste your resume + job description → Gemini generates **8–10 tailored behavioural questions** with STAR framework hints, specific to the role and your background
- Or jump straight in with **General Practice** (no JD required) using a curated bank of 10 questions across Leadership, Teamwork, Adaptability, and more
- Hit **Start Recording** (after a 5-second countdown) — MediaPipe tracks your eye contact and facial expression in real time, entirely in the browser
- When you stop, Gemini returns structured coaching across three dimensions: *Visual Presence*, *STAR Tip*, and *Key Focus*
- Session history is charted over time; sign in to persist it across devices

**Technical Practice (`/technical`)**
- In-browser code editor (CodeMirror 6) with JavaScript and Python support
- Run code, fetch LeetCode problems, and get AI code review — all without leaving the page

**Coffee Chats (`/coffee-chats`)**
- Plan and run informational interviews and networking conversations — log a chat per contact with their **name, company, role, date, and format** (virtual or in-person)
- Build your question list from a curated **suggested-questions** library or add your own custom questions
- Take **rich-text notes** under each question during the chat (TipTap editor — bold, lists, highlights, links)
- Track a **sticky to-do / follow-up checklist** alongside the conversation, and **generate AI follow-up to-dos** from your notes with Gemini
- Everything is saved to your account so each conversation is there when you come back

**Everything else**
- Google and GitHub OAuth via Supabase — sign in or use the app anonymously
- Behavioural Story Bank: save and manage your own STAR stories for quick reference during sessions
- Fully responsive — works on mobile and desktop

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

[![Next.js][Next-badge]][Next-url]
[![React][React-badge]][React-url]
[![TypeScript][TS-badge]][TS-url]
[![Tailwind CSS][Tailwind-badge]][Tailwind-url]
[![Supabase][Supabase-badge]][Supabase-url]
[![Gemini][Gemini-badge]][Gemini-url]
[![MediaPipe][MediaPipe-badge]][MediaPipe-url]
[![Playwright][Playwright-badge]][Playwright-url]

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, custom CSS |
| AI | Google Gemini (`gemini-3.1-flash-lite`) |
| Vision | MediaPipe Tasks Vision (face landmark detection, runs fully in-browser) |
| Auth & DB | Supabase (Google + GitHub OAuth, PostgreSQL) |
| Code Editor | CodeMirror 6 via `@uiw/react-codemirror` |
| Rich-text Editor | TipTap 3 (coffee-chat notes) |
| Charts | Chart.js 4 |
| Animation | Framer Motion, Lenis (smooth scroll) |
| Icons | lucide-react |
| Validation | Zod |
| Testing | Playwright (E2E), Vitest (unit) |
| Deployment | Vercel |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- A **Google Gemini API key** (free tier works) — [get one here](https://aistudio.google.com/app/apikey)
- *(Optional)* A **Supabase project** for auth and persistence — [supabase.com](https://supabase.com)

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/anant248/neurohack.git
   cd neurohack
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```env
   # Required — AI features
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

   # Optional — auth & session persistence (skip to run without sign-in)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run tests**
   ```sh
   npm test           # Vitest unit tests
   npm run test:e2e   # Playwright E2E tests (requires dev server running)
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- USAGE -->
## Usage

**Behavioural Practice**
1. Navigate to `/practice`
2. Paste your resume and a job description, then click **Generate Tailored Questions** — or click **Practice without tailored questions** to skip straight to the session
3. Select a question from the dropdown (or hit **Random**)
4. Choose **Eye Contact & Expression** as your analysis mode
5. Click **Start Recording** — allow camera access when prompted, then begin answering after the 5-second countdown
6. Click **Stop & Analyze** when done; AI feedback appears in the left panel
7. Open **History** in the nav to review your progress chart across sessions

**Technical Practice**
1. Navigate to `/technical`
2. Pick a language (JavaScript or Python) and write your solution in the editor
3. Click **Run** to execute the code in-browser
4. Use the **AI Code Review** button for Gemini-powered feedback on your solution
5. Fetch a LeetCode problem directly from the sidebar to practise on real interview questions

**Coffee Chats**
1. Navigate to `/coffee-chats`
2. Click **New** to create a chat, then fill in the contact's name, company, role, date, and format (virtual or in-person)
3. Add questions from the **suggested-questions** list or type your own
4. During (or after) the conversation, take **rich-text notes** under each question
5. Track follow-ups in the **to-dos** panel, or click **Generate to-dos** to have Gemini suggest follow-up actions from your notes
6. Chats are saved to your account automatically — sign in to keep them across devices

<!-- 📸 IMAGE PLACEHOLDER: add usage GIFs or additional screenshots at images/usage-behavioral.gif and images/usage-technical.gif -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- FILE STRUCTURE -->
## File Structure

```
neurohack/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/delete-account/ # POST — delete the signed-in user's account
│   │   │   ├── behavioral-prep/     # POST — Gemini question generation
│   │   │   ├── behavioral-bank/     # GET, POST + [id] — STAR story bank CRUD
│   │   │   ├── coffee-chats/        # GET, POST + [id] — coffee-chat CRUD
│   │   │   │   └── generate-todos/  # POST — Gemini follow-up to-do generation
│   │   │   ├── feedback/            # POST — Gemini coaching from face scores
│   │   │   ├── sessions/            # GET, POST, DELETE — practice session history
│   │   │   ├── prep-sessions/       # POST + [id]/notes — session notes persistence
│   │   │   ├── code-review/         # POST — Gemini code review
│   │   │   ├── run-code/            # POST — in-browser code execution
│   │   │   ├── fetch-jd/            # POST — job description scraper
│   │   │   ├── leetcode/            # GET — LeetCode problem fetcher
│   │   │   └── submit-feedback/     # POST — user feedback submission
│   │   ├── auth/                    # Sign-in page, OAuth callback, reset-password
│   │   ├── practice/                # Behavioural interview page (+ loading.tsx)
│   │   ├── technical/               # Coding practice page (+ loading.tsx)
│   │   ├── coffee-chats/            # Coffee-chat tracker page (+ loading.tsx, styles.css)
│   │   ├── facelandmarker/          # MediaPipe debug/demo page
│   │   ├── layout.tsx               # Root layout (aurora bg, footer, shell)
│   │   ├── page.tsx                 # Landing page
│   │   ├── page.css / globals.css   # Landing + global styles
│   │   └── ...                      # favicon, etc.
│   ├── middleware.ts                # Supabase session refresh on each request
│   ├── components/
│   │   ├── practice/
│   │   │   ├── VideoCapture.tsx     # Camera feed, countdown, analysis mode toggle
│   │   │   ├── SetupPanel.tsx       # Resume + JD input, question generation
│   │   │   ├── QuestionSelector.tsx # Question dropdown + Random button + STAR hints
│   │   │   ├── ResultsCard.tsx      # AI feedback display (3 sections)
│   │   │   ├── HistoryModal.tsx     # Session progress chart + clear history
│   │   │   ├── BehavioralBankModal.tsx  # STAR story manager
│   │   │   ├── CompanyCard.tsx      # Company context card
│   │   │   └── SessionNotes.tsx     # Per-session notes
│   │   ├── coffee-chats/
│   │   │   ├── ChatEditor.tsx       # Single coffee-chat editor (contact + questions)
│   │   │   ├── QuestionEditor.tsx   # Per-question rich-text notes
│   │   │   ├── RichToolbar.tsx      # TipTap formatting toolbar
│   │   │   └── StickyTodos.tsx      # Follow-up to-do checklist
│   │   ├── nav/                     # PrepModeDropdown (mode switcher) + styles
│   │   ├── auth/                    # AuthButton, AuthForm, AccountModal
│   │   ├── ui/                      # Button, Card, Modal primitives
│   │   ├── FeedbackBubble.tsx       # Floating in-app feedback widget
│   │   ├── PageLoading.tsx          # Shared route-loading spinner
│   │   └── Footer.tsx
│   ├── hooks/
│   │   ├── useFaceLandmarker.ts     # MediaPipe integration (recording, scoring)
│   │   ├── useSessionHistory.ts     # History state + Supabase sync
│   │   ├── usePrepSession.ts        # Active session state machine
│   │   ├── useBehavioralBank.ts     # Story bank state + Supabase sync
│   │   ├── useCoffeeChats.ts        # Coffee-chat state + Supabase sync
│   │   ├── useInterviewTimer.ts     # 2-minute countdown timer
│   │   ├── useResume.ts             # Resume text persistence (localStorage)
│   │   └── useAuth.ts               # Auth session listener
│   └── lib/
│       ├── faceLandmarker.ts        # MediaPipe model loader
│       ├── prompts.ts               # Gemini feedback prompt builder
│       ├── codeReviewPrompt.ts      # Gemini code-review prompt builder
│       ├── codeRunner.ts            # In-browser JS/Python execution
│       ├── leetcode.ts              # LeetCode fetch + parsing helpers
│       ├── coffeeChats.ts           # Coffee-chat model + suggested questions
│       ├── generalQuestions.ts      # 10 general behavioural questions
│       ├── localData.ts             # Local-data clearing / owner reconciliation
│       ├── constants.ts             # Shared constants
│       ├── types.ts                 # Shared TypeScript types
│       ├── database.types.ts        # Generated Supabase schema types
│       ├── flags.ts                 # Feature flags
│       ├── utils.ts                 # Misc helpers
│       └── supabase/                # Supabase client (browser, server, admin)
├── tests/
│   ├── unit/                        # Vitest unit tests (api, lib, hooks, components)
│   └── e2e/                         # Playwright E2E tests (practice, coffee-chats, auth, landing)
├── supabase/                        # Supabase config & SQL migrations
├── public/                          # Static assets (screenshots, demo videos)
├── scripts/                         # One-off Node dev tools
└── tasks/                           # Dev planning docs (handoff, lessons)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTRIBUTING -->
## Contributing

Contributions are welcome! If you have a suggestion or fix, please open a pull request.

1. Fork the Project
2. Create your feature branch
   ```sh
   git checkout -b feature/your-feature
   ```
3. Commit your changes
   ```sh
   git commit -m 'feat: add your feature'
   ```
4. Push to the branch
   ```sh
   git push origin feature/your-feature
   ```
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTACT -->
## Contact

Anant Goyal — [LinkedIn](https://linkedin.com/in/anant-goyal1) — [Email](anantgoyal2000@gmail.com)

Project Link: [https://github.com/anant248/neurohack](https://github.com/anant248/neurohack)

Live App: [https://neurohack25.vercel.app](https://neurohack25.vercel.app)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/anant248/neurohack.svg?style=for-the-badge
[contributors-url]: https://github.com/anant248/neurohack/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/anant248/neurohack.svg?style=for-the-badge
[forks-url]: https://github.com/anant248/neurohack/network/members
[stars-shield]: https://img.shields.io/github/stars/anant248/neurohack.svg?style=for-the-badge
[stars-url]: https://github.com/anant248/neurohack/stargazers
[issues-shield]: https://img.shields.io/github/issues/anant248/neurohack.svg?style=for-the-badge
[issues-url]: https://github.com/anant248/neurohack/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/anant-goyal1
[product-screenshot]: images/screenshot.png

[Next-badge]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React-badge]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TS-badge]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/
[Tailwind-badge]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Supabase-badge]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Gemini-badge]: https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white
[Gemini-url]: https://aistudio.google.com/
[MediaPipe-badge]: https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white
[MediaPipe-url]: https://developers.google.com/mediapipe
[Playwright-badge]: https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white
[Playwright-url]: https://playwright.dev/
