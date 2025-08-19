const admin = require('firebase-admin');

// Load service account credentials
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();
const auth = admin.auth();

async function main() {
  // Step 1: Check if any Auth user exists
  const listResult = await auth.listUsers(1);
  if (listResult.users.length > 0) {
    console.log('At least one user already exists. No action taken.');
    return;
  }

  // Step 2: Define your test user fields
  const testEmail = 'admin.test@example.com';
  const testPassword = 'Test1234!';
  const testName = 'Test Admin';
  const testRole = 'Admin'; // or 'Shopkeeper', etc
  const testAvatar = null;

  // Step 3: Create the user in Firebase Authentication
  const userRecord = await auth.createUser({
    email: testEmail,
    password: testPassword,
    displayName: testName,
  });
  console.log('✅ Created Firebase Auth user:', userRecord.uid);

  // Step 4: Add the matching Firestore doc in "users" collection (schema matches your RN app)
  const userDocData = {
    id: userRecord.uid,
    name: testName,
    email: testEmail,
    role: testRole,
    avatar: testAvatar,
  };

  await db.collection('users').doc(userRecord.uid).set(userDocData);
  console.log('✅ Firestore user doc created:', userDocData);

  console.log('\nTest admin user created!');
  console.log(`Login email: ${testEmail}`);
  console.log(`Password:    ${testPassword}`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
