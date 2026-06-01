# Rule : ux-patterns-sources

> Registre des sources de référence UX et checklist de revue des patterns par composant.
> À consulter avant la création de tout composant et avant toute modification UX pertinente.
> **Type:** rule
> **Chemin logique:** .claude/rules/ux-patterns-sources.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/skills/ux-pattern-review.md, .claude/skills/pipelines/ux-patterns.md, decisions/ADR-036-ux-pattern-review-pre-composant.md, guidelines/components/

---

## Pourquoi ce registre existe

> Avant de publier un composant, l'humain doit pouvoir juger **quels patterns UX** lui appliquer.
> Les agents ne décident pas des patterns — ils **présentent** les options issues de sources
> reconnues, avec liens, et l'humain **approuve**.

Exemple concret (composant `input`) : *comment afficher l'état d'erreur ? le texte d'aide ?
à quel moment exécuter la validation (à la frappe, à la perte de focus, à la soumission) ?*
Ces questions ont des réponses documentées dans les sources ci-dessous — on les présente
systématiquement plutôt que d'improviser.

---

## Les 5 sources de référence

| # | Source | Lien | Ce qu'elle couvre | Pertinente surtout pour |
|---|--------|------|-------------------|-------------------------|
| 1 | **IF — Data Patterns Catalogue** | https://catalogue.projectsbyif.com/ | Consentement, authentification, partage et accès aux données, transparence IA, contrôles de sécurité | Champs sensibles, consentement, login, composants « agentiques »/IA |
| 2 | **Nielsen Norman Group** | https://www.nngroup.com/articles/design-pattern-guidelines/ | Index de 72 guidelines : input controls, forms & wizards, tooltips/dialogs, icons & indicators, menus, navigation, search, error handling, privacy & ethics | Quasi tous les composants — référence d'usabilité |
| 3 | **Dashboard Design Patterns** | https://dashboarddesignpatterns.github.io/patterns.html | Patterns composants (data / meta / visual / interaction) + composition (screenspace / structure / page layout / color) | Dashboard, data viz, tables, cards, layout |
| 4 | **Interaction Design Foundation** | https://ixdf.org/literature/topics/ui-design-patterns | Navigation & wayfinding, forms & input (lazy registration, forgiving formats, required markers, progressive disclosure), interaction, feedback, dark patterns | Forms, inputs, navigation, feedback |
| 5 | **Smashing Magazine** | https://www.smashingmagazine.com/category/design-patterns/ | Modals vs pages, notifications, forms & error messages, data tables, nested filters, hidden vs disabled, accessibilité | Forms, tables, modals, notifications, états |

> Le contenu des sources est consulté **en hybride** : ce registre sert de base versionnée, et
> le skill `ux-pattern-review` fait un **WebFetch ciblé** sur la/les source(s) prioritaires au
> moment de la revue (voir matrice ci-dessous).

---

## Matrice : type de composant → sources prioritaires

| Type de composant | Sources à consulter en priorité |
|-------------------|--------------------------------|
| Champ de saisie (`input`, `textarea`, `select`) | NN/g (input controls, forms, error handling), IxDF (forms & input), Smashing (forms & error messages) |
| Action (`button`, liens d'action) | NN/g (input controls), IxDF (clear primary action), Smashing (hidden vs disabled) |
| Feedback / statut (`badge`, `toast`, `alert`) | NN/g (icons & indicators), Dashboard (visual representations), Smashing (notifications) |
| Conteneur / mise en page (`card`, `panel`, grilles) | Dashboard (page layout, composition), Smashing (modals vs pages) |
| Iconographie (`icon`) | NN/g (icons & indicators), IF (transparence / signification) |
| Navigation (`tabs`, `breadcrumb`, `menu`) | IxDF (navigation & wayfinding), NN/g (navigation, menus) |
| Données / tableaux (`table`, `data-grid`, dashboards) | Dashboard (data, interaction, composition), Smashing (data tables, nested filters) |
| Données sensibles / consentement / IA | IF (consentement, accès données, transparence IA), NN/g (privacy & ethics) |

> Toujours inclure **NN/g** comme socle d'usabilité, plus la/les source(s) spécifiques au type.

---

## Checklist de revue par composant

Pour chaque composant (nouveau ou modification UX pertinente), passer en revue :

### États et interactions
- [ ] États couverts : default, hover, focus(-visible), active, error/invalid, disabled, readonly, loading
- [ ] Action principale claire (un seul `primary` par section — cf. règle button)
- [ ] Cibles tactiles ≥ 24×24px (WCAG 2.5.8)

### Saisie et validation (si applicable)
- [ ] **Affichage de l'état d'erreur** : emplacement, couleur tokenisée, `role="alert"`, message explicite
- [ ] **Texte d'aide (help text)** : emplacement, lien `aria-describedby`, distinction visuelle vs erreur
- [ ] **Moment de la validation** : à la frappe (`onChange`) / à la perte de focus (`onBlur`) / à la soumission (`onSubmit`) — décision explicite et justifiée
- [ ] **Required markers** : marqueur visuel `*` + `aria-required`
- [ ] **Forgiving formats** : tolérance de saisie quand pertinent (espaces, formats multiples)
- [ ] **Progressive disclosure** : révéler la complexité progressivement quand pertinent

### Éthique et accessibilité
- [ ] **Dark patterns à éviter** : pas de consentement forcé, pas de hiérarchie trompeuse, pas de désactivation masquée trompeuse
- [ ] Accessibilité : déléguer au pipeline `pipelines/wcag.md` (contraste, focus, ARIA, reduced-motion)

---

## Checklist des 6 surfaces de propagation

Une fois les patterns **approuvés par l'humain**, la décision est documentée **partout** :

| # | Surface | Forme attendue |
|---|---------|----------------|
| 1 | **Guideline** `guidelines/components/<comp>.md` | Section `## PATTERNS UX DE RÉFÉRENCE` — tableau `Pattern \| Source (lien) \| Appliqué ✅/❌ \| Justification` |
| 2 | **Code** `components/agtc-<comp>.js` | Bloc commentaire d'en-tête « POURQUOI » listant les patterns appliqués + liens |
| 3 | **Storybook** `components/agtc-<comp>.stories.js` | `parameters.docs.description.component` — résumé des patterns appliqués + liens |
| 4 | **Site** | `node site/build.js` régénère la page composant à partir de la guideline |
| 5 | **ADR** | ADR d'implémentation du composant — liste des patterns appliqués (gouverné par ADR-036) |
| 6 | **Log** `log/kit-construction.md` | Entrée de la revue (sans chemin `/Users/...`) |

> Le pipeline `pipelines/ux-patterns.md` **vérifie** que ces 6 surfaces sont à jour avant tout commit.

---

## Règle pour les agents

```
✅ Présenter les patterns issus des sources, avec liens directs
✅ Recommander un défaut, mais laisser l'humain trancher
✅ Documenter la décision sur les 6 surfaces
❌ Inventer un pattern non issu des sources
❌ Appliquer un pattern sans approbation humaine explicite
❌ Publier un composant sans que la revue ait eu lieu
```

> **Le dernier mot est toujours humain** — l'agent propose les patterns, l'humain décide.
