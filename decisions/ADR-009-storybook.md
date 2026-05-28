# ADR-009 — Choix de Storybook pour la documentation des composants

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Tech Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-009-storybook.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/development.md, decisions/ADR-002-lit-web-components.md
> **Relations:** .claude/rules/development.md, decisions/ADR-002-lit-web-components.md, decisions/ADR-006-chromatic-tests-visuels.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Contexte

Un système de design sans environnement de prévisualisation isolé a deux problèmes
structurels : les composants ne peuvent être testés qu'en les intégrant dans une
application réelle, et la documentation est séparée du composant qu'elle décrit.

Pour un système agentique, un troisième problème s'ajoute : les agents ont besoin
d'un catalogue structuré de composants avec leurs variantes, états, et propriétés
accessibles sous une forme standardisée. Une documentation narrative dans un wiki
n'est pas analysable par machine.

La question posée était :

> **Comment fournir simultanément un environnement de développement isolé,
> une documentation vivante synchronisée avec le code, et un catalogue
> structuré accessible aux agents ?**

---

## Décision

Adoption de **Storybook** comme plateforme de documentation et de canvas de développement.

Chaque composant est documenté via des **stories** — des fichiers `.stories.js`
qui décrivent chaque variante et état du composant de manière isolée :

```javascript
// button.stories.js
export default { title: 'Components/Button', component: 'ds-button' };
export const Primary = { args: { variant: 'primary', label: 'Soumettre' } };
export const Critical = { args: { variant: 'critical', label: 'Supprimer définitivement' } };
```

Storybook sert trois rôles simultanés dans le système :

1. **Canvas de développement** — chaque composant est développé et testé en isolation,
   sans dépendance à une application hôte
2. **Documentation vivante** — les stories sont la source de vérité du comportement
   réel des composants, toujours synchronisées avec le code
3. **Pont vers Chromatic** — Storybook est l'entrée du pipeline Chromatic (ADR-006) :
   chaque story est automatiquement capturée pour les tests de régression visuelle

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Documentation statique (Markdown + MDX seul)** | Décrit le composant sans le montrer. Un développeur doit intégrer le composant dans son projet pour voir s'il se comporte comme documenté. Aucun lien entre la documentation et le code exécutable. |
| **Styleguidist** | Similaire à Storybook mais moins adopté, moins d'intégrations (pas de Chromatic natif, pas d'addon axe-core). L'écosystème Storybook est significativement plus riche pour les Web Components. |
| **Figma comme seule source de prévisualisation** | Figma montre le design, pas le composant réel. Un composant peut être visuellement conforme dans Figma et dysfonctionner dans le code. Storybook exécute le composant réel dans un navigateur. |
| **Page de démo interne** | Une page HTML qui liste les composants. Non maintenable à l'échelle, pas de structure pour les variantes et états, pas d'intégration CI/CD, pas d'addon d'accessibilité. |
| **Pas de documentation interactive** | Rejeté explicitement : un système de design sans canvas de prévisualisation force les équipes consommatrices à intégrer les composants à l'aveugle. Le taux d'erreur d'intégration est directement lié à la qualité de la documentation interactive. |

---

## Conséquences

**Pour les développeurs :**
- Chaque nouveau composant ou variante requiert une story correspondante — c'est une
  règle de PR (`.claude/rules/development.md`)
- Le développement se fait dans Storybook d'abord, puis l'intégration en application
- Le hot reload de Storybook affiche immédiatement les changements de tokens CSS

**Pour les agents IA :**
- La structure des stories est lisible par machine : un agent peut lister toutes
  les variantes documentées d'un composant en lisant le fichier `.stories.js`
- Les args des stories (`variant`, `disabled`, `loading`) correspondent directement
  aux propriétés déclarées dans le Web Component (`static properties`) — cohérence garantie
- Un agent peut vérifier qu'une story existe pour chaque variante définie dans
  `component.json` — absence de story = composant non agent-ready (voir skill `ai-component-metadata`)

**Pour Chromatic (ADR-006) :**
- Storybook est l'entrée obligatoire de Chromatic — pas de story, pas de capture visuelle
- L'addon `@storybook/addon-a11y` (axe-core) audite chaque story en temps réel
  pendant le développement, avant le commit

**Pour les équipes consommatrices :**
- Storybook publié est la documentation officielle du système
- Les équipes peuvent voir et interagir avec chaque variante sans installer les dépendances

**Coût accepté :**
- Chaque composant nécessite un fichier `.stories.js` à maintenir — dette si les stories
  ne sont pas mises à jour en même temps que le composant
- Build Storybook ajouté au pipeline CI (quelques minutes supplémentaires)

---

## Incidents ou déclencheurs

Décision fondatrice. Storybook est le standard de facto pour les design systems
basés sur des composants (GitHub, Shopify, Atlassian, IBM l'utilisent tous).
L'intégration native avec Chromatic, axe-core et Web Components a confirmé le choix.
