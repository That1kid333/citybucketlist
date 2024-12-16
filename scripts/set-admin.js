import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];
if (!uid) {
  console.error('Please provide a user UID');
  process.exit(1);
}

admin.auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Successfully set admin claim for user:', uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  });
