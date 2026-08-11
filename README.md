# Data Integrity Analyzer

A browser-based data-quality and AI-readiness dashboard for CSV files. Upload a dataset to profile its columns, identify integrity risks, configure validation rules, and export actionable results.

The project is designed as a portfolio example for data-integrity software: it makes validation results understandable, traceable, and useful before data is used for analytics or AI workflows.

## Features

- CSV upload by drag-and-drop or file picker; analysis runs locally in the browser.
- Detects duplicate IDs, duplicate emails, invalid email formats, missing values, invalid numeric values, and possible sensitive data.
- Lets the user map arbitrary CSV columns to ID and email fields.
- Enables or disables validation rules per run.
- Profiles every column with inferred type, completeness, unique value count, and sample values.
- Produces a weighted data-quality trust score and an AI-readiness/PII summary.
- Offers normalization for whitespace and email casing.
- Exports a detailed issue report or a CSV excluding high-severity rows.
- Stores up to ten validation-run summaries in browser local storage for a lightweight audit history.
- Includes sample data for a quick product demonstration.

## Technology

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Lucide icons

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build:

```bash
npm run build
```

## Local API and demo roles

The optional API provides persistent datasets, saved rule sets, remediation records, and an audit log. It uses Node's built-in HTTP server and a local `server/data.json` file, so no database installation is required for the demo.

```bash
cd server
npm run dev
```

Demo accounts:

| Role | Email | Password | Access |
| --- | --- | --- | --- |
| Admin | `admin@example.com` | `demo-admin` | All datasets, rule sets, and audit log |
| Reviewer | `reviewer@example.com` | `demo-reviewer` | Their datasets and rule sets |

The API exposes `POST /api/auth/login`, dataset and rule-set endpoints, an auditable remediation endpoint, and an admin-only audit log. It is a local demonstration backend—not production authentication. Use an identity provider, password hashing designed for credentials, a real database, HTTPS, and server-side authorization before deploying.

## Tests

Run the unit tests for parsing, core validation outcomes, and trust-score calculations:

```bash
cd client
npm test
```

## How validation works

The analyzer auto-detects likely ID and email columns from their headers. Users can change those mappings before reviewing results.

| Rule | Behavior |
| --- | --- |
| Required values | Flags blank cells in every column. |
| Unique IDs | Flags every row whose mapped ID occurs more than once. |
| Email validation | Checks syntax and duplicate values in the mapped email field. |
| Numeric types | Checks columns with names such as `age`, `amount`, `price`, or `quantity`. |
| PII detection | Flags likely phone numbers or national identifiers outside the mapped email field. |

The trust score starts at 100 and subtracts a weighted penalty per record: high = 4, medium = 2, and low = 1. It is an explainable screening metric, not a formal governance score.

## Privacy and limitations

CSV parsing, validation, exports, and history storage happen in the browser. The app does not upload a dataset to a server.

The PII checks and type inference are simple heuristics for demonstration purposes. Production use should add a backed service, role-based access control, encryption, data retention policies, locale-aware validation, and a dedicated compliance/classification system.

## Project structure

```text
client/
├── src/
│   ├── app/App.tsx      # Application state, CSV parser, validation engine, and UI
│   ├── app/main.tsx     # React entry point
│   └── index.css        # Tailwind theme and reusable component styles
├── package.json
└── vite.config.ts
```

## Suggested next steps

- Add unit tests for CSV parsing, validation rules, and scoring.
- Add a backend for authenticated users, persistent datasets, and auditable remediation actions.
- Support saved rule sets, schemas, data-source connections, and role-based workflow approvals.
- Expand PII detection with configurable patterns and false-positive review.
