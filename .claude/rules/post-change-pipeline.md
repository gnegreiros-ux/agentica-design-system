# Rule : post-change-pipeline

> Pipeline obligatoire avant tout commit — non négociable pour tout agent ou session.
> **Type:** rule
> **Chemin logique:** .claude/rules/post-change-pipeline.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/project-overview.md
> **Relations:** .claude/skills/post-change-pipeline.md, .claude/rules/git-workflow.md, log/kit-construction.md

---

## Règle absolue

> **Aucun commit sans rapport d'impact approuvé par l'humain.**

Ce pipeline s'applique à **toute modification**, quelle que soit sa taille.
Il ne peut pas être sauté, raccourci ou différé.

---

## Ce que l'agent doit faire après chaque modification

1. **Analyser** les fichiers modifiés (`git diff --name-only`)
2. **Appliquer la matrice d'impact** (voir `.claude/skills/post-change-pipeline.md`)
3. **Présenter le rapport** avec les mises à jour proposées (format checklist)
4. **Attendre l'approbation** explicite de l'humain
5. **Exécuter** uniquement les tâches approuvées
6. **Commiter** en un seul commit cohérent

---

## Format du rapport

```
## Impact des changements — approbation requise

### Fichiers modifiés
- [liste]

### Mises à jour proposées
- [ ] Site rebuild
- [ ] Log du kit — [entrée proposée]
- [ ] ADR — [si applicable]

### Points d'attention
- [escalades, approbations spéciales]
```

---

## Violations de cette règle

Commiter sans rapport approuvé est une violation grave du contrat de gouvernance.
Le dernier mot est toujours humain — ce pipeline en est la garantie opérationnelle.
