import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { FoodEntries, Measurements, Routines, Stickers, Workouts } from './collections/Notebook'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Netlify Database puts its Postgres connection string in NETLIFY_DB_URL (per deploy: production, or a
// preview branch). A postgres:// DATABASE_URL works too. Anything else is the local SQLite file.
const postgresUrl =
  process.env.NETLIFY_DB_URL ||
  (/^postgres(ql)?:\/\//.test(process.env.DATABASE_URL || '') ? process.env.DATABASE_URL : '')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Measurements, Workouts, Routines, FoodEntries, Stickers],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresUrl
    ? postgresAdapter({
        pool: { connectionString: postgresUrl },
        push: false,
        // Postgres schema changes ship as migrations (run on every deploy); SQLite dev pushes changes directly
        migrationDir: path.resolve(dirname, 'migrations'),
      })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URL || '' } }),
  plugins: [],
})
