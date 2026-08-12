import { adminAuth } from "../src/lib/firebase-admin";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables before running this script.");
    process.exit(1);
  }

  let user;
  try {
    user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { password });
    console.log(`Updated existing admin user: ${email}`);
  } catch {
    user = await adminAuth.createUser({ email, password, emailVerified: true });
    console.log(`Created admin user: ${email}`);
  }

  await adminAuth.setCustomUserClaims(user.uid, { admin: true });
  console.log("Granted admin custom claim.");
  console.log(`\nYou can now log in at /admin/login with:\n  Email: ${email}\n  Password: (as provided)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
