import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

dotenv.config()

const pool = new Pool({
	host: process.env.POSTGRES_HOST,
	port: Number(process.env.POSTGRES_PORT),
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	database: process.env.POSTGRES_DATABASE
})

async function main() {
	const client = await pool.connect()
	const db = drizzle(client)

	console.log('Running Drizzle migrations...')

	await migrate(db, {
		migrationsFolder: process.env.DRIZZLE_OUT ?? './drizzle'
	})

	console.log('Migrations completed!')
	client.release()
	process.exit(0)
}

main()
