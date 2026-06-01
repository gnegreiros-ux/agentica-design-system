# Skill : ux-pattern-review

> Capacité réutilisable : présenter les patterns UX de référence pour un composant,
> recueillir l'approbation humaine, puis documenter la décision sur 6 surfaces.
> **Type:** skill
> **Chemin logique:** .claude/skills/ux-pattern-review.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/ux-patterns-sources.md
> **Relations:** .claude/rules/ux-patterns-sources.md, .claude/skills/pipelines/ux-patterns.md, guidelines/components/, decisions/ADR-036-ux-pattern-review-pre-composant.md

---

## Objectif

Avant de publier un composant — nouveau ou modifié de façon UX pertinente — présenter à
l'humain les **patterns UX suggérés** par les 5 sources de référence (voir
`.claude/rules/ux-patterns-sources.md`), **avec liens directs**, afin qu'il **juge et approuve**
lesquels appliquer. La décision est ensuite **documentée partout**.

> **Le dernier mot est toujours humain.** Ce skill propose, l'humain décide.

---

## Quand exécuter ce skill

- À la **création** d'un nouveau composant (toujours).
- À une **modification pertinente** d'un composant existant : nouvelle variante/état, changement
  de la logique de validation, de l'affichage erreur/aide, d'une interaction, ajout d'un type.
- **Pas nécessaire** pour : correction de contraste, typo, renommage de variable, refactor sans
  changement de comportement.

---

## Processus

### Étape 1 — Cadrer
Identifier :
- Le composant concerné et son **type** (champ, action, feedback, conteneur, icône, navigation, données…).
- La **nature du changement** (création vs modification ; quel aspect UX est touché).

### Étape 2 — Consulter les sources (hybride)
- Lire la **matrice type → sources prioritaires** dans `.claude/rules/ux-patterns-sources.md`.
- Faire un **WebFetch ciblé** sur la/les source(s) prioritaires pour ce type de composant.
- Toujours inclure NN/g comme socle d'usabilité.

### Étape 3 — Présenter les patterns suggérés
Produire un tableau (format ci-dessous) listant chaque pattern candidat avec :
nom, source + **lien direct**, problème qu'il résout, recommandation par défaut.
Couvrir explicitement les questions de la **checklist de revue** : états, affichage erreur,
help text, **moment de validation**, required markers, progressive disclosure, dark patterns.

### Étape 4 — Attendre l'approbation humaine
- L'humain coche les patterns à appliquer (✅) et écarte les autres (❌), avec justification.
- **Ne rien construire ni publier avant cette approbation.**
- En cas de doute sur l'impact (ex. action critique, donnée sensible) : escalader.

### Étape 5 — Documenter sur les 6 surfaces
Propager le **Pattern Decision Record** (voir `.claude/rules/ux-patterns-sources.md`) :
1. **Guideline** `guidelines/components/<comp>.md` → section `## PATTERNS UX DE RÉFÉRENCE`.
2. **Code** `components/agtc-<comp>.js` → bloc commentaire d'en-tête « POURQUOI » + liens.
3. **Storybook** `components/agtc-<comp>.stories.js` → `parameters.docs.description.component`.
4. **Site** → `node site/build.js`.
5. **ADR** d'implémentation du composant → liste des patterns appliqués.
6. **Log** `log/kit-construction.md` → entrée de la revue.

---

## Format de sortie — patterns suggérés

```markdown
## Revue de patterns UX — <composant>

Type : <type> · Nature : <création | modification : aspect touché>
Sources consultées : <liste avec liens>

| Pattern | Source (lien) | Problème résolu | Recommandation | Décision |
|---------|---------------|-----------------|----------------|----------|
| Inline error sous le champ | [NN/g — error handling](https://www.nngroup.com/articles/design-pattern-guidelines/) | Où afficher l'erreur | Recommandé | ☐ ✅ / ☐ ❌ |
| Validation onBlur (pas onChange) | [IxDF — forms](https://ixdf.org/literature/topics/ui-design-patterns) | Quand valider | Recommandé | ☐ ✅ / ☐ ❌ |
| Required marker `*` + aria-required | [IxDF — required fields](https://ixdf.org/literature/topics/ui-design-patterns) | Signaler l'obligatoire | Recommandé | ☐ ✅ / ☐ ❌ |
| … | … | … | … | ☐ ✅ / ☐ ❌ |

### Questions ouvertes pour l'humain
- [moment de validation, cas limites, arbitrages]

### En attente d'approbation
> Coche les patterns à appliquer. Aucune publication avant ta décision.
```

---

## Ce que ce skill ne fait PAS

```
❌ Inventer un pattern non issu des sources de référence
❌ Décider seul des patterns à appliquer
❌ Construire ou publier un composant sans approbation humaine
❌ Sauter la propagation sur les 6 surfaces
❌ Contourner le pipeline ux-patterns du quality-gate
```
