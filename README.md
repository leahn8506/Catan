# Catan: Cities & Knights Universe

Multiplayer Cities & Knights with true random dice and progress cards.

## Deploy to Render (free, ~5 minutes)

1. Go to [https://render.com](https://render.com) and sign up (free, GitHub or email).
2. Click **New +** → **Web Service**.
3. Connect your GitHub (or use “Public Git repository” if you upload the code).
4. If you don’t have the code on GitHub yet:
   - Create a free GitHub account
   - Create a new repository
   - Upload the contents of the `catan-ck` folder
5. On Render:
   - **Name**: catan-ck (or anything)
   - **Region**: closest to you
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Click **Create Web Service**.
7. Wait 2–5 minutes. Render will give you a link like:
   `https://catan-ck.onrender.com`
8. Open that link. Create a room and share the link + room code with friends.

### Notes
- Free tier spins down after ~15 minutes of inactivity. The first visit after that may take 30–60 seconds to wake up.
- True random dice and progress cards work the same.
- Bots and multiplayer rooms work exactly as before.
- No one needs to install anything — just open the link in a browser.

## Local development
```bash
npm install
npm start
```
Then open http://localhost:3000
