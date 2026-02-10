# Balloon Popper 🎈

A Full-Stack Lovense-compatible arcade mini-game with Multiplayer and Leaderboards.

## 🚀 Quick Start (Local)

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Frontend & Backend**
    ```bash
    # Terminal 1: Frontend
    npm run dev

    # Terminal 2: Backend API (Optional for local dev without DB)
    npm run dev:api
    ```
    Access at `http://localhost:5173`.

## 📱 Testing on Lovense Remote (Local Network)

To test on your phone without deploying:

1.  **Find your Computer's Local IP**:
    *   Look at the `npm run dev` output (e.g., `http://192.168.1.5:5173`).
2.  **Open on Phone**:
    *   Connect phone to same Wi-Fi.
    *   Open **Lovense Remote App** -> **Discover** -> **Browser**.
    *   Type: `http://192.168.1.5:5173`.
    *   **Allow** toy control permissions.

## 🚄 Deployment Guide (Railway)

This project is configured for one-click deployment on **Railway**.

1.  **Push to GitHub**: ensure your code is in a repo.
2.  **New Project on Railway**:
    *   Select **Deploy from GitHub repo**.
    *   Choose this repository.
3.  **Add Database**:
    *   Right-click the empty space in Railway canvas -> **New** -> **Database** -> **PostgreSQL**.
    *   Connect the Database to your App service (Railway usually does this automatically by injecting `DATABASE_URL`).
4.  **Verify Variables**:
    *   Ensure `DATABASE_URL` is present in your App's variables.
5.  **Build & Deploy**:
    *   Railway interprets `package.json` scripts:
        *   Build: `npm run build` (includes Prisma generation).
        *   Start: `npm start` (runs the Express server).

## 🛠️ Configuration

*   **`public/appgallery_config.json`**: Update `appId` with your real ID from Lovense Developer Dashboard.
*   **`.env`**: Locally, create a `.env` file with `DATABASE_URL=postgresql://...` if you want to test the DB locally.

## 🎮 Multiplayer & Sync

*   **Host**: Opens the app, URL becomes `/?join=SESSION_ID`.
*   **Remote**: Opens `/?join=SESSION_ID` to see the **Controller Panel**.
*   **Sync**: Score and Combo are broadcast from Host to Remote. Remote triggers vibrations on Host.
