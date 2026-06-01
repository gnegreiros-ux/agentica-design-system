# Pipeline : ux-patterns

> Garde-fou bloquant — toute création de composant et toute modification UX pertinente
> doit passer par une revue des patterns UX approuvée par l'humain, documentée sur 6 surfaces.
> **Statut :** ✅ Actif
> **Déclencheur :** nouveau composant, ou modification UX pertinente d'un composant existant

---

## Principe

> Aucun composant n'est publié sans que les **patterns UX de référence** aient été présentés
> à l'humain (avec liens) et que sa décision ait été **documentée partout**.

Référence d'exécution : `.claude/skills/ux-pattern-review.md`
Sources et checklist : `.claude/rules/ux-patterns-sources.md`

---

## Matrice de déclenchement

| Changement effectué | Revue requise ? |
|--------------------|-----------------|
| Nouveau `components/agtc-*.js` | ✅ Oui — revue complète |
| Nouvelle `guidelines/components/*.md` | ✅ Oui — revue complète |
| Nouvelle variante ou nouvel état d'un composant | ✅ Oui |
| Changement de la logique de validation (moment, règles) | ✅ Oui |
| Changement d'affichage erreur / texte d'aide | ✅ Oui |
| Nouvelle interaction ou nouveau type supporté | ✅ Oui |
| Correction de contraste / WCAG | ❌ Non — couvert par `pipelines/wcag.md` |
| Typo, renommage de variable, refactor sans changement de comportement | ❌ Non |
| Mise à jour de tokens sans impact comportemental | ❌ Non |

> Même distinction « décision vs ajustement » que l'amendement d'ADR-015 : la revue se déclenche
> quand on **crée un comportement UX**, pas quand on corrige l'existant.

---

## Checks du pipeline

### 1. La revue a-t-elle eu lieu ?
- [ ] Patterns suggérés présentés à l'humain (tableau + **liens directs** vers les sources)
- [ ] Checklist de revue couverte : états, affichage erreur, help text, **moment de validation**,
      required markers, progressive disclosure, dark patterns

### 2. L'humain a-t-il approuvé ?
- [ ] Décision explicite (✅/❌) consignée pour chaque pattern proposé
- [ ] Aucun pattern appliqué sans approbation

### 3. Les 6 surfaces sont-elles documentées ?
- [ ] **Guideline** — section `## PATTERNS UX DE RÉFÉRENCE` à jour
- [ ] **Code** — bloc commentaire d'en-tête « POURQUOI » + liens
- [ ] **Storybook** — `parameters.docs.description.component` (sauf composant sans story → noter)
- [ ] **Site** — `node site/build.js` exécuté
- [ ] **ADR** — patterns appliqués listés dans l'ADR d'implémentation du composant
- [ ] **Log** — entrée dans `log/kit-construction.md` (sans chemin `/Users/...`)

---

## Rapport partiel (exemple)

```
### X. Revue patterns UX
- [x] Composant : agtc-input (modification : logique de validation)
- [x] Patterns présentés avec liens (NN/g, IxDF, Smashing)
- [x] Approbation humaine : 4 patterns ✅, 1 ❌ (lazy registration — non pertinent)
- [x] 6 surfaces documentées (guideline, code, story, site, ADR-033, log)
- [ ] ⚠️ Vérifier rebuild site
```
