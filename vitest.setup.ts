// Load .env files
import 'dotenv/config'

// Tests get their own database so they never touch your local accounts (fitness.db).
process.env.DATABASE_URL = 'file:./test.db'
