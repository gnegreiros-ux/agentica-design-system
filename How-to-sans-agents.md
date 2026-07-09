# How-to — Continuité sans agents IA

> Que faire si l'accès aux agents IA disparaît (panne, coupure, décision organisationnelle,
> contrainte de souveraineté) — pour l'équipe qui **maintient** Agentica et pour les
> équipes produits qui le **consomment**.
> Dernier mot toujours humain — ce guide ne change pas ce principe, il change seulement
> qui EXÉCUTE les tâches habituellement faites par un agent.
> **Type:** instruction
> **Chemin logique:** How-to-sans-agents.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** How-to-devs.md, How-to-designers.md, .claude/rules/post-change-pipeline.md,
> .claude/rules/figma-library-governance.md, .claude/rules/tokens-system.md,
> scripts/continuity/

---

## 0. Principe — ce qui ne change PAS

- « Le dernier mot est toujours humain » reste vrai — seul l'**exécutant** change (agent → humain)
- Les tokens (`tokens/*.json`), `guidelines/*.md`, les contrats de composants restent la
  source de vérité
- Aucune règle de gouvernance (`tokens-system.md`, `git-workflow.md`, `code-style.md`) n'est
  suspendue le temps de l'indisponibilité des agents

---

## 0bis. Déclenchement du plan

