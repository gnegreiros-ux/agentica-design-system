# Skill : quality-gate

> Orchestrateur pré-commit. Exécute tous les pipelines actifs dans l'ordre, génère un rapport d'impact, attend l'approbation humaine avant tout commit.
> **Type:** skill
> **Chemin logique:** .claude/skills/quality-gate.md
> **Lecture avant:** AGENTS.md, .claude/rules/post-change-pipeline.md
> **Relations:** .claude/skills/pipelines/, decisions/ADR-029-quality-gate-pre-commit.md

---

## Règle absolue

> **Aucun commit sans que tous les blocs obligatoires aient été exécutés et approuvés par l'humain.**

---

## Déclenchement

Exécuter ce quality gate **après toute modification**, quelle que soit sa taille :
- Modification d'un token (primitif, sémantique, composant)
- Modification d'un composant ou d'une page du site
- Ajout ou modification d'une règle, d'un ADR, d'une guideline
- Modification de la configuration (build, Style Dictionary, etc.)

---

## Pipelines disponibles

| Pipeline | Fichier | Statut | Obligatoire |
|----------|---------|--------|-------------|
| Cohérence tokens | `pipelines/tokens-audit.md` | ✅ Actif | Oui |
| WCAG 2.2 | `pipelines/wcag.md` | ✅ Actif | Oui |
| Conformité règles / ADRs | `pipelines/adr-conformity.md` | ✅ Actif | Oui |
| ADRs manquants | `pipelines/adr-triggers.md` | ✅ Actif | Oui |
| Documentation | `pipelines/docs.md` | ✅ Actif | Oui |
| Site rebuild | `pipelines/site.md` | ✅ Actif | Oui |
| Commit | `pipelines/commit.md` | ✅ Actif | Oui |
| Style Dictionary | `pipelines/style-dictionary.md` | 🔜 Planifié | Quand actif |
| Storybook | `pipelines/storybook.md` | 🔜 Planifié | Quand actif |
| Chromatic | `pipelines/chromatic.md` | 🔜 Planifié | Quand actif |
| axe-core | `pipelines/axe-core.md` | 🔜 Planifié | Quand actif |
| Playwright | `pipelines/playwright.md` | 🔜 Planifié | Quand actif |

---

## Séquence d'exécution

```
1. git diff --name-only                    → identifier les fichiers modifiés
2. Filtrer les pipelines déclenchés        → selon la matrice dans chaque pipeline
3. Exécuter chaque pipeline actif          → générer les items de rapport
4. Présenter le rapport complet            → format checklist ci-dessous
5. Attendre l'approbation explicite        → "Oui, vas-y" ou corrections demandées
6. Exécuter les tâches approuvées          → dans l'ordre : tokens → site → docs → commit
7. Commiter en un seul commit cohérent     → conventional commits, sans --no-verify
```

---

## Format du rapport

```markdown
## Quality Gate — approbation requise

### Fichiers modifiés
- [liste des fichiers depuis git diff]

### 1. Cohérence tokens
- [ ] Aucune valeur codée en dur (hex, px, font-family hardcodé)
- [ ] Tous les tokens référencés existent
- [ ] Aucun token orphelin créé

### 2. WCAG 2.2
- [ ] Contraste texte normal ≥ 4.5:1
- [ ] Contraste texte large ≥ 3:1
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Touch targets ≥ 24×24px (WCAG 2.5.8)
- [ ] Pas d'animation sans prefers-reduced-motion

### 3. Conformité règles / ADRs
- [ ] ADR actif n°XX respecté : [règle spécifique]
- [ ] ...

### 4. ADRs manquants
- [ ] [Décision X] → ADR-0XX à créer : [titre proposé]
- ou : Aucun nouvel ADR requis

### 5. Documentation
- [ ] guidelines/[section].md mis à jour
- [ ] log/kit-construction.md — entrée sans chemin local
- [ ] decisions/README.md mis à jour (si nouvel ADR)
- [ ] Parité bilingue FR/EN vérifiée
- [ ] Site rebuild : node site/build.js

### 6. Pipelines planifiés (non bloquants)
- ⏳ Style Dictionary : non encore actif
- ⏳ Storybook : non encore actif

### 7. Commit
- [ ] Format : type(scope): description courte
- [ ] Un seul commit cohérent
- [ ] Pas de chemin /Users/... dans les fichiers commités

### Points d'attention
- [escalades, approbations spéciales Principal Designer]
```

---

## Ajouter un nouveau pipeline

1. Créer `.claude/skills/pipelines/[nom].md` avec le format standard (voir `pipelines/style-dictionary.md` comme exemple de stub)
2. Ajouter une ligne dans le tableau "Pipelines disponibles" ci-dessus
3. Mettre le statut à `✅ Actif` quand le pipeline est opérationnel
4. Créer un ADR si le pipeline représente une décision architecturale significative
