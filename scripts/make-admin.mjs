// Make an existing account an admin on a Postgres database, such as the one behind the live site.
// Usage: set DATABASE_URL to the postgres:// connection string, then: npm run make-admin -- you@example.com
import pg from 'pg'

const email = process.argv[2]
const url = process.env.DATABASE_URL || ''
if (!email || !/^postgres(ql)?:\/\//.test(url)) {
  console.error('Set DATABASE_URL to the postgres:// connection string, then run: npm run make-admin -- you@example.com')
  process.exit(1)
}

const db = new pg.Client({ connectionString: url })
await db.connect()
const { rowCount } = await db.query("UPDATE users SET role = 'admin' WHERE lower(email) = lower($1)", [email])
await db.end()

if (rowCount) console.log(`${email} is now an admin. Log out and back in, then open /admin.`)
else {
  console.error(`No account uses ${email}. Sign up on the site with that email first.`)
  process.exitCode = 1
}
