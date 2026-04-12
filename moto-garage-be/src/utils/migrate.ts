import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

// Use absolute path based on current working directory
const MIGRATIONS_DIR = path.join(process.cwd(), 'src/migrations');

interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}

// Create migrations tracking table
async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// Get all migration files
function getMigrations(): Migration[] {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const migrations: Migration[] = [];

  for (const file of files) {
    if (file.endsWith('.sql') && !file.startsWith('rollback_')) {
      const rollbackFile = 'rollback_' + file;
      const upPath = path.join(MIGRATIONS_DIR, file);
      const downPath = path.join(MIGRATIONS_DIR, rollbackFile);

      if (fs.existsSync(downPath)) {
        const idMatch = file.match(/^(\d+)_/);
        const id = idMatch?.[1] ?? file;

        migrations.push({
          id,
          name: file,
          up: fs.readFileSync(upPath, 'utf-8'),
          down: fs.existsSync(downPath) ? fs.readFileSync(downPath, 'utf-8') : '',
        });
      }
    }
  }

  return migrations.sort((a, b) => a.id.localeCompare(b.id));
}

// Get executed migrations
async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM _migrations ORDER BY id');
  return result.rows.map((row) => row.name);
}

// Run migration
async function runMigration(migration: Migration) {
  console.log(`\n⬆️  Running migration: ${migration.name}`);

  try {
    await pool.query('BEGIN');
    await pool.query(migration.up);
    await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
    await pool.query('COMMIT');
    console.log(`✓ Migration ${migration.name} completed`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Migration ${migration.name} failed:`, error);
    throw error;
  }
}

// Rollback migration
async function rollbackMigration(migration: Migration) {
  console.log(`\n⬇️  Rolling back migration: ${migration.name}`);

  try {
    await pool.query('BEGIN');
    await pool.query(migration.down);
    await pool.query('DELETE FROM _migrations WHERE name = $1', [migration.name]);
    await pool.query('COMMIT');
    console.log(`✓ Rollback ${migration.name} completed`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Rollback ${migration.name} failed:`, error);
    throw error;
  }
}

// Run all pending migrations
export async function migrate() {
  await createMigrationsTable();

  const migrations = getMigrations();
  const executed = await getExecutedMigrations();
  const pending = migrations.filter((m) => !executed.includes(m.name));

  if (pending.length === 0) {
    console.log('✓ No pending migrations');
    return;
  }

  console.log(`Found ${pending.length} pending migration(s)`);

  for (const migration of pending) {
    await runMigration(migration);
  }

  console.log('\n✓ All migrations completed successfully');
}

// Rollback last migration
export async function rollback() {
  await createMigrationsTable();

  const migrations = getMigrations();
  const executed = await getExecutedMigrations();

  if (executed.length === 0) {
    console.log('✓ No migrations to rollback');
    return;
  }

  const lastExecuted = executed[executed.length - 1];
  const migration = migrations.find((m) => m.name === lastExecuted);

  if (!migration) {
    console.log(`✗ Migration file not found for ${lastExecuted}`);
    return;
  }

  await rollbackMigration(migration);
  console.log('\n✓ Rollback completed successfully');
}

// Show migration status
export async function status() {
  await createMigrationsTable();

  const migrations = getMigrations();
  const executed = await getExecutedMigrations();

  console.log('\n📊 Migration Status:\n');
  console.log('Status'.padEnd(10) + 'Migration');
  console.log('-'.repeat(50));

  for (const migration of migrations) {
    const isExecuted = executed.includes(migration.name);
    const status = isExecuted ? '✓ Executed' : '⏳ Pending';
    console.log(status.padEnd(10) + migration.name);
  }

  console.log('\n');
}

// CLI handler
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await migrate();
        break;
      case 'down':
      case 'rollback':
        await rollback();
        break;
      case 'status':
        await status();
        break;
      default:
        console.log(`
Usage: npm run migrate [command]

Commands:
  up, migrate    Run pending migrations
  down, rollback Rollback last migration
  status         Show migration status
        `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
