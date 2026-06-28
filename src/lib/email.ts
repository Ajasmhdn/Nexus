/**
 * Phase 3 Email Service Stub.
 * Logs password reset recovery links directly to stdout to simplify development testing.
 * Will be replaced with full SMTP transport delivery via nodemailer in Phase 7.
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
  console.log(`\n======================================================================`);
  console.log(`[PASSWORD RESET] Mail Delivery Stub triggered`);
  console.log(`[PASSWORD RESET] Recipient: ${email}`);
  console.log(`[PASSWORD RESET] Recovery URL: ${resetLink}`);
  console.log(`======================================================================\n`);
  
  // TODO Phase 7: Replace with real SMTP nodemailer transport delivery
  return Promise.resolve();
}
