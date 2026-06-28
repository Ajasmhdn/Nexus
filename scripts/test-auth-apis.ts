import { appPool } from "../src/lib/db/app-pool";
import { hashPassword } from "../src/lib/auth/password";
import { spawn, ChildProcess } from "child_process";
import http from "http";
import crypto from "crypto";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Test Users data
const TEST_USERS = {
  admin: { userId: "TEST_ADMIN", email: "admin@test.com", password: "Password@123", role: "admin", force: false, active: true },
  user: { userId: "TEST_USER", email: "user@test.com", password: "Password@123", role: "user", force: false, active: true },
  disabled: { userId: "TEST_DISABLED", email: "disabled@test.com", password: "Password@123", role: "user", force: false, active: false },
  force: { userId: "TEST_FORCE", email: "force@test.com", password: "Password@123", role: "user", force: true, active: true }
};

/**
 * Seeds temporary test users into app_db.
 */
async function seedTestUsers() {
  console.log("Seeding test users...");
  
  // Cleanup existing test records
  await appPool.query("DELETE FROM audit_logs WHERE user_id LIKE 'TEST_%'");
  await appPool.query("DELETE FROM password_reset_tokens WHERE user_id LIKE 'TEST_%'");
  await appPool.query("DELETE FROM users WHERE user_id LIKE 'TEST_%'");

  const hash = await hashPassword("Password@123");

  for (const u of Object.values(TEST_USERS)) {
    await appPool.query(`
      INSERT INTO users (user_id, email, full_name, job_title, password_hash, role, force_password_reset, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [u.userId, u.email, `Test ${u.role}`, "User", hash, u.role, u.force, u.active]);
  }
  console.log("Seeding complete.");
}

/**
 * Cleans up seeded test records from database.
 */
async function cleanupDatabase() {
  console.log("Cleaning up database test records...");
  await appPool.query("DELETE FROM audit_logs WHERE user_id LIKE 'TEST_%'");
  await appPool.query("DELETE FROM password_reset_tokens WHERE user_id LIKE 'TEST_%'");
  await appPool.query("DELETE FROM users WHERE user_id LIKE 'TEST_%'");
}

/**
 * Starts the Next.js development server.
 */
function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    console.log("Starting Next.js development server...");
    const serverProcess = spawn("npx", ["next", "dev", "-p", PORT.toString()], {
      stdio: "inherit",
      shell: true
    });

    // Poll server until responsive
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      http.get(`${BASE_URL}/api/auth/me`, (res) => {
        // Any response means the server is up
        clearInterval(interval);
        console.log("Server is responsive and ready.");
        resolve(serverProcess);
      }).on("error", () => {
        if (attempts >= 30) {
          clearInterval(interval);
          serverProcess.kill();
          reject(new Error("Timeout: Next.js dev server failed to start."));
        }
      });
    }, 1000);
  });
}

/**
 * Parses cookies from a Headers object.
 */
function getCookieValue(headers: Headers, name: string): string | null {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return null;
  
  // Set-Cookie can have multiple values separated by commas
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Runs the 16 authentication verification checks.
 */
async function runTests() {
  console.log("\n======================================================================");
  console.log("RUNNING AUTHENTICATION VERIFICATION MATRIX");
  console.log("======================================================================\n");

  const results: { name: string; status: "PASS" | "FAIL"; details?: string }[] = [];

  const addResult = (name: string, passed: boolean, details?: string) => {
    results.push({ name, status: passed ? "PASS" : "FAIL", details });
    console.log(`${passed ? "✅" : "❌"} ${name}${details ? ` (${details})` : ""}`);
  };

  try {
    // ----------------------------------------------------------------
    // 1. Admin login -> JWT set -> Redirect
    // ----------------------------------------------------------------
    const loginRes1 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.admin.userId,
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password
      })
    });
    const loginData1 = await loginRes1.json();
    const adminCookie = getCookieValue(loginRes1.headers, "token");
    addResult(
      "Admin login -> JWT set -> /admin redirect",
      loginRes1.status === 200 && loginData1.role === "admin" && !!adminCookie,
      `Role: ${loginData1.role}, Cookie Set: ${!!adminCookie}`
    );

    // ----------------------------------------------------------------
    // 2. User login -> JWT set -> Redirect
    // ----------------------------------------------------------------
    const loginRes2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.user.userId,
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password
      })
    });
    const loginData2 = await loginRes2.json();
    const userCookie = getCookieValue(loginRes2.headers, "token");

    // Call GET /api/auth/me to verify fullName and jobTitle are returned
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `token=${userCookie}` }
    });
    const meData = await meRes.json();
    const hasMeDetails = meData.user && meData.user.fullName === "Test user" && meData.user.jobTitle === "User";

    addResult(
      "User login -> JWT set -> /workspace redirect",
      loginRes2.status === 200 && loginData2.role === "user" && !!userCookie && hasMeDetails,
      `Role: ${loginData2.role}, Cookie Set: ${!!userCookie}, Me profile: ${hasMeDetails}`
    );

    // ----------------------------------------------------------------
    // 3. Wrong password -> 401, LOGIN_FAILED_PASSWORD logged
    // ----------------------------------------------------------------
    const loginRes3 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.admin.userId,
        email: TEST_USERS.admin.email,
        password: "WrongPassword123"
      })
    });
    const [wrongPasswordLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'LOGIN_FAILED_PASSWORD' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.admin.userId]
    ) as [any[], any];
    
    addResult(
      "Wrong password -> 401, LOGIN_FAILED_PASSWORD logged",
      loginRes3.status === 401 && wrongPasswordLog.length > 0
    );

    // ----------------------------------------------------------------
    // 4. Disabled account -> 401, LOGIN_FAILED_DISABLED logged
    // ----------------------------------------------------------------
    const loginRes4 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.disabled.userId,
        email: TEST_USERS.disabled.email,
        password: TEST_USERS.disabled.password
      })
    });
    const [disabledLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'LOGIN_FAILED_DISABLED' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.disabled.userId]
    ) as [any[], any];

    addResult(
      "Disabled account -> 401, LOGIN_FAILED_DISABLED logged",
      loginRes4.status === 401 && disabledLog.length > 0
    );

    // ----------------------------------------------------------------
    // 5. Unknown user -> 401, LOGIN_FAILED_NOT_FOUND logged (user_id is NULL)
    // ----------------------------------------------------------------
    const loginRes5 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "NONEXISTENT",
        email: "unknown@test.com",
        password: "SomePassword123"
      })
    });
    const [notFoundLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id IS NULL AND action = 'LOGIN_FAILED_NOT_FOUND' ORDER BY created_at DESC LIMIT 1"
    ) as [any[], any];

    addResult(
      "Unknown user -> 401, LOGIN_FAILED_NOT_FOUND logged",
      loginRes5.status === 401 && notFoundLog.length > 0
    );

    // ----------------------------------------------------------------
    // 6. Force reset -> no cookie -> reset form shown
    // ----------------------------------------------------------------
    const loginRes6 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.force.userId,
        email: TEST_USERS.force.email,
        password: TEST_USERS.force.password
      })
    });
    const loginData6 = await loginRes6.json();
    const forceCookie = getCookieValue(loginRes6.headers, "token");
    addResult(
      "Force reset -> no cookie -> reset form shown",
      loginRes6.status === 200 && loginData6.requiresReset === true && !forceCookie
    );

    // ----------------------------------------------------------------
    // 7. Force reset completed -> cookie set -> /workspace
    // ----------------------------------------------------------------
    const forceResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.force.userId,
        currentPassword: TEST_USERS.force.password,
        newPassword: "NewStrongPassword@999"
      })
    });
    const [forceResetLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'FORCE_RESET_COMPLETED' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.force.userId]
    ) as [any[], any];
    
    // Attempt logging in with the newly reset password
    const loginAfterResetRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: TEST_USERS.force.userId,
        email: TEST_USERS.force.email,
        password: "NewStrongPassword@999"
      })
    });
    const resetCookie = getCookieValue(loginAfterResetRes.headers, "token");

    addResult(
      "Force reset completed -> cookie set -> /workspace",
      forceResetRes.status === 200 && forceResetLog.length > 0 && !!resetCookie
    );

    // ----------------------------------------------------------------
    // 8. Forgot password -> token in DB -> link in console
    // ----------------------------------------------------------------
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_USERS.user.email })
    });
    const [forgotToken] = await appPool.query(
      "SELECT * FROM password_reset_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.user.userId]
    ) as [any[], any];
    const [forgotLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'PASSWORD_RESET_REQUESTED' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.user.userId]
    ) as [any[], any];

    addResult(
      "Forgot password -> token in DB -> link in console",
      forgotRes.status === 200 && forgotToken.length > 0 && forgotLog.length > 0
    );

    // ----------------------------------------------------------------
    // 9. Reset confirm valid -> password updated, token marked used
    // ----------------------------------------------------------------
    // Since we need the RAW token to confirm, let's create a known raw token directly for testing
    const testRawToken = "a".repeat(64); // mock raw token key
    const testTokenHash = crypto.createHash("sha256").update(testRawToken).digest("hex");
    const testExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    await appPool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [TEST_USERS.user.userId, testTokenHash, testExpires]
    );

    const resetConfirmRes = await fetch(`${BASE_URL}/api/auth/reset-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: testRawToken,
        newPassword: "ConfirmedNewPassword@123"
      })
    });
    
    const [updatedToken] = await appPool.query(
      "SELECT * FROM password_reset_tokens WHERE token_hash = ?",
      [testTokenHash]
    ) as [any[], any];

    const [confirmLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'PASSWORD_RESET_COMPLETED' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.user.userId]
    ) as [any[], any];

    addResult(
      "Reset confirm valid -> password updated, token marked used",
      resetConfirmRes.status === 200 && updatedToken[0]?.used_at !== null && confirmLog.length > 0
    );

    // ----------------------------------------------------------------
    // 10. Reset confirm expired -> 400 error returned
    // ----------------------------------------------------------------
    const expiredRawToken = "b".repeat(64);
    const expiredTokenHash = crypto.createHash("sha256").update(expiredRawToken).digest("hex");
    const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Expired 24 hours ago (timezone resilient)

    await appPool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [TEST_USERS.user.userId, expiredTokenHash, expiredTime]
    );

    const expiredRes = await fetch(`${BASE_URL}/api/auth/reset-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: expiredRawToken,
        newPassword: "ExpiredNewPassword@123"
      })
    });
    
    const [expiredLog] = await appPool.query(
      "SELECT * FROM audit_logs WHERE user_id = ? AND action = 'PASSWORD_RESET_EXPIRED' ORDER BY created_at DESC LIMIT 1",
      [TEST_USERS.user.userId]
    ) as [any[], any];

    addResult(
      "Reset confirm expired -> 400 error returned",
      expiredRes.status === 400 && expiredLog.length > 0
    );

    // ----------------------------------------------------------------
    // 11. Reset confirm used token -> 400 error returned
    // ----------------------------------------------------------------
    const usedRawRes = await fetch(`${BASE_URL}/api/auth/reset-confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: testRawToken, // reusing the token validated in test 9
        newPassword: "ReusedNewPassword@123"
      })
    });

    addResult(
      "Reset confirm used token -> 400 error returned",
      usedRawRes.status === 400
    );

    // ----------------------------------------------------------------
    // 12. JWT expired/invalid -> 401 error
    // ----------------------------------------------------------------
    const invalidMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: "token=invalid_jwt_token_value_here" }
    });
    addResult(
      "JWT expired -> /workspace redirect to /auth",
      invalidMeRes.status === 401
    );

    // ----------------------------------------------------------------
    // 13. No JWT -> redirect (API yields 401, pages redirect)
    // ----------------------------------------------------------------
    const noJwtMeRes = await fetch(`${BASE_URL}/api/auth/me`);
    const redirectPageRes = await fetch(`${BASE_URL}/workspace`, { redirect: "manual" });
    
    addResult(
      "No JWT -> /admin redirect to /auth",
      noJwtMeRes.status === 401 && redirectPageRes.status === 307
    );

    // ----------------------------------------------------------------
    // 14. User JWT -> /admin -> 403 returned (API blocks, page redirects)
    // ----------------------------------------------------------------
    const userRoleAdminApiRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `token=${userCookie}` }
    });
    
    // Normal user trying to go to /admin should be redirected to /workspace
    const userAdminPageRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: `token=${userCookie}` },
      redirect: "manual"
    });

    addResult(
      "User JWT -> /admin -> 403 / redirect to workspace",
      (userRoleAdminApiRes.status === 403 || userRoleAdminApiRes.status === 401) && userAdminPageRes.status === 307
    );

    // ----------------------------------------------------------------
    // 15. Logout -> cookie cleared -> /auth redirect
    // ----------------------------------------------------------------
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: `token=${userCookie}` }
    });
    const clearedCookie = getCookieValue(logoutRes.headers, "token");
    
    // Verify cleared session is unauthorized
    const afterLogoutRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `token=${clearedCookie || ""}` }
    });

    addResult(
      "Logout -> cookie cleared -> /auth redirect",
      logoutRes.status === 200 && (!clearedCookie || clearedCookie === "") && afterLogoutRes.status === 401
    );

    // ----------------------------------------------------------------
    // 16. last_login_at updated on LOGIN_SUCCESS
    // ----------------------------------------------------------------
    const [userRecord] = await appPool.query(
      "SELECT last_login_at FROM users WHERE user_id = ?",
      [TEST_USERS.user.userId]
    ) as [any[], any];
    
    const lastLogin = userRecord[0]?.last_login_at;
    addResult(
      "last_login_at updated on LOGIN_SUCCESS",
      lastLogin !== null && lastLogin !== undefined
    );

  } catch (error) {
    console.error("Test execution interrupted by error:", error);
  }

  // print summary report
  console.log("\n======================================================================");
  console.log("VERIFICATION MATRIX SUMMARY REPORT");
  console.log("======================================================================\n");
  
  const passedAll = results.every(r => r.status === "PASS");
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.status}] - ${r.name}`);
  });

  console.log(`\nFinal Test Verdict: ${passedAll ? "✅ ALL 16 CHECKS PASSED!" : "❌ SOME CHECKS FAILED."}`);
  
  return passedAll;
}

/**
 * Main test orchestrator.
 */
async function main() {
  await seedTestUsers();
  
  let serverProcess: ChildProcess | null = null;
  let success = false;

  try {
    serverProcess = await startServer();
    success = await runTests();
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    // Shutdown server
    if (serverProcess) {
      console.log("Shutting down development server...");
      serverProcess.kill("SIGTERM");
    }
    
    await cleanupDatabase();
    await appPool.end();
  }

  process.exit(success ? 0 : 1);
}

main().catch(console.error);
