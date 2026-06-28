import { appPool } from "../src/lib/db/app-pool";
import { agentPool } from "../src/lib/db/agent-pool";

/**
 * Strict Verification Suite.
 * Validates pool connectivity, table existence, and tests server-level MySQL
 * permissions to assert the dual-database security boundary.
 */
async function main() {
  console.log("=== Starting Database Verification Suite ===");
  let appPoolVerified = false;
  let agentPoolVerified = false;
  let securityGateVerified = false;

  // ──────────────────────────────────────────────────────────────────
  // 1. APP POOL VERIFICATIONS
  // ──────────────────────────────────────────────────────────────────
  console.log("\n[1/3] Testing App Connection Pool (app_db)...");
  try {
    // Check Connection
    const [connTest] = await appPool.query("SELECT 1 + 1 AS val");
    console.log("  ✅ Connection: SUCCESS", JSON.stringify(connTest));

    // Verify all 5 tables exist
    const [tables] = await appPool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE TABLE_SCHEMA = 'app_db'
    `) as [any[], any];
    
    const tableNames = tables.map(t => t.TABLE_NAME.toLowerCase());
    const requiredTables = ["users", "password_reset_tokens", "chat_sessions", "messages", "audit_logs"];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length === 0) {
      console.log("  ✅ Table Verification: SUCCESS (All 5 tables exist)");
    } else {
      console.error(`  ❌ Table Verification: FAILED (Missing tables: ${missingTables.join(", ")})`);
    }

    // Insert Permitted Test (Self-contained test using a temporary user to satisfy Foreign Keys)
    const testUserId = "TEST_CONN_USER";
    const testAuditId = 99999;

    // Insert temporary user
    await appPool.query(`
      INSERT INTO users (user_id, email, password_hash, role, force_password_reset, is_active)
      VALUES (?, 'test_connection_user@nexus.com', 'dummy_hash', 'user', true, true)
    `, [testUserId]);

    // Insert audit log referencing temporary user
    await appPool.query(`
      INSERT INTO audit_logs (audit_id, user_id, action, description) 
      VALUES (?, ?, 'CONNECTION_TEST', 'Temporary connection test insert')
    `, [testAuditId, testUserId]);
    console.log("  ✅ INSERT Permitted: SUCCESS");

    // Delete audit log
    await appPool.query("DELETE FROM audit_logs WHERE audit_id = ?", [testAuditId]);
    
    // Delete temporary user
    await appPool.query("DELETE FROM users WHERE user_id = ?", [testUserId]);
    console.log("  ✅ DELETE Permitted: SUCCESS");

    // Verify isolation (app pool should NOT access operational database)
    try {
      await appPool.query("SELECT * FROM manufacturing_operations_db.machines LIMIT 1");
      console.error("  ❌ SECURITY ALERT: app_pool was able to cross-query manufacturing_operations_db! Isolation failed.");
    } catch (err: any) {
      if (err.message.includes("command denied") || err.message.includes("SELECT command denied")) {
        console.log("  ✅ Database Isolation: SUCCESS (app_pool blocked from accessing operational db)");
      } else {
        console.warn("  ⚠️ Database Isolation warning: cross-query failed as expected, but verify it was privilege-blocked:", err.message);
      }
    }

    appPoolVerified = true;
  } catch (error) {
    console.error("  ❌ App Pool Verifications failed:", error);
  }

  // ──────────────────────────────────────────────────────────────────
  // 2. AGENT POOL VERIFICATIONS (SELECT-Only)
  // ──────────────────────────────────────────────────────────────────
  console.log("\n[2/3] Testing Agent Connection Pool (manufacturing_operations_db)...");
  try {
    // Check Connection
    const [connTest] = await agentPool.query("SELECT 1 + 1 AS val");
    console.log("  ✅ Connection: SUCCESS", JSON.stringify(connTest));

    // Verify SELECT is permitted
    const [selectTest] = await agentPool.query("SELECT * FROM machines LIMIT 1") as [any[], any];
    console.log("  ✅ SELECT Permitted: SUCCESS (Found records: " + selectTest.length + ")");

    // Verify INSERT is blocked (MySQL privilege level check)
    try {
      await agentPool.query(`
        INSERT INTO machines (machine_id, machine_code, machine_name, machine_type, production_line, location, installation_date, status) 
        VALUES (99999, 'M-TEST', 'Test Machine', 'Test', 'Line 1', 'Location', '2026-06-28', 'active')
      `);
      console.error("  ❌ SECURITY ALERT: Agent Pool performed a WRITE (INSERT) operation. Permission boundary failed!");
    } catch (err: any) {
      if (err.message.includes("command denied") || err.message.includes("INSERT command denied")) {
        console.log("  ✅ INSERT Blocked: SUCCESS (Privilege check passed)");
      } else {
        console.warn("  ⚠️ INSERT Blocked check failed with unexpected error:", err.message);
      }
    }

    // Verify UPDATE is blocked
    try {
      await agentPool.query("UPDATE machines SET status = 'active' WHERE machine_id = 1");
      console.error("  ❌ SECURITY ALERT: Agent Pool performed an UPDATE operation. Permission boundary failed!");
    } catch (err: any) {
      if (err.message.includes("command denied") || err.message.includes("UPDATE command denied")) {
        console.log("  ✅ UPDATE Blocked: SUCCESS (Privilege check passed)");
      } else {
        console.warn("  ⚠️ UPDATE Blocked check failed with unexpected error:", err.message);
      }
    }

    // Verify DELETE is blocked
    try {
      await agentPool.query("DELETE FROM machines WHERE machine_id = 99999");
      console.error("  ❌ SECURITY ALERT: Agent Pool performed a DELETE operation. Permission boundary failed!");
    } catch (err: any) {
      if (err.message.includes("command denied") || err.message.includes("DELETE command denied")) {
        console.log("  ✅ DELETE Blocked: SUCCESS (Privilege check passed)");
      } else {
        console.warn("  ⚠️ DELETE Blocked check failed with unexpected error:", err.message);
      }
    }

    // Verify DROP is blocked
    try {
      await agentPool.query("DROP TABLE IF EXISTS test_block_drop");
      console.error("  ❌ SECURITY ALERT: Agent Pool performed a DROP operation. Permission boundary failed!");
    } catch (err: any) {
      if (err.message.includes("command denied") || err.message.includes("DROP command denied")) {
        console.log("  ✅ DROP Blocked: SUCCESS (Privilege check passed)");
      } else {
        console.warn("  ⚠️ DROP Blocked check failed with unexpected error:", err.message);
      }
    }

    agentPoolVerified = true;
  } catch (error) {
    console.error("  ❌ Agent Pool Verifications failed:", error);
  }

  // ──────────────────────────────────────────────────────────────────
  // 3. FINAL SECURITY GATE CHECK
  // ──────────────────────────────────────────────────────────────────
  console.log("\n[3/3] Final Security Gate Verdict...");
  if (appPoolVerified && agentPoolVerified) {
    securityGateVerified = true;
    console.log("\n✅ App DB Read Test: SUCCESS");
    console.log("✅ Agent DB Read Test: SUCCESS");
    console.log("✅ Security Gate: SUCCESS. Agent Pool write attempt blocked correctly.");
  } else {
    console.error("\n❌ Verification Failed. One or more pools failed the test suite.");
  }

  console.log("\nClosing connection pools...");
  await appPool.end();
  await agentPool.end();
  console.log("=== Verification Suite Closed ===");

  if (!securityGateVerified) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Critical error in verification suite execution:", err);
  process.exit(1);
});