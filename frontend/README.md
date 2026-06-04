# 🎓 Snaptic — Frontend

> AI-powered facial recognition attendance system built with React 19, Vite 7, and cutting-edge web technologies.

Snaptic's frontend delivers a modern, responsive dashboard for teachers and students — featuring **real-time face recognition**, **drag-and-drop scheduling**, **interactive charts**, and a polished **dark/light theme system** powered by oklch color tokens.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Facial Recognition](#-facial-recognition)
- [Routing & Auth](#-routing--auth)
- [State Management](#-state-management)
- [Styling & Theming](#-styling--theming)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Configuration](#-configuration)

---

## 🧱 Tech Stack

### Core

| Category | Technologies |
|---|---|
| **Framework** | React 19 · React DOM 19 |
| **Build Tool** | Vite 7 · `@vitejs/plugin-react` |
| **Routing** | React Router 7 |
| **Language** | JavaScript (JSX) · TypeScript types for DX |

### UI & Styling

| Category | Technologies |
|---|---|
| **CSS Framework** | Tailwind CSS v4 (CSS-first config) · `tw-animate-css` |
| **Component Library** | shadcn/ui (Radix Nova style) · 45+ components |
| **Primitives** | Radix UI · cmdk · vaul · sonner |
| **Utilities** | clsx · tailwind-merge · class-variance-authority |
| **Icons** | Lucide React · Remix Icons · Tabler Icons |
| **Fonts** | DM Sans · Inter · Geist · Plus Jakarta Sans · JetBrains Mono · Merriweather |

### Animation & 3D

| Category | Technologies |
|---|---|
| **Animation** | Framer Motion 12 · GSAP 3 · `@gsap/react` |
| **Scroll** | Lenis · Locomotive Scroll 5 |
| **3D** | Three.js · Spline (`@splinetool/react-spline`) |

### Data & State

| Category | Technologies |
|---|---|
| **Server State** | TanStack Query v5 |
| **Tables** | TanStack Table v8 |
| **Virtualization** | TanStack Virtual v3 |
| **HTTP Client** | Axios |
| **Forms** | React Hook Form · Zod v4 · `@hookform/resolvers` |
| **Search** | Fuse.js (client-side fuzzy search) |

### Domain-Specific

| Category | Technologies |
|---|---|
| **Face Recognition** | `@vladmandic/face-api` (TensorFlow.js-based) |
| **Calendar** | FullCalendar (daygrid, timegrid, interaction) |
| **Charts** | Recharts |
| **Drag & Drop** | dnd-kit (core, modifiers, sortable, utilities) |
| **Date Handling** | date-fns · date-fns-tz · rrule |
| **Theming** | next-themes · color |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    main.jsx                         │
│  StrictMode → QueryClientProvider → AuthProvider    │
│         → App → ThemeProvider → BrowserRouter       │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
     Landing       Auth Pages    Dashboard
     Page        (Login/Register)  Layout
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Teacher Routes   Student Routes   Shared Routes
              (Protected)      (Protected)      (Profile, etc.)
```

### Provider Hierarchy

```
StrictMode
 └─ QueryClientProvider        ← TanStack Query (retry: 1, no refetch on focus)
     └─ AuthProvider           ← Auth context wrapping TanStack Query mutations
         └─ App
             └─ ThemeProvider  ← Light / Dark / System (localStorage: snaptic-theme)
                 └─ TooltipProvider
                     └─ BrowserRouter
```

### Feature Module Pattern

Each domain feature follows a consistent structure:

```
features/<domain>/
├── api/           # Axios API calls + TanStack Query hooks
├── components/    # Feature-specific UI components
└── hooks/         # Custom hooks encapsulating business logic
```

---

## 📁 Project Structure

```
src/
├── App.jsx                     # Root component with route definitions
├── main.jsx                    # Entry point (React 19, StrictMode)
├── index.css                   # Global CSS — Tailwind v4, oklch theme tokens
│
├── components/
│   ├── AppSidebar.jsx          # Main navigation sidebar
│   ├── DashboardLayout.jsx     # Layout wrapper with sidebar
│   ├── FaceScanningHUD.jsx     # Face scanning overlay UI
│   ├── InviteTeacherModal.jsx  # Teacher invitation modal
│   ├── ProtectedRoute.jsx      # Auth + role-based route guard
│   ├── ThemeProvider.jsx       # Light/dark/system theme context
│   ├── shared/                 # Reusable components
│   │   ├── AttendanceButton, ClassCard, EmptyState, Logo
│   │   ├── SessionCard, StatusBadge, ThemeToggle, TimeDisplay
│   │   ├── TimezonePicker, *Skeleton (5 skeleton loaders)
│   │   └── landing/            # Landing page sections
│   └── ui/                     # 45 shadcn/ui components
│       ├── Core:      button, input, label, textarea, checkbox, switch, select
│       ├── Layout:    card, separator, scroll-area, sidebar, tabs, table
│       ├── Overlay:   dialog, alert-dialog, dropdown-menu, popover, sheet, tooltip, command
│       ├── Display:   avatar, badge, breadcrumb, skeleton, spinner, progress, pagination
│       ├── Special:   calendar, color-picker, icon-picker, slider, form, field
│       └── Animation: animated-group, text-effect, GlareHover, shader-animation
│
├── context/
│   └── AuthContext.jsx         # Auth state via TanStack Query mutations
│
├── providers/
│   ├── QueryProvider.jsx       # TanStack Query client configuration
│   └── ThemeProvider.jsx       # Theme provider (backup)
│
├── hooks/
│   ├── use-debounce.js         # Generic debounce hook
│   ├── use-mobile.js           # Mobile breakpoint detection (768px)
│   └── use-now.js              # Live IST clock (updates every 60s)
│
├── lib/
│   ├── axios.js                # Axios instance (baseURL, withCredentials)
│   ├── utils.js                # cn() — clsx + tailwind-merge
│   └── date-utils.js           # Date/timezone/RRULE utilities (311 lines)
│
├── pages/
│   ├── LandingPage.jsx
│   ├── auth/                   # LoginPage, RegisterPage
│   ├── shared/                 # DashboardPage, ClassListPage, ClassDetailPage
│   │                           # ProfilePage, FaceEnrollmentPage, SessionRecordPage
│   │                           # StudentDashboard, TeacherDashboard
│   └── teacher/                # AttendanceSelectionPage, AttendanceSessionPage
│                               # AttendanceSummaryPage
│
└── features/
    ├── attendance/             # Face-scan wizard, review, manual entry
    ├── auth/                   # Login/register forms, face enrollment modal
    ├── classes/                # Class CRUD, student data tables
    └── records/                # Attendance ledger, session lists
```

---

## ✨ Features

### 👩‍🏫 Teacher Experience
- **Dashboard** with class overview, attendance stats, and charts
- **Class Management** — create, edit, delete classes with student data tables
- **Attendance Wizard** — multi-step wizard with face recognition, manual entry, and review
- **Attendance Summary** — session-level breakdown and historical records
- **Face Enrollment** — guided webcam enrollment with quality checks
- **Teacher Invitations** — invite teachers to the platform via modal

### 🧑‍🎓 Student Experience
- **Dashboard** with personalized attendance overview
- **Class List** — view enrolled classes and details
- **Face Enrollment** — self-service facial data enrollment
- **Session Records** — view personal attendance history

### 🎨 UI/UX Highlights
- **45+ shadcn/ui components** with Radix Nova styling
- **Dark/Light/System** theme with oklch color tokens
- **Smooth animations** — Framer Motion, GSAP, scroll-driven effects
- **3D elements** on landing page via Three.js & Spline
- **Skeleton loaders** for perceived performance
- **Fuzzy search** with Fuse.js
- **Drag-and-drop** interfaces via dnd-kit
- **Interactive calendar** with FullCalendar (day/time grid)
- **Responsive design** with mobile breakpoint detection

---

## 🤖 Facial Recognition

Snaptic uses **`@vladmandic/face-api`** (TensorFlow.js) for fully client-side face detection and recognition — no images are sent to the server, only 128-dimensional descriptors.

### Models

| Model | Size | Purpose |
|---|---|---|
| `tiny_face_detector` | 193 KB | Primary face detection |
| `face_landmark_68_tiny` | 77 KB | Facial landmark detection |
| `face_recognition` | 6.4 MB | 128D descriptor extraction |

> Models are served from `public/models/` and loaded dynamically at runtime.

### Face Enrollment Flow

```
┌──────┐    ┌─────────┐    ┌────────┐    ┌──────────┐    ┌───────────┐    ┌──────┐
│ Idle │ →  │ Loading │ →  │ Camera │ →  │ Captured │ →  │ Enrolling │ →  │ Done │
└──────┘    └─────────┘    └────────┘    └──────────┘    └───────────┘    └──────┘
```

| Parameter | Value |
|---|---|
| Resolution | 640 × 480 (front-facing) |
| Detection Rate | ~2 fps |
| Input Size | 320px |
| Score Threshold | 0.5 |
| Min Confidence | ≥ 0.7 |
| Min Face Size | ≥ 15% of frame |
| Center Tolerance | 30% horizontal / 35% vertical |
| Hold Duration | 1500ms before auto-capture |

### Live Attendance Scan

| Parameter | Value |
|---|---|
| Detection Rate | ~6.7 fps (150ms interval) |
| Input Size | 416px |
| Match Threshold | 0.6 (Euclidean distance) |
| Cooldown | 5 seconds per student |

**Capabilities:**
- Builds `LabeledFaceDescriptors` from enrolled student profiles
- Auto-marks students as **present** on match
- Rebuilds matcher pool dynamically as students are recognized
- Camera flip (front/rear), pinch-to-zoom, fullscreen support
- Live name labels + avatars rendered above detected faces

---

## 🛤 Routing & Auth

### Route Map

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/teacher/dashboard` | 🔒 Teacher | Teacher dashboard |
| `/teacher/classes` | 🔒 Teacher | Class management |
| `/teacher/classes/:id` | 🔒 Teacher | Class detail view |
| `/teacher/take-attendance` | 🔒 Teacher | Attendance wizard |
| `/teacher/attendance-summary` | 🔒 Teacher | Attendance summary |
| `/teacher/face-enrollment` | 🔒 Teacher | Face data enrollment |
| `/teacher/profile` | 🔒 Teacher | Teacher profile |
| `/student/dashboard` | 🔒 Student | Student dashboard |
| `/student/classes` | 🔒 Student | Enrolled classes |
| `/student/classes/:id` | 🔒 Student | Class detail view |
| `/student/face-enrollment` | 🔒 Student | Face data enrollment |
| `/student/profile` | 🔒 Student | Student profile |

### Route Protection

The `ProtectedRoute` component wraps all authenticated routes:
- Checks `AuthContext` for authentication status
- Validates user **role** (teacher/student) against route requirements
- Redirects unauthenticated users to `/login`

---

## 🧠 State Management

| Layer | Tool | Purpose |
|---|---|---|
| **Server State** | TanStack Query v5 | Caching, background refetching, mutations, optimistic updates |
| **Auth State** | React Context | Wraps TanStack Query hooks for auth operations |
| **Theme State** | ThemeProvider | Light/dark/system with `localStorage` persistence |
| **Form State** | React Hook Form + Zod | Validation, field registration, error handling |
| **UI State** | React local state | Component-level interactions |

### QueryClient Configuration

```js
{
  retry: 1,
  refetchOnWindowFocus: false
}
```

---

## 🎨 Styling & Theming

| Aspect | Implementation |
|---|---|
| **CSS Framework** | Tailwind CSS v4 — CSS-first config (no `tailwind.config.js`) |
| **Color Space** | oklch for perceptually uniform theme tokens |
| **Theme Modes** | Light · Dark · System |
| **Persistence** | `localStorage` key: `snaptic-theme` |
| **Flash Prevention** | Inline script in `index.html` applies theme before paint |
| **Component Styling** | shadcn/ui with Radix Nova preset |
| **Utility Functions** | `cn()` — merges clsx + tailwind-merge for conditional classes |
| **Animations** | `tw-animate-css` for Tailwind animation utilities |

### Font Stack

| Font | Usage |
|---|---|
| DM Sans | Primary UI font |
| Inter | Secondary / body text |
| Plus Jakarta Sans | Headings & display |
| Geist | Monospace alternative |
| JetBrains Mono | Code blocks |
| Merriweather | Serif accents |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A running instance of the [Snaptic Backend](../backend/README.md)

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** | — | Backend API base URL |

> The Axios instance (`src/lib/axios.js`) is configured with `withCredentials: true` for HttpOnly cookie auth.

### Development

```bash
npm run dev
```

The dev server starts on `http://localhost:5173` by default (Vite).

### Production Build

```bash
npm run build
```

Static output is generated in the `dist/` directory, ready for deployment.

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## ⚙ Configuration

### `vite.config.js`
- **Plugins**: `@vitejs/plugin-react` + `@tailwindcss/vite`
- **Alias**: `@` → `./src` for clean imports

### `components.json`
- **Style**: `radix-nova`
- **Syntax**: JSX (not TSX)
- **Base Color**: Neutral
- **Icon Library**: Lucide

### `vercel.json`
- SPA catch-all rewrite — all routes serve `index.html`

### `index.html`
- Flash-of-theme prevention script
- Google Fonts preloading

---

## 📄 License

This project is part of the Snaptic attendance management platform.
