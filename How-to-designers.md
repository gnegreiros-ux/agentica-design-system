# How-to — Designers (équipe design system)

> Ce guide s'adresse à l'équipe qui **maintient** le système, pas aux équipes produit.
> Dernier mot toujours humain. Les agents proposent, vous approuvez.
> **Type:** instruction
> **Chemin logique:** How-to-designers.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** tokens/semantic.json, tokens/component.json, guidelines/components/, DESIGN.md

---

## 1. Setup initial

### Tokens Studio (Figma)
1. Installer le plugin **Tokens Studio for Figma**
2. Connecter au repo : Settings → Sync → GitHub → pointer vers `tokens/`
3. Importer dans cet ordre : `primitives.json` → `semantic.json` → `component.json`
4. **Ne jamais modifier les tokens directement dans Figma** — toujours éditer les JSON et synchroniser

### Variables Figma natives
1. Dans le fichier Figma du système : ouvrir le panneau **Variables**
2. Les collections correspondent aux trois couches :
   - `Primitives` → `tokens/primitives.json`
   - `Semantic` → `tokens/semantic.json`
   - `Components` → `tokens/component.json`
3. Toute variable locale créée dans un fichier produit = dette — signaler à l'équipe

---

## 2. Workflow quotidien

### Modifier un token existant

**Règle :** tout changement de token sémantique ou composant = TCR.

```
1. Identifier la couche : primitif / sémantique / composant
2. Modifier le fichier JSON (pas dans Figma directement)
3. Soumettre une demande TCR avec justification et impact
4. Après approbation : pousser au repo → sync Tokens Studio ou Variables Figma
5. Communiquer aux équipes consommatrices
```

### Ajouter un composant

```
1. Rédiger le contrat : guidelines/components/[nom].md
   — Intention, variantes, tokens, accessibilité, anti-patterns
2. Créer les tokens dans tokens/component.json
3. Construire le composant Figma en utilisant UNIQUEMENT les tokens semantic/component
4. Documenter dans Storybook (avec le développeur)
5. Mettre à jour guidelines/components/overview.md
```

### Détecter une dérive (audit)
Signaux à surveiller dans les fichiers Figma des équipes produit :
- Instances détachées (composants modifiés localement)
- Variables locales créées en dehors du système
- Couleurs ou espacements sans référence à un token
- Composants dupliqués qui reproduisent un existant

Quand une dérive est détectée : documenter → ouvrir un ticket → proposer la correction (jamais corriger sans en aviser l'équipe produit).

---

## 3. Fichiers à connaître

| Fichier | Rôle | Quand le modifier |
|---------|------|-------------------|
| `tokens/semantic.json` | Intentions UX — nommer avec sens | Via TCR uniquement |
| `tokens/component.json` | Décisions visuelles par composant | Via TCR + approbation |
| `guidelines/components/[nom].md` | Contrat du composant | À chaque changement de règle |
| `.claude/rules/` | Ce que les agents IA lisent au démarrage | Après chaque TCR majeur ou nouvelle règle |
| `DESIGN.md` | Principes et gouvernance | Révision trimestrielle |

---

## 4. Règles non négociables

- ❌ Jamais de variable locale dans les fichiers système
- ❌ Jamais de token primitif appliqué directement sur un composant
- ❌ Jamais de modification de token sans TCR
- ✅ Nommer les tokens par **intention**, pas par valeur (`color.feedback.danger`, pas `color.red`)
- ✅ Tout composant a un contrat `.md` avant d'être livré
- ✅ `.claude/rules/` à jour = agents IA fiables pour toute l'équipe
