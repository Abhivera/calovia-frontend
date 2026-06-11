# Calovia Frontend

React Native Web app (Expo SDK 56). One codebase for **web**, **iOS**, and **Android**.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo ~56, React 19, React Native 0.85 |
| Routing | Expo Router (file-based) |
| State | Redux Toolkit (auth slice) |
| Auth | Firebase (email + Google on web) |
| API | Axios → Calovia FastAPI backend |
| Charts | react-native-gifted-charts |
| Icons | lucide-react-native |
| Storage | AsyncStorage (settings) |

## Quick start

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_FIREBASE_* values

npm install
npm run web      # http://localhost:8081
npm run android
npm run ios
```

Backend must be running at `EXPO_PUBLIC_API_BASE_URL` (default `http://localhost:8000/api/v1`).

Set backend `FRONTEND_URL=http://localhost:8081` for CORS.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | e.g. `http://localhost:8000/api/v1` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web SDK config |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Must match backend |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Yes | |

## Routes

| Path | Screen | Auth |
|------|--------|------|
| `/` | Dashboard or landing | Optional |
| `/login`, `/register` | Auth | Public |
| `/meal-log` | Meal logging + AI analysis | Required |
| `/activity` | Activity logging | Required |
| `/progress` | Trends & charts | Required |
| `/profile` | Profile & avatar | Required |
| `/settings` | Preferences | Required |
| `/legal`, `/legal/:slug` | Legal pages | Public |

## Project layout

```
calovia-frontend/
├── app/                 # Expo Router routes
├── src/
│   ├── api/             # Axios clients
│   ├── components/      # UI + layout
│   ├── content/legal/   # Policy text
│   ├── lib/             # Firebase, format, image picker
│   ├── screens/         # Page implementations
│   ├── slices/          # Redux auth
│   └── theme/           # Brand colors
├── assets/
├── app.json
└── .env.example
```

## Production web build

```bash
npx expo export --platform web
# Output in dist/
```

## Native notes

- **Google sign-in on web** uses Firebase `signInWithPopup`.
- For native Google auth, add `@react-native-google-signin/google-signin` or Expo AuthSession.
