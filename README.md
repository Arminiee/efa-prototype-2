# EFA – Environmental Encroachment Case Tracker (Prototype 2)

Single-page React + Vite app, styled with Tailwind. No backend. Ready for Vercel.

## Quick Start
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Create a new GitHub repo and push this folder.
2. In Vercel, click **New Project** → import the repo.
3. Framework: **Vite** (auto-detected)
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. Your app will be available at `https://<project>.vercel.app`.

## Notes
- All data is in-memory for demo. Use the **Add Case** button to add entries.
- Export the dataset from **Stats & Reports → Export JSON**.
- This project ships minimal UI components under `src/components/ui/*` to avoid extra dependencies.
