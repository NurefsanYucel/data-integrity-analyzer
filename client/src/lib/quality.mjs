const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /(?:\+?\d[\d\s().-]{7,}\d)/;

/** Parse a CSV string without sending user data to an external service. */
export function parseCsv(text) {
  const cells = []; let row = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') { if (quoted && text[index + 1] === '"') { cell += char; index += 1; } else quoted = !quoted; }
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && text[index + 1] === "\n") index += 1; row.push(cell.trim()); if (row.some(Boolean)) cells.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) cells.push(row);
  const [headers, ...records] = cells; if (!headers?.length) return [];
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header || `Column ${index + 1}`, record[index] ?? ""])));
}

export function analyzeRows(rows, { headers, idField, emailField, rules, piiPatterns = "" }) {
  const results = []; const add = (row, field, value, type, message, severity = "medium") => results.push({ row, field, value, type, message, severity });
  const duplicates = (field, type) => { if (!field) return; const locations = new Map(); rows.forEach((record, index) => { const value = record[field].trim().toLowerCase(); if (value) locations.set(value, [...(locations.get(value) || []), index]); }); locations.forEach((indexes) => indexes.length > 1 && indexes.forEach((index) => add(index + 2, field, rows[index][field], type, `Appears in ${indexes.length} records`, "high"))); };
  if (rules.uniqueId) duplicates(idField, "Duplicate ID"); if (rules.email) duplicates(emailField, "Duplicate email");
  const patterns = piiPatterns.split(",").map((pattern) => pattern.trim()).filter(Boolean).flatMap((pattern) => { try { return [new RegExp(pattern, "i")]; } catch { return []; } });
  rows.forEach((record, index) => headers.forEach((field) => { const value = record[field].trim(); const customPiiMatch = patterns.some((pattern) => pattern.test(value)); if (rules.required && !value) add(index + 2, field, "—", "Missing value", "Required cell is empty", "high"); if (rules.email && field === emailField && value && !emailPattern.test(value)) add(index + 2, field, value, "Invalid email", "Email format is not valid", "medium"); if (rules.numeric && /age|amount|count|number|price|quantity/i.test(field) && value && Number.isNaN(Number(value))) add(index + 2, field, value, "Invalid type", "Expected a numeric value", "medium"); if (rules.pii && field !== emailField && value && (phonePattern.test(value) || /\b\d{3}-?\d{2}-?\d{4}\b/.test(value) || customPiiMatch)) add(index + 2, field, value, "Sensitive data", "Possible phone number or national identifier", "low"); }));
  return results.sort((a, b) => a.row - b.row);
}

export function calculateScore(rowCount, issues) { return rowCount ? Math.max(0, Math.round(100 - (issues.reduce((total, issue) => total + ({ high: 4, medium: 2, low: 1 }[issue.severity]), 0) / rowCount) * 10)) : 0; }

export function createProfile(rows, headers) { return headers.map((field) => { const values = rows.map((row) => row[field].trim()); const present = values.filter(Boolean); const type = !present.length ? "Empty" : present.every((value) => !Number.isNaN(Number(value))) ? "Number" : present.every((value) => !Number.isNaN(Date.parse(value))) ? "Date" : present.every((value) => emailPattern.test(value)) ? "Email" : "Text"; return { field, type, completeness: Math.round((present.length / Math.max(rows.length, 1)) * 100), unique: new Set(present.map((value) => value.toLowerCase())).size, samples: present.slice(0, 3).join(", ") || "—" }; }); }

export function escapeCsv(value) { return `"${String(value).replaceAll('"', '""')}"`; }
