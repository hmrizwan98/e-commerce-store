/**
 * One-off bootstrap: grants the `role: admin` custom claim to a Firebase Auth
 * user so they can sign into the Admin Panel. The user must already exist in
 * Firebase Auth (sign them up via /signup or create them in the Firebase
 * console first).
 *
 * Usage: npm run set-admin -- someone@example.com
 */
import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing Firebase env vars. Copy .env.example to .env.local and fill in your project's credentials first."
  );
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run set-admin -- someone@example.com");
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);

async function main() {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: "admin" });
  console.log(`Granted admin role to ${email} (uid: ${user.uid}).`);
  console.log("They must sign out and back in (or get a fresh ID token) for the claim to take effect.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
