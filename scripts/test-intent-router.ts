import { routeIntent } from "../src/ai/router/intentRouter";

const TEST_CASES = [
  {
    query: "Show all downtime events for machine MAC-100",
    expected: ["downtime_events", "machines"]
  },
  {
    query: "Who operator registered shift logs yesterday?",
    expected: ["shift_logs", "employees"]
  },
  {
    query: "Are there any items in the inventory that need reordering?",
    expected: ["inventory"]
  },
  {
    query: "Show all maintenance resolutions completed by operator John",
    expected: ["maintenance_logs", "employees"]
  },
  {
    query: "List purchase orders from reliability score suppliers",
    expected: ["purchase_orders", "suppliers"]
  }
];

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING INTENT ROUTER UNIT TEST (STEP 3 CHECKPOINT)");
  console.log("==================================================\n");

  let passedAll = true;

  for (const tc of TEST_CASES) {
    console.log(`Query: "${tc.query}"`);
    try {
      const result = await routeIntent(tc.query);
      console.log(`Result:   ${JSON.stringify(result)}`);
      console.log(`Expected: ${JSON.stringify(tc.expected)}`);

      // Check if all expected tables are in the result (or matches criteria)
      const passed = tc.expected.every(tbl => result.includes(tbl));
      console.log(`Verdict:  ${passed ? "✅ PASS" : "❌ FAIL"}\n`);

      if (!passed) passedAll = false;
    } catch (error) {
      console.error("Test execution failed:", error);
      passedAll = false;
    }
  }

  console.log("==================================================");
  console.log(`FINAL VERDICT: ${passedAll ? "✅ PASS" : "❌ FAIL"}`);
  console.log("==================================================");

  process.exit(passedAll ? 0 : 1);
}

runTests().catch(console.error);
