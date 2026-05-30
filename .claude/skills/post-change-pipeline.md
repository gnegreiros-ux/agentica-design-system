# Skill : post-change-pipeline

> Pipeline obligatoire avant tout commit — analyse l'impact des changements et soumet un rapport d'approbation humaine.
> **Type:** skill
> **Chemin logique:** .claude/skills/post-change-pipeline.md
> **Lecture avant:** AGENTS.md, .claude/rules/git-workflow.md, .claude/rules/tokens-system.md
> **Relations:** log/kit-construction.md, site/build.js, tokens/, decisions/

---

## Déclenchement

Ce pipeline s'exécute **obligatoirement** après toute modification et **avant tout commit**.
Il ne peut pas être sauté, même pour un changement mineur.

---

## Étape 1 — Analyse d'impact (automatique)

Exécuter `git diff --name-only` et `git diff --cached --name-only` pour identifier les fichiers modifiés.

Appliquer la matrice d'impact :

| Fichiers modifiés | Mises à jour à évaluer |
|---|---|
| `tokens/primitives.json` | Site rebuild, log, ADR si nouveau token ou palette |
| `tokens/semantic.json` | Site rebuild, log, `tokens.css` généré |
| `tokens/component.json` | Site rebuild, log, **approbation Principal Designer requise** |
| `site/build.js` | Site rebuild uniquement |
| `site/dist/` | Log uniquement (dist est un output) |
| `guidelines/` ou `components/` | Site rebuild, log |
| `decisions/ADR-*.md` | Site rebuild (page ADR), log |
| `.claude/rules/` ou `.claude/skills/` | Log |
| `AGENTS.md`, `DESIGN.md`, `README.md` | Log |
| `log/kit-construction.md` | Rien (c'est lui-même la mise à jour) |

Règle absolue : **le log du kit est toujours proposé**, sauf si le seul fichier modifié est le log lui-même.

---

## Étape 2 — Rapport d'impact (présenter à l'humain)

Présenter un rapport structuré **avant tout commit** :

```
## Impact des changements — approbation requise

### Fichiers modifiés
- [liste des fichiers git diff]

### Mises à jour proposées
- [ ] Site rebuild (`node site/build.js`) — [raison]
- [ ] Log du kit (`log/kit-construction.md`) — [entrée proposée]
- [ ] ADR-XXX à créer — [titre proposé] — si décision architecturale
- [ ] Tokens CSS à regénérer — si tokens modifiés
- [ ] Autre : [description]

### Points d'attention
- [Toute modification de token de composant → rappel d'approbation]
- [Tout nouveau token → suggérer un ADR]
```

**Ne pas commiter avant réponse explicite de l'humain.**

---

## Étape 3 — Exécution (après approbation seulement)

Exécuter uniquement les tâches approuvées, dans cet ordre :

1. Regénérer les tokens CSS si `tokens/` modifiés
2. Rebuilder le site si approuvé (`node site/build.js`)
3. Mettre à jour `log/kit-construction.md` avec horodatage `YYYY-MM-DD`
4. Créer les ADRs approuvés
5. Stager et commiter tous les fichiers en un seul commit cohérent

---

## Règles d'escalade

- Modification de `tokens/component.json` → mentionner explicitement que l'approbation du Principal Designer est requise
- Nouveau token primitif ou sémantique → proposer un ADR
- Suppression d'un token → bloquer et demander audit d'impact complet

---

## Anti-patterns

```
❌ Commiter sans présenter le rapport d'impact
❌ Rebuilder le site sans l'approuver
❌ Mettre à jour le log après le commit plutôt qu'avant
❌ Proposer toutes les mises à jour même si non pertinentes (utiliser la matrice)
❌ Attendre que l'humain demande le log — toujours le proposer
```
