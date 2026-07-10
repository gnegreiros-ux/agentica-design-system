# Pipeline: docs

> Exhaustive checklist of documentation updates required after a change.
> **Status:** ✅ Active
> **Trigger:** every change (no exception)

---

## Documentation → trigger matrix

| Documentation | Trigger |
|--------------|------------|
| `guidelines/foundations/color.md` | Change in color tokens |
| `guidelines/foundations/typography.md` | Font or scale change |
| `guidelines/foundations/spacing.md` | Spacing or density change |
| `guidelines/components/[component].md` | Change to a component |
| `guidelines/overview.md` | New component added |
| `decisions/ADR-0XX.md` | Any architectural decision (see adr-triggers.md) |
| `decisions/README.md` | Any new ADR |
| `DESIGN.md` | Identity, governance, or principle change |
| `README.md` | Project structure change |
| `AGENTS.md` | New rule for agents |
| `.claude/rules/` | New convention or rule change |
| Website (`site/build.js`) | Any visible change on the site |

---

## Documentation quality rules

### Project tracking (GitHub Projects, ADR-069)
- ✅ Effort reflected in GitHub Projects (status, domain)
- ❌ Do not recreate a local log/journal file for this purpose

### FR/EN bilingual parity
- ✅ Any content added in French → English version required in `<span class="lang-en">`
- ✅ Any content added in English → French version required in `<span class="lang-fr">`
- ❌ Never visible text in only one language on the site

### Component guidelines
- ✅ `guidelines/components/[component].md` updated when behavior or tokens change
- ✅ Allowed variants exactly mirror `tokens/component.json`
- ❌ Never a variant documented but absent from the token

### Decisions
- ✅ `decisions/README.md` → line added for every new ADR
- ✅ The ADR references the files it impacts in its `Relations:`
- ✅ Rejected alternatives are documented with their rationale

---

## Partial report (example)

```
### 5. Documentation
- [x] guidelines/foundations/typography.md — updated (Mono section)
- [x] decisions/README.md — ADR-028 indexed
- [x] Bilingual parity verified (lang-fr / lang-en present)
- [ ] Site rebuild: node site/build.js → ✓ 37 files generated
- [x] DESIGN.md — up to date (no change required)
```
