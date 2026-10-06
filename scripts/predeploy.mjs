// Netlify build step: apply Payload migrations if this build can reach the Postgres database.
// If it can't, the live site applies them when it starts.
import { spawnSync } from 'node:child_process'

if (!/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL || '')) {
  console.log('No postgres:// DATABASE_URL in this build; skipping migrations here. The site applies them when it starts.')
  process.exit(0)
}
const run = spawnSync('npx', ['payload', 'migrate'], { stdio: 'inherit', shell: true, env: { ...process.env, NODE_OPTIONS: '--no-deprecation' } })
process.exit(run.status ?? 1)
