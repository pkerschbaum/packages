import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node scripts/generate-admin-hash.js <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  console.log('Admin password hash:');
  console.log(hash);
  console.log('\nAdd this to your .env file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
}

generateHash().catch(console.error);
