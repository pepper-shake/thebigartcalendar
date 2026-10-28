# Knowledge base — the system of record

The repository is the source of truth. Anyone working on this project — human or agent — can only reason over what's written here. If a decision, constraint, or piece of context lives only in chat or someone's head, it effectively doesn't exist. Externalize it into these files.

[AGENTS.md](../AGENTS.md) is the **map**; this `docs/` tree holds the **detail**. The structure follows OpenAI's "harness engineering" model (repository knowledge as system of record), right-sized for this project.

## Layout
| Path | What it holds |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system map: data flow, read path, where code lives |
| [design/decisions.md](design/decisions.md) | Accepted decisions + rationale (ADR log), with status |
| [design/style.md](design/style.md) | Visual style: fonts, colour tokens, duotone card schemes, Figma mapping |
| [exec-plans/active/](exec-plans/active/) | In-flight work, with progress + decision logs |
| [exec-plans/tech-debt.md](exec-plans/tech-debt.md) | Known debt / deferred work |
| [product/](product/) | Feature specs — what we're building for users, and why |
| [references/](references/) | Integration runbooks + external docs distilled for this repo |
| [generated/](generated/) | Machine-generated snapshots (e.g. DB schema) — do not hand-edit |
| [SECURITY.md](SECURITY.md) | Secrets, auth surfaces, data handling |

## Maintenance ("doc-gardening")
- **Treat docs like code.** Update the relevant doc in the *same* change as the code. A change that alters behavior but not its doc is incomplete.
- When a decision is reversed, mark the old one **Superseded** in `design/decisions.md` — don't delete it.
- Move finished plans out of `exec-plans/active/`.
- Regenerate `generated/` rather than editing by hand.
- **If a doc contradicts the code, the code wins** — fix the doc.

**Not yet written** (add when the work lands): reliability/observability docs.

**Future improvement:** a CI linter (valid links, referenced files exist, AGENTS.md stays bounded, schema doc matches the real schema) and a recurring doc-gardening agent that opens fix-up PRs for stale docs. Tracked in [exec-plans/tech-debt.md](exec-plans/tech-debt.md).
