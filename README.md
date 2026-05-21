# Dietly Frontend

React (Vite) app for the Dietly nutrition and activity tracking API.

## Environment

Copy `.env.example` to `.env`:

```sh
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API base (includes `/api/v1`) |

## Development

```sh
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)  
API docs (backend): [http://localhost:8000/docs](http://localhost:8000/docs)

## Build

```sh
npm run build
npm run preview
```

## Docker

```sh
docker build -t dietly-frontend .
docker run -p 5173:80 dietly-frontend
```

## Project structure

```
dietly-frontend/
├── public/                 # Static assets (favicon, etc.)
├── src/
│   ├── api/                # HTTP clients (Axios + public fetch)
│   │   ├── auth.js         # POST /auth/login, /auth/register
│   │   ├── axiosInstance.js
│   │   ├── images.js       # Meal photo upload, analyze, relog
│   │   ├── meal.js         # Meal summaries
│   │   ├── steps.js        # Step tracking summaries
│   │   ├── user.js         # Profile, streak, net calories, avatar
│   │   └── userCalories.js # Activity / exercise log entries
│   ├── components/
│   │   ├── dashboard/      # MacroRings, StepBarChart
│   │   ├── Layout/         # AppShell, AppSidebar, PublicNavbar, …
│   │   ├── meal/           # MealAnalysisResult
│   │   └── ui/             # PillButton, Toggle
│   ├── config/
│   │   └── api.js          # Base URL helpers
│   ├── lib/
│   │   ├── activities.js   # Activity type presets
│   │   ├── apiErrors.js    # Axios error message helper
│   │   ├── bmi.js
│   │   ├── format.js       # Dates, numbers, initials
│   │   └── settingsStorage.js
│   ├── pages/              # Route screens (see below)
│   ├── slices/
│   │   └── authSlice.js    # Redux: token, user, login/register
│   ├── App.jsx             # Router + auth bootstrap
│   ├── main.jsx            # React root + Redux Provider
│   ├── store.js
│   └── index.css           # Tailwind + theme tokens
├── .env.example
├── components.json         # shadcn/ui config (optional CLI)
├── Dockerfile
├── index.html
├── nginx.conf
├── package.json
└── vite.config.js
```

### Routes

| Path | Page | Auth |
|------|------|------|
| `/` | `Home` → `Dashboard` (signed in) or `NonUserHome` (guest) | Optional |
| `/login` | `Auth` (login tab) | Public |
| `/register` | `Auth` (register tab) | Public |
| `/meal-log` | `MealLog` | Required |
| `/activity` | `ActivityLog` | Required |
| `/progress` | `Progress` | Required |
| `/profile` | `Profile` | Required |
| `/settings` | `Settings` | Required |
| `*` | `NotFound` | Public |

Authenticated screens use `AppShell` (sidebar + mobile header). Guests on `/` see the public landing with optional food photo analysis (`POST /public/analyze-food`).

### Auth

- `POST /auth/login` and `POST /auth/register` (email + password JSON)
- Access token in `localStorage` as `access_token`
- `ProtectedRoute` redirects unauthenticated users to `/login`
