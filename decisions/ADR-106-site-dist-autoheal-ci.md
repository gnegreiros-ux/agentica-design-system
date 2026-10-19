# ADR-106 — site/dist/ auto-rebuild post-merge sur main (issue #236)

> **Date:** 2026-10-19
> **Status:** 🔶 Proposed
> **Decision-makers:** Guilherme Negreiros — Design System Lead
> **Type:** governance
> **Logical path:** decisions/ADR-106-site-dist-autoheal-ci.md
> **Read before:** .github/workflows/site-freshness.yml, .github/workflows/site-dist-autoheal.yml
> **Relations:** ADR-105 (clone/core-source rename, sans rapport fonctionnel mais
> dernier ADR en date), site/build.js (AUDIT_SOURCES, auditSourcesDate()),
> issue #236

---

## Context

`site-freshness.yml` échoue en CI quand une PR touche un chemin listé dans
`AUDIT_SOURCES` (`site/build.js:7704` — `site`, `tokens`, `decisions`,
`guidelines`, `components`, `Brand`, `package.json`, `package-lock.json`)
sans que `site/dist/` ait été rebuild dans le même commit. `auditSourcesDate()`
est déjà déterministe — elle dérive la date d'audit via `git log -1
--format=%cI` sur `AUDIT_SOURCES` en excluant explicitement `site/dist/` — donc
ce n'est pas un bug de non-déterminisme (déjà corrigé pour le cas sitemap.xml,
PR #114 ; récidive partielle PR #156). Le problème réel, documenté par
l'issue #236, est un contrat non appliqué : rien n'oblige mécaniquement à
rebuilder `site/dist/` dès qu'un chemin d'`AUDIT_SOURCES` change — seule la
discipline humaine (ou la mémoire d'un ancien échec CI) le fait aujourd'hui.

## Decision

Solution hybride à deux étages :

1. **Sur les PR : aucun changement.** `site-freshness.yml` continue d'échouer
   avec un message clair si `site/dist/` est périmé. Cette porte reste la
   revue humaine de référence — elle ne committe jamais à la place de
   l'auteur de la PR.
2. **Après merge sur `main` : nouveau workflow `site-dist-autoheal.yml`**
   (déclencheur `push` sur `main` uniquement) qui rebuild `site/dist/` et,
   si une différence est détectée, la committe automatiquement sous un
   auteur bot dédié (`agentica-bot <bot@agentica.design>`), message
   `chore(site): auto-rebuild dist [auto-healed]`, citant l'issue #236 et
   cet ADR.

`agentica-bot <bot@agentica.design>` est préféré à une identité native de la
plateforme CI (ex. `github-actions[bot]`) pour une raison de souveraineté
numérique et de portabilité : un nom propriétaire d'une plateforme ne
survivrait pas à un changement de CI, alors que `agentica-bot` est un nom
entièrement contrôlé par le projet, dans son propre domaine
(`agentica.design`).

Le workflow est conçu pour ne jamais boucler : son seul chemin d'écriture
(`site/dist/`) est explicitement exclu du calcul de `auditSourcesDate()`
(`:(exclude)site/dist`), donc son propre commit ne peut jamais redéclencher
un nouveau cycle de rebuild différent. Un garde `[auto-healed]` dans le
message de commit évite même le rebuild redondant d'un éventuel second run.

## Rejected alternatives

| Alternative | Reason for rejection |
|---|---|
| Auto-commit directement sur les PR (même mécanisme, déclenché sur `pull_request`) | Une PR venant d'un fork n'a pas accès en écriture au dépôt cible — `GITHUB_TOKEN` y est en lecture seule par défaut, et lui donner l'écriture (`pull_request_target` ou équivalent) ouvrirait une voie d'exécution de code non revu avec un token d'écriture. Rejeté pour raison de sécurité, pas de confort. |
| Restreindre `AUDIT_SOURCES` pour réduire la fréquence des échecs | Viderait le check de son sens : `AUDIT_SOURCES` existe précisément parce que ces chemins (`decisions/`, `guidelines/`, etc.) influencent le contenu publié par `site/build.js`. Réduire la liste, ce serait accepter que `site/dist/` diverge silencieusement de ses propres sources plutôt que de corriger l'absence de contrat. |
| Ne rien faire (statu quo) | A déjà produit deux incidents documentés (PR #114, récidive PR #156) et l'issue #236 — la discipline humaine seule ne suffit pas. |

## Consequences

- Nouveau fichier `.github/workflows/site-dist-autoheal.yml`, scope minimal
  `permissions: contents: write`, jamais sur `pull_request`.
- `main` peut recevoir, en plus des commits humains, des commits automatiques
  signés `agentica-bot`, toujours limités à `site/dist/` et toujours
  immédiatement après un push qui en avait besoin.
- Risques résiduels à surveiller : échec silencieux du job (notification
  GitHub par défaut seulement, pas d'alerte supplémentaire configurée) ;
  conflit de push concurrent sur `main` (le job échoue visiblement, ne force
  jamais — `git push` sans `--force`).

## Incidents or triggers

Issue #236. Historique : PR #114 (fix `lastmod` dérivé de git log),
récidive PR #156 (même classe de problème sur un chemin non couvert à
l'époque).
