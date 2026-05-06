# MD Earnings Calculator

Modern web app for marketing deal holders and managers to project override earnings, rep requirements, expenses, and YTD performance.

## Features
- Placeholder local auth with optional Supabase auth
- Global assumptions + per-row overrides
- Unlimited team/rep rows
- Expense tracker with manual or itemized mode
- YTD actuals tracking
- Scenario save/load presets
- CSV export + print-to-PDF
- Dark/light responsive dashboard UI

## Local setup
```bash
npm install
npm run dev
```

## Optional Supabase setup
1. Copy `.env.example` to `.env`
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run `supabase-schema.sql` in your project SQL editor

Without Supabase, the app still works entirely in localStorage.

## Build
```bash
npm run build
```
