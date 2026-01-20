import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres.ypbfnqjkqunqxchxbkzs:Wasel2025!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function executeSchema() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, 'supabase', 'ai_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing AI schema...');
    await client.query(sql);
    console.log('AI schema executed successfully!');

  } catch (error) {
    console.error('Error executing schema:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

executeSchema();
