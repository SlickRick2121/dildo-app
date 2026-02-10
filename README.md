# Balloon Popper 🎈

A Lovense-compatible arcade mini-game.

## 🚀 Setup & Running

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173`.

3.  **Build for Production/Gallery**
    ```bash
    npm run build
    ```
    The `dist/` folder will contain the self-contained app.

## 📱 Lovense Integration

*   **LAN.JS**: The official Lovense bridge script is included in `public/lan.js`. This allows the game to talk to toys via the Lovense Remote app.
*   **App Gallery Config**: `public/appgallery_config.json` is included. **You must update the `appId` with your verified ID from the Lovense Dashboard.**

## ⚠️ Important Notes

*   **HTTPS Required**: For the Lovense webview to load your app correctly on mobile, it must be served over HTTPS (or be a local file in the App Gallery).
*   **Safe Zones**: The app supports notched phones automatically using `safe-area-inset` CSS variables.
