import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { FoodEntries, Measurements, Routines, Stickers, Workouts } from './collections/Notebook'
import { migrations } from './migrations'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// A postgres:// DATABASE_URL (any hosted Postgres, e.g. Neon) means Postgres; anything else is the local SQLite file.
const postgresUrl = /^postgres(ql)?:\/\//.test(process.env.DATABASE_URL || '') ? process.env.DATABASE_URL : ''

if (process.env.NETLIFY && !postgresUrl)
  console.warn(
    'No Postgres database is set for this deploy, so accounts and workouts cannot be saved. ' +
      'Add DATABASE_URL (a postgres:// connection string) under Project configuration → Environment variables.',
  )

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
        // also apply pending migrations when the live site starts, in case the build couldn't reach the database
        prodMigrations: migrations,
      })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URL || '' } }),
  plugins: [],
})
