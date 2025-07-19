import bcrypt from 'bcryptjs';

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    console.error('ADMIN_PASSWORD_HASH not configured');
    return false;
  }

  if (username !== adminUsername) {
    return false;
  }

  return bcrypt.compare(password, adminPasswordHash);
}
