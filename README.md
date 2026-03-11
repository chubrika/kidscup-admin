# Kidscup Admin

Angular 19 admin panel for managing a youth basketball tournament.

## Tech stack

- **Angular 19** with standalone components
- **Tailwind CSS** for styling
- **Angular Material** (mat-table, mat-dialog, mat-form-field, mat-datepicker, mat-select, mat-card)
- **Reactive Forms** and **RxJS**
- **Signals** where appropriate
- **Lazy-loaded** feature routes
- **ESLint** compatible

## Project structure

```
src/app
├── core/           # Models, guards, core services (API, Auth)
├── shared/         # Shared components (e.g. confirm-dialog)
├── layout/         # Admin layout (sidebar + toolbar)
├── features/       # Feature modules (lazy-loaded)
│   ├── auth/       # Login
│   ├── dashboard/  # Stats cards
│   ├── teams/      # Teams CRUD, team detail (tabs: Info, Players, Matches)
│   ├── players/    # Players CRUD
│   ├── matches/    # Matches CRUD, match detail (score + player stats)
│   ├── standings/  # Tournament table
│   ├── categories/ # Age categories (U12, U14)
│   └── media/      # Image upload
├── app.config.ts
└── app.routes.ts
```

## Commands

```bash
npm install
npm start          # dev server http://localhost:4200
npm run build     # production build
npm run lint      # ESLint
```

## Login

Use any email and password to sign in (demo mode when backend is unavailable). Configure `src/environments/environment.ts` with your API URL.

## API

Services call these endpoints (with fallback mock data when API is not available):

- `POST /api/auth/login` – login
- `GET /api/dashboard/stats` – dashboard stats
- `GET/POST/PATCH/DELETE /api/teams` – teams CRUD
- `GET/POST/PATCH/DELETE /api/players` – players CRUD
- `GET/POST/PATCH/DELETE /api/matches` – matches CRUD
- `GET /api/standings` – standings by category
- `GET/POST/PATCH/DELETE /api/categories` – age categories
- `GET /api/media`, `POST /api/media/upload` – media
