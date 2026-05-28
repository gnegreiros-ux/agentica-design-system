# ADR-016 — Journal de construction automatique du kit

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead
> **Type:** contract
> **Chemin logique:** decisions/ADR-016-journal-construction.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/git-workflow.md
> **Relations:** log/kit-construction.md, .claude/hooks/log-kit-construction.sh, .claude/settings.json, decisions/ADR-015-hook-rappel-adr.md, decisions/ADR-014-conventional-commits.md

---

## Contexte

Un système de design agentique accumule deux catégories de décisions distinctes :

1. **Les décisions de design** — quelles couleurs, quels espacements, quelles variantes.
   Ces décisions sont tracées dans `tokens/`, `guidelines/`, `components/`, et dans les ADR.

2. **Les décisions de construction du kit** — comment le système fonctionne en tant qu'outil :
   les règles pour les agents (`.claude/`), les hooks d'automatisation, les contrats
   de gouvernance (`decisions/`), les fichiers racines (`AGENTS.md`, `DESIGN.md`).

La seconde catégorie était invisible. Les commits git capturent le _quoi_, mais pas
la chronologie des actions — quand un hook a été ajouté, quand une règle a été modifiée,
dans quel ordre le kit a été assemblé. Pour un agent qui reprend le travail en milieu de
construction, cette absence de journal rend la reconstruction du contexte difficile.

La question posée était :

> **Comment rendre la construction du kit elle-même observable, sans dépendre
> de la mémoire de session ou de la lecture exhaustive de l'historique git ?**

---

## Décision

Mise en place d'un journal de construction automatique :

- **Fichier** : `log/kit-construction.md` — tableau chronologique horodaté
- **Script** : `.claude/hooks/log-kit-construction.sh` — s'exécute après chaque `Write` ou `Edit`
- **Déclenchement** : fichiers dans `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md`
- **Mode** : asynchrone (`async: true`) — ne bloque pas le flux de travail

Format d'une entrée :

```
| 2026-05-28 16:34 | Créé    | `decisions/ADR-015-hook-rappel-adr.md` |
| 2026-05-28 16:35 | Modifié | `.claude/settings.json` |
```

La distinction `Créé` / `Modifié` est inférée du tool appelé : `Write` = Créé, `Edit` = Modifié.

---

## Périmètre — ce qui est loggué et ce qui ne l'est pas

| Zone | Loggué | Raison |
|------|--------|--------|
| `.claude/` | ✅ | Configuration, règles, hooks — construction du kit |
| `decisions/` | ✅ | ADR — décisions architecturales du kit |
| `AGENTS.md`, `DESIGN.md` | ✅ | Contrats fondateurs du kit |
| `tokens/` | ❌ | Contenu du système de design — hors scope |
| `guidelines/` | ❌ | Contenu du système de design — hors scope |
| `components/` | ❌ | Contenu du système de design — hors scope |
| `log/` | ❌ | Le journal ne se logue pas lui-même |

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Git log comme journal** | `git log` liste les commits, pas les actions individuelles. Une session peut produire plusieurs dizaines d'éditions entre deux commits. Le journal capture la granularité intra-commit. |
| **Journal manuel** | Dépend de la discipline humaine ou de l'agent. Un hook est structurellement fiable — il s'exécute indépendamment de qui fait la modification. |
| **Log dans un fichier `.claude/` (non versionné)** | Un journal non versionné n'est pas partageable et disparaît si le dossier est recréé. `log/kit-construction.md` est commité avec le reste du kit. |
| **Hook bloquant (synchrone)** | L'écriture dans un fichier log ne doit pas ralentir le flux de travail. `async: true` garantit que Claude n'attend pas la fin du script. |
| **Entrées riches (motif du changement, auteur)** | Un hook ne peut pas inférer l'intention derrière une modification. Seuls les faits observables (fichier, timestamp, tool) sont consignés. Le _pourquoi_ appartient aux ADR et aux messages de commit. |

---

## Conséquences

**Pour les agents IA :**
- Un agent qui reprend une session peut lire `log/kit-construction.md` pour comprendre
  ce qui a été fait récemment, sans reconstituer l'historique git
- Le journal distingue la construction du kit (ce fichier) des modifications de contenu
  (tokens, guidelines) — deux registres séparés pour deux types d'activité distincts

**Pour les humains :**
- Observabilité immédiate : `cat log/kit-construction.md` donne une chronologie lisible
- Rétroactivité possible : les entrées antérieures au hook peuvent être ajoutées manuellement
  ou par un agent d'initialisation

**Relation avec ADR-015 :**
- ADR-015 (hook rappel ADR) surveille `tokens/`, `guidelines/`, `components/` — le contenu
- ADR-016 (ce journal) surveille `.claude/`, `decisions/`, `AGENTS.md`, `DESIGN.md` — le kit
- Les deux hooks coexistent sur le même event `PostToolUse Write|Edit`, sans interférence

**Coût accepté :**
- Le chemin absolu du projet est encodé dans le script — à adapter si le dépôt est déplacé
- Le journal grossit indéfiniment ; une rotation annuelle ou par version majeure est envisageable

---

## Incidents ou déclencheurs

Constat lors de l'assemblage du kit : après plusieurs sessions de travail,
il était difficile de répondre à « qu'est-ce qui a été mis en place aujourd'hui ? »
sans relire l'intégralité de l'historique git. Le journal automatique rend
cette question triviale.
