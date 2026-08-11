import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

const port = Number(process.env.PORT || 8787);
const storePath = join(process.cwd(), "data.json");
const initialStore = { users: [{ id: "admin-1", email: "admin@example.com", passwordHash: hash("demo-admin"), role: "admin" }, { id: "reviewer-1", email: "reviewer@example.com", passwordHash: hash("demo-reviewer"), role: "reviewer" }], datasets: [], ruleSets: [], auditLog: [] };
const sessions = new Map();

function hash(value) { return createHash("sha256").update(value).digest("hex"); }
function readStore() { if (!existsSync(storePath)) return structuredClone(initialStore); try { return JSON.parse(readFileSync(storePath, "utf8")); } catch { return structuredClone(initialStore); } }
function writeStore(store) { writeFileSync(storePath, JSON.stringify(store, null, 2)); }
function json(response, status, body) { response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:5173", "Access-Control-Allow-Headers": "Content-Type, Authorization" }); response.end(JSON.stringify(body)); }
function actor(request, response) { const token = request.headers.authorization?.replace("Bearer ", ""); const user = token && sessions.get(token); if (!user) { json(response, 401, { error: "Authentication required" }); return null; } return user; }
function audit(store, user, action, target, details = {}) { store.auditLog.unshift({ id: randomUUID(), at: new Date().toISOString(), actor: user.email, role: user.role, action, target, details }); store.auditLog = store.auditLog.slice(0, 200); }
async function body(request) { let data = ""; for await (const chunk of request) data += chunk; return data ? JSON.parse(data) : {}; }

createServer(async (request, response) => {
  if (request.method === "OPTIONS") return json(response, 204, {});
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { status: "ok" });
  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const { email, password } = await body(request); const store = readStore(); const user = store.users.find((candidate) => candidate.email === email && candidate.passwordHash === hash(password || ""));
    if (!user) return json(response, 401, { error: "Invalid email or password" }); const token = randomUUID(); sessions.set(token, user); audit(store, user, "login", "session"); writeStore(store); return json(response, 200, { token, user: { id: user.id, email: user.email, role: user.role } });
  }
  const user = actor(request, response); if (!user) return;
  const store = readStore();
  if (request.method === "GET" && url.pathname === "/api/datasets") return json(response, 200, store.datasets.filter((dataset) => user.role === "admin" || dataset.ownerId === user.id));
  if (request.method === "POST" && url.pathname === "/api/datasets") { const payload = await body(request); const dataset = { id: randomUUID(), ownerId: user.id, name: payload.name, rows: payload.rows, summary: payload.summary, status: "pending_review", createdAt: new Date().toISOString() }; store.datasets.unshift(dataset); audit(store, user, "dataset_created", dataset.id, { name: dataset.name }); writeStore(store); return json(response, 201, dataset); }
  if (request.method === "GET" && url.pathname === "/api/rule-sets") return json(response, 200, store.ruleSets.filter((ruleSet) => user.role === "admin" || ruleSet.ownerId === user.id));
  if (request.method === "POST" && url.pathname === "/api/rule-sets") { const payload = await body(request); const ruleSet = { id: randomUUID(), ownerId: user.id, name: payload.name, rules: payload.rules, schema: payload.schema, piiPatterns: payload.piiPatterns || [], createdAt: new Date().toISOString() }; store.ruleSets.unshift(ruleSet); audit(store, user, "rule_set_saved", ruleSet.id, { name: ruleSet.name }); writeStore(store); return json(response, 201, ruleSet); }
  const remediation = url.pathname.match(/^\/api\/datasets\/([^/]+)\/remediation$/);
  if (request.method === "POST" && remediation) { const dataset = store.datasets.find((item) => item.id === remediation[1]); if (!dataset) return json(response, 404, { error: "Dataset not found" }); if (user.role !== "admin" && dataset.ownerId !== user.id) return json(response, 403, { error: "Not allowed" }); const payload = await body(request); dataset.status = payload.status || "remediated"; dataset.remediation = { action: payload.action, note: payload.note || "", by: user.email, at: new Date().toISOString() }; audit(store, user, "remediation_recorded", dataset.id, dataset.remediation); writeStore(store); return json(response, 200, dataset); }
  if (request.method === "GET" && url.pathname === "/api/audit-log") { if (user.role !== "admin") return json(response, 403, { error: "Admin role required" }); return json(response, 200, store.auditLog); }
  return json(response, 404, { error: "Route not found" });
}).listen(port, () => console.log(`Data Integrity API listening on http://localhost:${port}`));
