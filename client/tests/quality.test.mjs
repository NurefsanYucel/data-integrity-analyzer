import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRows, calculateScore, parseCsv } from "../src/lib/quality.mjs";

test("parses CSV records into named fields", () => assert.deepEqual(parseCsv("id,email\n1,a@example.com"), [{ id: "1", email: "a@example.com" }]));
test("flags duplicate IDs, invalid emails, and missing values", () => { const rows = parseCsv("id,email,name\n1,bad-email,\n1,,Grace"); const issues = analyzeRows(rows, { headers: ["id", "email", "name"], idField: "id", emailField: "email", rules: { required: true, uniqueId: true, email: true, numeric: false, pii: false } }); assert.equal(issues.filter((issue) => issue.type === "Duplicate ID").length, 2); assert.equal(issues.filter((issue) => issue.type === "Invalid email").length, 1); assert.equal(issues.filter((issue) => issue.type === "Missing value").length, 2); });
test("returns a lower score as issue severity accumulates", () => { const rows = parseCsv("id,email,name\n1,bad-email,\n1,,Grace"); const issues = analyzeRows(rows, { headers: ["id", "email", "name"], idField: "id", emailField: "email", rules: { required: true, uniqueId: true, email: true, numeric: false, pii: false } }); assert.equal(calculateScore(rows.length, issues), 10); });
