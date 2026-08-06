/**
 * One-off bootstrap: creates or updates a Firebase Auth user and grants the
 * requested role claim. The script is intentionally minimal and reuses the
 * existing project bootstrap flow without changing the Firestore schema.
 *
 * Standalone Admin SDK instance, independent of src/lib/firebase/admin.ts
 * (which is "server-only" and lazy-singleton, not meant for standalone
 * script use).
 *
 * Usage:
 *   npm run set-admin -- someone@example.com [password] --superadmin
 *   npm run set-admin -- someone@example.com [password] --tenant <slug>
 *
 * A plain "admin" grant (no --tenant) has no tenantId claim - requireAdmin()
 * and the admin (protected) layout guard will reject that account until
 * it's re-provisioned with --tenant. The Super Admin panel's "Create store"
 * flow is the recommended way to provision a new store's first admin
 * instead of this script.
 */
import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

const rawArgs = process.argv.slice(2);
const flags = new Set<string>();
const positional: string[] = [];
let tenantSlug: string | undefined;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--tenant") {
    tenantSlug = rawArgs[++i];
  } else if (arg.startsWith("--")) {
    flags.add(arg);
  } else {
    positional.push(arg);
  }
}

const email = positional[0];
const password = positional[1] || "Hello123@";
const isSuperAdmin = flags.has("--superadmin") || flags.has("--super_admin");
const role = isSuperAdmin ? "superadmin" : "admin";

if (!email) {
  console.error(
    "Usage: npm run set-admin -- someone@example.com [password] [--superadmin | --tenant <slug>]"
  );
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  let existed = true;
  let user;

  try {
    user = await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
    existed = false;
    user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false,
    });
  }

  const claims: Record<string, unknown> = { role };

  if (!isSuperAdmin) {
    if (tenantSlug) {
      const snap = await db.collection("stores").where("slug", "==", tenantSlug).limit(1).get();
      if (snap.empty) {
        console.error(`No store found with slug "${tenantSlug}".`);
        process.exit(1);
      }
      claims.tenantId = snap.docs[0].id;
    } else {
      console.warn(
        "Warning: no --tenant <slug> given - this admin has no tenantId claim and will be rejected by " +
          "requireAdmin() and the admin panel's tenant check until re-provisioned with --tenant. Prefer the " +
          "Super Admin panel's \"Create store\" flow, which sets tenantId correctly."
      );
    }
  }

  await auth.setCustomUserClaims(user.uid, claims);
  console.log(`${existed ? "Already existed" : "Created"}: ${email}`);
  console.log(`UID: ${user.uid}`);
  console.log(`Claims: ${JSON.stringify(claims)}`);
  console.log("They must sign out and back in (or get a fresh ID token) for the claim to take effect.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
