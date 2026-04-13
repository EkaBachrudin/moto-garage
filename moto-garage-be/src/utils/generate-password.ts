import { hashPassword } from './password.util';

const password = process.argv[2] || 'Admin123!';

async function main() {
  console.log('\n🔐 Password Hash Generator');
  console.log('===========================\n');
  console.log(`Password: ${password}`);
  console.log('\nArgon2id Hash:');
  const hash = await hashPassword(password);
  console.log(hash);

  console.log('\nSQL INSERT Example:');
  console.log(`INSERT INTO users (role_id, full_name, email, phone, password_hash, is_active)
SELECT
  (SELECT role_id FROM roles WHERE name = 'admin'),
  'Administrator',
  'admin@motogarage.com',
  '+6281234567890',
  '${hash}',
  true
ON CONFLICT (email) DO NOTHING;`);

  console.log('\n');
}

main().catch(console.error);
