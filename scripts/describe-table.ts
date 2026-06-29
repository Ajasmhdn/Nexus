import { appPool } from "../src/lib/db/app-pool";

async function main() {
  try {
    const [result] = await appPool.query("DESCRIBE password_reset_tokens") as [any[], any];
    console.log("DESCRIBE password_reset_tokens output:");
    console.log(result);
  } catch (err) {
    console.error("Error describing table:", err);
  }
  process.exit(0);
}

main().catch(console.error);
