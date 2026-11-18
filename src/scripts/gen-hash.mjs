// شغّل: node src/scripts/gen-hash.mjs <password>
import bcrypt from 'bcryptjs';
const plain = process.argv[2] ?? 'admin123';
const hash = await bcrypt.hash(plain, 12);
console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
