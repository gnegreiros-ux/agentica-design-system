# Pipeline: style-dictionary

> Token compilation and validation via Style Dictionary.
> **Status:** 🔜 Planned — non-blocking until activated
> **Trigger:** any change in `tokens/`

---

## Objective

Once activated, this pipeline:
1. Compiles `tokens/primitives.json` + `tokens/semantic.json` + `tokens/component.json` → CSS, JS, Swift, Android XML
2. Validates that every reference resolves
3. Verifies that outputs (`dist/css/`, `dist/js/`, etc.) are consistent with the source tokens

---

## Command (future)

```bash
npx style-dictionary build --config style-dictionary/config.json
```

## Expected outputs

```
dist/
├── css/variables.css       ← CSS Custom Properties
├── js/tokens.js            ← ES6 module
├── ios/tokens.swift        ← Swift
└── android/tokens.xml      ← Android XML
```

## Checks to implement

- [ ] Exit 0 on compilation (no resolution errors)
- [ ] `dist/css/variables.css` contains every semantic token
- [ ] Resolved CSS value matches the value in `primitives.json`
- [ ] No `{unresolved.ref}` token in the outputs

## Activation

Once Style Dictionary is integrated into the project:
1. Install: `npm install style-dictionary`
2. Configure `style-dictionary/config.json`
3. Change the status above to `✅ Active`
4. Add to `quality-gate.md` → pipeline table: `✅ Active`
5. Create an ADR documenting the decision (if not already done — ADR-003 exists)
