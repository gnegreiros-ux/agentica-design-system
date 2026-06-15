# ADR-060 — Implémentation de `agtc-top-nav`

> **Date :** 2026-06-15
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** component
> **Chemin logique:** decisions/ADR-060-agtc-top-nav-implementation.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-047-no-visited-nav-rule.md
> **Relations:** tokens/component.json, components/agtc-top-nav.js, guidelines/components/top-nav.md, decisions/ADR-056-agtc-tabs-implementation.md

---

## Contexte

Le site Agentica est le laboratoire vivant du design system — chaque fonctionnalité du site est
l'occasion de construire et valider un composant réel avant de le formaliser.

La navigation principale du site (`site/build.js`) était implémentée en HTML statique généré
par JavaScript, avec des styles CSS définis directement en termes de tokens sémantiques (sans
passer par un niveau composant). Plusieurs problèmes accumulés au fil des sessions :

- `:visited` persistait dans la couleur navigateur par défaut (signalé 3 fois — ADR-047, 2026-06-06, 2026-06-15)
- `:active` n'était pas défini → couleur navigateur par défaut
- `.active` utilisait un fond rempli persistant → ressemblait à un bouton togglé
- `:focus-visible` absent → navigation clavier non conforme WCAG 2.4.7
- `aria-current="page"` absent → lecteurs d'écran aveugles à la page courante (WCAG 4.1.2)
- Aucun token composant → les décisions de design étaient directement dans le CSS du site

La décision de formaliser `agtc-top-nav` comme composant du DS découle du principe fondateur :
le site consomme le design system, pas l'inverse.

---

## Décision

Créer le composant `agtc-top-nav` (Web Component Lit) qui encapsule la navigation principale
horizontale avec un pattern visuel tabs full-height, et le formaliser dans le design system avant
de l'appliquer au site.

### Décisions techniques clés

**`<nav>` et non `role="tablist"`**

Malgré l'apparence visuelle similaire aux tabs, `agtc-top-nav` utilise des liens inter-pages.
Le pattern ARIA correct est `<nav aria-label="...">` + `<a aria-current="page">`, pas
`role="tablist"` qui impliquerait des panneaux de contenu in-page et une navigation aux flèches.

**Pattern tabs full-height**

Chaque lien occupe toute la hauteur du header (64px) via `align-self:stretch`. L'état actif est
indiqué par `border-bottom:2px solid action-primary` positionné au bas du header — pas par un fond
rempli (qui imiterait un bouton togglé).

**Bouton CTA séparé**

Le lien "Démarrer" (`cta:true`) sort du pattern tab : `height:auto; align-self:center;
border-radius:control; margin-left:8px`. C'est une action d'adoption, visuellement un bouton.

**18 tokens composant**

Toutes les décisions visuelles sont capturées dans `tokens/component.json` sous `top-nav.*` :
11 tokens pour les tabs, 7 tokens pour le CTA. Le CSS du composant et du site ne référencent
que `--agtc-component-top-nav-*`.

---

## Patterns UX de référence appliqués

| Pattern | Source | Décision |
|---------|--------|----------|
| Landmark `<nav aria-label>` | W3C WAI APG | `nav-label` obligatoire, prop exposée |
| `aria-current="page"` | WCAG 2.4.4 / 4.1.2 | Calculé automatiquement depuis `current` (pathname) |
| Indicateur border-bottom | NN/g — nav horizontale | 2px en bas du tab pleine hauteur |
| Pas de `role="tablist"` | W3C APG Tabs Pattern | Nav inter-pages ≠ tabs in-page |
| CTA distinct (bouton pill) | IxDF — clear primary action | `cta:true` → border-radius + fond rempli |
| `:visited` neutralisé | ADR-047 | Dans shadow DOM via `a:visited { color: var(…) }` |
| Mobile hamburger | NN/g — Mobile nav | Géré par le site (hors composant v1.0) |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Garder le HTML statique** | Pas de réutilisabilité, décisions de design éparpillées dans le CSS du site |
| **Utiliser `agtc-tabs` avec `href`** | `agtc-tabs` a `role="tablist"` — sémantique ARIA incorrecte pour une nav inter-pages |
| **Fond rempli pour le lien actif** | Ressemble à un bouton togglé (pill) — NN/g recommande l'indicateur de ligne pour les navs horizontales |
| **Navigation aux flèches** | Réservée aux `tablist` ARIA — trompeuse pour des liens |
| **Intégrer le bilinguisme dans le composant** | Le composant est language-agnostic — la langue est gérée côté consommateur (site) |

---

## Conséquences

**Pour le site :** La CSS du site référence désormais `--agtc-component-top-nav-*` au lieu de
tokens sémantiques directs. Le composant Lit peut être utilisé pour remplacer le HTML généré
en phase 2 d'intégration.

**Pour le design system :** 18 nouveaux tokens composant dans `tokens/component.json`. Build :
792 tokens définis (+18), 0 fantôme.

**Pour les agents :** Toute modification visuelle de la top-nav passe par `tokens/component.json`
(et un TCR). Le composant est le contrat — pas le CSS du site.

---

## Incidents ou déclencheurs

Navigation corrigée 6 fois en une journée (2026-06-15) avant la décision de formaliser
le composant : `:visited` Safari (×3), `:active` absent, `.active` bouton-like, `:focus-visible`
absent, `aria-current` absent. La récurrence des corrections a déclenché la formalisation.
