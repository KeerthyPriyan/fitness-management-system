# FitTrack - Fitness Management System (MERN)

FitTrack is a MERN fitness management app. The profile page supports account registration, login, and MongoDB-backed fitness profile editing.

## Run the client
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173

## Run the server
```bash
cd server
npm install
npm run dev
```

Create `server/.env` using `server/.env.example`. Set `MONGO_URI` to your local MongoDB URL or Atlas connection string, and set `AUTH_TOKEN_SECRET` to a private random value of at least 32 characters. You can generate one with Node:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitness-management
AUTH_TOKEN_SECRET=replace-with-a-private-random-secret-at-least-32-characters
```

For example, run this from the `server` folder to generate a secret:
```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` private; never commit it or share your database credentials. With MongoDB running and both the client and server started, open the Profile page to register. Registration saves the account and profile in MongoDB; the user can then log in and edit the profile.

Goals, planned workouts, and weight entries are stored in the browser under the signed-in account ID, so new accounts start with separate, empty tracking data. The existing sample tracking data is retained for `keerthypriyanndhc@gmail.com` on the browser where that data was already stored; tracking data is currently browser-local, not synchronized across devices.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy blocks `npm.ps1`:
```powershell
npm.cmd run dev
```
Run the command from each project's folder in separate terminals.

Health check:
```text
http://localhost:5000/api/health
```
This returns JSON when the server is running and connected to MongoDB.