| Question | Réponse |
|---|---|
| Qui déclare l'indisponibilité et active ce mode ? | Design System Lead / Principal Designer (ou suppléant désigné) |
| Qui communique aux équipes produits consommatrices ? | La même personne — message court renvoyant vers la [section 2](#2-équipes-produits-consommatrices-dagentica), jamais de silence |
| Comment sortir de ce mode ? | Dès le retour d'accès aux agents, reprise normale — ce document n'a pas besoin d'être « refermé » formellement, c'est un fallback, pas un nouvel état permanent |

---

## 1.0 Résilience déjà en place (rien à construire dans l'urgence)

Les tokens (`tokens/*.json`), les contrats (`guidelines/components/*.md`), les règles
(`.claude/rules/*.md`) et le code des composants (`components/agtc-*.js`) sont déjà des
**fichiers plats versionnés dans Git** — pas enfermés dans un outil ou une session IA.
Rien à exporter ni sauvegarder en urgence : la source de vérité a toujours été le dépôt,
jamais un historique de conversation avec un agent.

---

## 1. Équipe système de design (maintien d'Agentica)

### 1.1 Ce qui continue de tourner tel quel (scripts existants, pas besoin d'agent)

**Script :** `scripts/continuity/1-1-outils-existants.sh`

| Tâche | Commande |
|---|---|
| Compiler les tokens | `npm run tokens` |
| Rebuild du site | `node site/build.js` |
| Audit tokens | `node scripts/audit-tokens.js --ci` |
| Audit accessibilité | `npm run axe` |
| Tests visuels/E2E | `npx playwright test --project=chromium` |
| Tests Chromatic | `npm run chromatic` |

Ces commandes tournaient déjà sans qu'un agent soit strictement nécessaire — un agent les
lançait par commodité, un humain les lance à l'identique.

### 1.2 Quality gate manuel (remplace `.claude/skills/quality-gate.md`)

**Script :** `scripts/continuity/1-2-quality-gate-manuel.sh`

Les 8 pipelines du quality gate, traduits en étapes humaines :

1. **Cohérence tokens** → `node scripts/audit-tokens.js --ci` + grep manuels de
   `pipelines/tokens-audit.md` (valeurs hex/px en dur, références fantômes, grille 4px,
   échelle Minor Third)
2. **WCAG** → `npm run axe` + vérification manuelle du contraste (WebAIM Contrast Checker)
3. **Revue patterns UX (ADR-036)** → consulter soi-même les 5 sources de
   `ux-patterns-sources.md`, documenter la décision sur les 6 surfaces habituelles — sans
   agent qui « propose », le rédacteur humain propose ET décide dans le même geste
4. **Conformité ADR** → grep manuels listés dans `pipelines/adr-conformity.md` (un par ADR actif)
5. **Déclencheurs ADR manquants** → répondre soi-même aux 4 questions de `pipelines/adr-triggers.md`
6. **Documentation** → checklist de fichiers à jour de `pipelines/docs.md`
7. **Rebuild site** → `node site/build.js`
8. **Commit** → format Conventional Commits, jamais `--no-verify`

Les étapes 3 et 5 sont des étapes de **jugement humain pur** — aucun script ne peut les
remplacer, seulement rappeler qu'elles doivent être faites et bloquer tant qu'elles ne
sont pas confirmées.

### 1.3 Gouvernance Figma sans script Plugin API

**Script :** `scripts/continuity/1-3-figma-checklist.sh`

Checklist manuelle dérivée de `figma-library-governance.md` + `figma-components.md` :

- Toujours lire le composant code + stories AVANT de toucher Figma (inchangé)
- Lier chaque fill/stroke/spacing à une **Variable Figma existante manuellement**
  (panneau Inspect → Applied variables) — jamais de valeur en dur, même sans script
- Vérifier variantes ComponentSet = props du composant code, une par une (pas d'audit
  automatique de la totalité des variables — accepter un audit plus lent, par
  échantillonnage, en priorisant les composants récemment modifiés)
- Règle no-delete inchangée : déplacer vers une frame `_corbeille`, jamais `.remove()`
- Page de staging + rapport 10 points : déjà une checklist conçue pour un humain, aucune
  adaptation nécessaire
- Geler les chantiers Figma de grande ampleur (nouveau composant, refonte) le temps de
  l'indisponibilité ; se limiter aux corrections ponctuelles ciblées

### 1.4 ADR et suivi de projet — inchangés

**Script :** `scripts/continuity/1-4-adr-log-rappel.sh`

Rédaction d'ADR : déjà un exercice humain (écriture), non affecté par l'absence d'agent —
seulement un rappel qu'elle reste obligatoire à chaque session/commit significatif. Le
suivi de projet (statuts, historique, backlog) vit dans GitHub Projects (ADR-069), pas
dans un fichier du dépôt — rien à journaliser manuellement ici.

---

## 2. Équipes produits (consommatrices d'Agentica)

### 2.1 Ce qui ne change pas du tout

**Script :** `scripts/continuity/2-1-installation-produit.sh`

- Le flux d'installation documenté dans `site/dist/get-started.html` fonctionne sans
  aucun agent : cloner, importer `dist/tokens/css/all.css` + `dark.css`, monter les Web
  Components (`agtc-*`, Lit en peer dependency)
- `guidelines/components/*.md` = contrat lisible humain, utilisable tel quel
- `DESIGN.md` = référence de marque, utilisable tel quel

### 2.2 Ce qui demande une checklist de remplacement

**Script :** `scripts/continuity/2-2-checklist-produit.sh`

- Vérifier qu'un nouveau composant produit ne code pas de valeur en dur → lancer
  `node scripts/audit-tokens.js --src-dir <chemin-du-projet>` depuis un clone d'Agentica,
  ou revue visuelle manuelle contre `tokens-system.md`
- Choisir un pattern UX (formulaire, erreur, feedback) → consulter directement les 5
  sources de `ux-patterns-sources.md` (liens publics), sans l'étape de « présentation »
  normalement faite par l'agent — le produit documente lui-même son choix
- Accessibilité → WebAIM Contrast Checker + extension navigateur axe DevTools, en
  remplacement de `scripts/axe-audit.js`

### 2.3 Garde-fou anti-contournement

**Script :** `scripts/continuity/2-3-anti-contournement.sh`

- Risque documenté dans la littérature design systems (retour d'expérience Spotify/Encore) :
  sans agent pour faciliter l'usage du design system, une équipe pressée peut être tentée
  de contourner Agentica entièrement (coder une valeur en dur, ignorer un composant
  existant) plutôt que de suivre la checklist manuelle du §2.2
- Rappel explicite : l'absence d'agent **ne change pas** la règle `tokens-system.md` — une
  valeur en dur reste interdite, elle est juste vérifiée à la main plutôt que par script
- Si un délai est intenable, la voie correcte est l'escalade (§2.4), jamais le
  contournement silencieux

### 2.4 Point de contact en cas de doute

**Script :** `scripts/continuity/2-4-contact-escalade.sh`

En l'absence d'agent, toute question d'interprétation (« est-ce que ce token s'applique
ici ? ») remonte au Design System Lead / Principal Designer humain — jamais
d'improvisation silencieuse (cohérent avec `tokens-system.md`, une gouvernance déjà
écrite pour des humains).

---

## 3. Hors périmètre

`.claude/rules/contexts-utilisation.md` et `.claude/rules/layout-pattern.md` gouvernent
uniquement `site/build.js` (le site vitrine Agentica lui-même) — non pertinents pour un
consommateur externe, à ne pas dupliquer dans la section produits.

---

## Sources

Structure inspirée de deux références externes (2026) :
- Cyber Unit — continuité d'activité face aux pannes de LLM : inventaire des dépendances,
  points de défaillance unique, contrôle des données source, procédure d'activation.
- intoDesignSystems — design systems face aux agents IA : risque de dépendance
  progressive et de contournement, niveaux de confiance structurels par action (déjà
  le principe d'ADR-004 dans ce dépôt).
