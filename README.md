# fitnessTrack

Iron Notebook: a notebook-style tracker for lifting, routines, nutrition and progress.
Built on [Payload](https://payloadcms.com) (inside Next.js), which provides accounts, logins and the admin dashboard.

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env` and set `PAYLOAD_SECRET` to a long random string.
   `DATABASE_URL=file:./fitness.db` keeps data in a local SQLite file.
3. `npm run dev`, then open:
   - http://localhost:3000 for the notebook (still the static prototype in `public/prototype.html`)
   - http://localhost:3000/admin for the dashboard. The first account you create becomes the admin.

## Accounts

- Anyone can sign up (`POST /api/users`). New accounts are members.
- Members can only read and edit their own account, and can't change their role.
- Only admins can open `/admin`, see all users, or delete accounts.

## Tests

`npm run test:int` checks the account access rules.
