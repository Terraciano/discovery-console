# Discovery Console

Internal discovery-call companion for the Tasteful Landings workflow.

This is not a client intake portal.

The purpose is to capture a human discovery conversation in a structured format that an agent can use to refine an **existing demo repository**.

## Flow

```text
public information
      ↓
one-shot demo repo
      ↓
client likes demo / accepts price
      ↓
discovery call
      ↓
Discovery Console
      ↓
client-brief.json
      ↓
tasteful-landings harness
      ↓
inspect + refine existing demo
      ↓
production-ready site
```

## What it does

- structured discovery sections
- free text and select inputs
- evidence state per answer:
  - `confirmed`
  - `inferred`
  - `unknown`
- local autosave with `localStorage`
- existing demo repo + demo URL fields
- JSON preview
- copy JSON
- download `client-brief.json`
- download `CLIENT_BRIEF.md`

## What it intentionally does not do

- no authentication
- no backend
- no database
- no API endpoints
- no CRM
- no client portal
- no AI generation
- no design-system abstraction

It is a structured note-taking tool.

## Run

```bash
bun install
bun run dev
```

## Build

```bash
bun run typecheck
bun run build
```

## Harness contract

The exported JSON includes:

```json
{
  "schemaVersion": 1,
  "project": {
    "brandName": "...",
    "demoRepository": "owner/repo",
    "demoUrl": "..."
  },
  "business": {},
  "audience": {},
  "brand": {},
  "trust": {},
  "website": {},
  "content": {},
  "operations": {},
  "constraints": {},
  "evidence": {
    "confirmedFacts": [],
    "inferences": [],
    "unknowns": []
  },
  "refinement": {
    "mode": "refine-existing-demo",
    "instruction": "Inspect the existing demo repository first..."
  }
}
```

The downstream harness must inspect the existing demo before editing it. Discovery replaces assumptions with confirmed client facts; it does not imply regenerating the site from scratch.

## Privacy

Drafts are stored only in the browser's local storage.

Do not put client secrets, credentials, passwords, payment data, or private keys into the console.
