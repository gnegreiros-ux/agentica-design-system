# ADR-011 — Choix de Tokens Studio pour la synchronisation Figma ↔ JSON

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-011-tokens-studio.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, tokens/component.json, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-003-style-dictionary.md, decisions/ADR-008-radix-colors.md

---

## Contexte

Le système de design opère sur deux surfaces simultanément :
- **Le code** — JSON tokens + Web Components compilés par Style Dictionary
- **Figma** — maquettes et composants utilisés par l'équipe design

Sans synchronisation entre ces deux surfaces, les équipes travaillent sur
deux sources de vérité divergentes. Le designer modifie un token dans Figma,
le développeur modifie le JSON — les deux systèmes dérivent silencieusement.

La contrainte de souveraineté numérique (ADR-004, DESIGN.md) complique le problème :
la source de vérité doit rester dans le repo git, pas dans Figma. Figma est
un outil de consultation et de design, pas de gouvernance des tokens.

La question posée était :

> **Comment maintenir Figma et le repo JSON synchronisés sans inverser
> la direction de la vérité — le JSON commande, Figma suit ?**

---

## Décision

Adoption de **Tokens Studio for Figma** (plugin Figma) comme pont de synchronisation
bidirectionnel entre les fichiers JSON du repo et les variables/styles Figma.

La direction de synchronisation est non négociable :

```
tokens/*.json  →  Tokens Studio  →  Variables Figma
     ↑ source de vérité               ↓ consommateur
```

Le plugin lit les fichiers JSON depuis le repo GitHub (via sync Settings → GitHub)
et importe les tokens dans Figma dans le même ordre que l'ADR-001 :
`primitives.json` → `semantic.json` → `component.json`.

**Ce que les designers NE doivent pas faire via Tokens Studio :**
modifier les tokens directement dans Figma et pousser vers le repo.
Tout changement de token suit le processus TCR (DESIGN.md) — Figma est en lecture.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Variables Figma natives uniquement (sans plugin)** | Figma Variables ne se synchronisent pas avec un repo git nativement. Chaque mise à jour de token nécessiterait une mise à jour manuelle dans Figma — source de dérive garantie. Acceptable pour de petites équipes, mais non scalable. |
| **Theo / Style Dictionary → export Figma** | Style Dictionary peut exporter vers des formats Figma (JSON spécifique). Mais l'import dans Figma reste manuel — pas de sync bidirectionnelle ni d'interface de gestion dans Figma. Tokens Studio offre l'UI de gestion que ces exports n'ont pas. |
| **Script de sync custom** | Maintenable à court terme pour un petit catalogue de tokens. Non maintenable à l'échelle (30 palettes × 12 steps × 3 couches = centaines de tokens). Les mises à jour de l'API Figma casseraient le script sans préavis. |
| **Zeroheight / Supernova** | Plateformes de documentation de design system avec sync Figma. Centrées sur la documentation, pas sur la synchronisation de tokens au niveau JSON. Ajoutent une dépendance externe payante pour une fonction que Tokens Studio couvre gratuitement. |
| **Pas de synchronisation (deux vérités)** | Rejeté explicitement. L'expérience des équipes sans synchronisation est documentée : après quelques sprints, les designers travaillent sur des tokens qui n'existent plus dans le code, et les développeurs ignorent des changements décidés dans Figma. |

---

## Conséquences

**Pour les designers :**
- Workflow d'import : Settings → Sync → GitHub → pointer vers `tokens/`
- Import dans l'ordre : `primitives.json` → `semantic.json` → `component.json`
- Les tokens disponibles dans Figma sont toujours les tokens définis dans le repo —
  pas de token local possible sans passer par le processus TCR
- Toute variable locale créée directement dans Figma = dette — à signaler à l'équipe

**Pour les agents IA :**
- Tokens Studio n'est pas dans la boucle des agents — les agents travaillent
  directement avec les fichiers JSON, jamais avec Figma
- Le plugin garantit que ce que les designers voient dans Figma correspond à ce
  que les agents lisent dans le JSON — cohérence de la source de vérité partagée

**Pour la gouvernance :**
- La direction JSON → Figma préserve la souveraineté numérique : les tokens
  ne peuvent pas être modifiés "en douce" via Figma et poussés vers le repo
- Toute modification de token reste tracée dans git, via TCR, avec approbation

**Pour Style Dictionary (ADR-003) :**
- Style Dictionary et Tokens Studio partagent la même source : `tokens/*.json`
- Les deux compilent depuis le même JSON — pas de format intermédiaire à maintenir
- Style Dictionary génère les sorties code (CSS, JS, Swift, Android)
- Tokens Studio gère la sortie design (Variables Figma)

**Coût accepté :**
- Tokens Studio est un plugin tiers (Figma Marketplace) — dépendance à sa maintenance
- La version gratuite couvre les besoins de base ; certaines fonctionnalités avancées
  (sync automatique, webhooks) nécessitent un abonnement
- Le plugin doit être réinstallé/reconfiguré si le repo est déplacé

---

## Incidents ou déclencheurs

Décision fondatrice. Motivée par l'observation systématique dans les équipes
sans synchronisation : les maquettes Figma utilisent des tokens nommés
différemment du code, créant deux langages parallèles au sein de la même équipe.
Un designer qui parle de `Bleu Principal` et un développeur qui parle de
`color.action.primary` décrivent la même valeur sans le savoir.
Tokens Studio aligne les deux langages sur le même JSON.
