# 1337 Football Cup — MVP Voting

This is a ready-to-run Next.js MVP voting site using 42 OAuth2 authentication.

## Formula
- Fans: 40%
- Organizers: 60%
- Fan percentage = candidate fan votes / all fan votes × 100
- Final = organizer score × 0.60 + fan percentage × 0.40

## 42 setup
In the 42 API application, use this local Redirect URI:
`http://localhost:3000/api/auth/42/callback`

Request only `public` scope. The site uses the 42 authorization-code flow and reads `/v2/me` server-side.

## Run
```bash
cp .env.example .env.local
# Fill FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, SESSION_SECRET and ADMIN_LOGINS
npm install
npm run dev
```
Open `http://localhost:3000`.

Organizer panel: `http://localhost:3000/admin`

Set `ADMIN_LOGINS` to the exact 42 login(s) allowed to enter organizer scores.

## Important
Never expose `FORTYTWO_CLIENT_SECRET` in browser code or commit `.env.local`. For production use HTTPS and a production redirect URI. For multiple server instances, move SQLite to PostgreSQL.
