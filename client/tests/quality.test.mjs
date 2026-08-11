import assert from "node:assert/strict";
import test from "node:test";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseCsv(text) {
  const records = text.trim().split(/\r?\n/).map((line) => line.split(","));
  const [headers, ...rows] = records;
  return rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function validate(rows) {
  const issues = []; const ids = new Map();
  rows.forEach((row, index) => { Object.values(row).forEach((value) => { if (!value) issues.push({ row: index + 2, type: "Missing value" }); }); if (row.email && !emailPattern.test(row.email)) issues.push({ row: index + 2, type: "Invalid email" }); if (row.id) ids.set(row.id, [...(ids.get(row.id) || []), index]); });
  ids.forEach((indexes) => indexes.length > 1 && indexes.forEach((index) => issues.push({ row: index + 2, type: "Duplicate ID" })));
  return issues;
}

function score(rows, issues) { const weights = { "Duplicate ID": 4, "Invalid email": 2, "Missing value": 4 }; return Math.max(0, Math.round(100 - (issues.reduce((sum, issue) => sum + weights[issue.type], 0) / rows.length) * 10)); }

test("parses CSV records into named fields", () => assert.deepEqual(parseCsv("id,email\n1,a@example.com"), [{ id: "1", email: "a@example.com" }]));
test("flags duplicate IDs, invalid emails, and missing values", () => { const rows = parseCsv("id,email,name\n1,bad-email,\n1,,Grace"); const issues = validate(rows); assert.equal(issues.filter((issue) => issue.type === "Duplicate ID").length, 2); assert.equal(issues.filter((issue) => issue.type === "Invalid email").length, 1); assert.equal(issues.filter((issue) => issue.type === "Missing value").length, 2); });
test("returns a lower score as issue severity accumulates", () => { const rows = parseCsv("id,email,name\n1,bad-email,\n1,,Grace"); assert.equal(score(rows, validate(rows)), 10); });
