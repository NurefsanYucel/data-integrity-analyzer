# Retail CRM Data Quality Case Study

## Business question

Can a customer-contact extract be trusted before it is used for campaign targeting or an AI assistant?

## Scenario

This small, synthetic CRM extract represents common contact-data issues found in retail workflows. It is deliberately small enough for a recruiter to reproduce in the dashboard in under a minute. It is not customer data and contains no real personal information.

The wider analytical context is based on the [UCI Online Retail dataset](https://uci-ics-mlr-prod.aws.uci.edu/dataset/352/online%2Bretail), which contains transactions from a UK online retailer between December 2010 and December 2011. The case-study CSV is a safe CRM-quality scenario designed to demonstrate contact validation, which that transactional dataset does not include.

## Method

1. Upload `retail-crm-quality-case-study.csv`.
2. Map `customer_id` as the ID field and `email` as the email field.
3. Enable required values, unique IDs, email validation, and PII detection.
4. Review the issue distribution and column-completeness charts.
5. Export the issue report, normalize values if needed, and export rows without high-severity problems.

## Findings

| Data-quality dimension | Finding | Business risk |
| --- | --- | --- |
| Uniqueness | Duplicate customer ID and duplicate email records | Double-counted customers and duplicate campaign sends |
| Validity | One malformed email address | Delivery failures and unreliable contact-rate metrics |
| Completeness | One missing customer name | Incomplete personalization and weak record matching |
| AI readiness | Contact data requires review before use in AI workflows | Poor-quality context can reduce response quality and trust |

## Outcome

The dashboard makes the issues traceable to individual source rows, then produces two auditable artifacts: a detailed issue report and an export that excludes high-severity rows. This gives an analyst a reproducible quality-control step before activation or modeling.
