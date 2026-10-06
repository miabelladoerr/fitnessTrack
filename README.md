# fitnessTrack

Iron Notebook: a notebook-style tracker for lifting, routines, nutrition and progress.
Built on [Payload](https://payloadcms.com) (inside Next.js), which provides accounts, logins and the admin dashboard.

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env` and set `PAYLOAD_SECRET` to a long random string.
   `DATABASE_URL=file:./fitness.db` keeps data in a local SQLite file.
3. `npm run dev`, then open:
   - http://localhost:3000 for the notebook (`public/prototype.html`)
   - http://localhost:3000/admin for the dashboard. Locally, the first account you create becomes the admin.

If port 3000 is busy, use another one: `npm run dev -- -p 3002`.

## Deploy to Netlify

Netlify can't keep the local SQLite file, so the live site needs a hosted Postgres database, for example
a free one from [Neon](https://neon.tech). The app uses Postgres whenever `DATABASE_URL` starts with `postgres://`.

1. Create a Postgres database and copy its connection string (`postgres://...`).
2. In Netlify, **Add new project → Import an existing project** and pick this GitHub repo.
   `netlify.toml` sets the build command (`npm run deploy-build`) and Node 22.
3. In **Project configuration → Environment variables**, add:
   - `DATABASE_URL`: the Postgres connection string.
   - `PAYLOAD_SECRET`: a new long random string, not the one in your local `.env`.
4. Deploy. Each build runs `payload migrate` first, and the site also applies any pending migrations
   when it starts, so database changes go live with the code.
5. Make yourself the admin. On the live site nobody becomes admin automatically, so a stranger can't
   claim the dashboard.
   1. Sign up on the live site.
   2. From this folder, with the same connection string (PowerShell shown):

      ```powershell
      $env:DATABASE_URL = "postgres://..."
      npm run make-admin -- you@example.com
      ```

   3. Log out and back in, then open `/admin`. After that, promote other people from the dashboard.

   Same thing in SQL, for pgAdmin or your database's SQL editor: `UPDATE users SET role = 'admin' WHERE email = 'you@example.com';`

### Changing collections

SQLite (local) picks up collection changes on its own. Postgres needs a migration, committed with the change:

```sh
DATABASE_URL=postgres://user:pass@host:5432/db npm run payload migrate:create your-change-name
```

Run it against a Postgres database that already has the existing migrations applied. Migrations live in `src/migrations`.

## Accounts

- Anyone can sign up (`POST /api/users`). New accounts are members. Passwords need at least 8 characters.
- Members can only read and edit their own account and notebook, and can't change their role.
- Only admins can open `/admin`, see all users, or delete accounts. Deleting an account deletes its notebook.

## Tests

`npm run test:int` checks the access rules. It uses its own `test.db`, so it never touches your local accounts.
Set `TEST_DATABASE_URL` to a migrated Postgres database to run the same tests against Postgres.
