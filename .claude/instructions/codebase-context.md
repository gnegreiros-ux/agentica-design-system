# Instruction : codebase-context

> Méthodologie pour comprendre et naviguer dans ce dépôt.
> Ce fichier décrit COMMENT travailler dans ce système, pas seulement QUOI faire.

---

## Ordre de lecture obligatoire

Avant toute tâche, lire dans cet ordre :

```
1. AGENTS.md                               ← routeur, niveaux d'autonomie
2. DESIGN.md                               ← contrat global de la marque
3. .claude/rules/project-overview.md       ← contexte du projet
4. .claude/rules/tokens-system.md          ← règles des tokens
5. [fichier spécifique à la tâche]         ← selon ce que tu dois faire
```

---

## Résolution de conflits

Si deux règles semblent en conflit, appliquer dans cet ordre de priorité :

```
1. DESIGN.md (règles globales)
2. .claude/rules/tokens-system.md (règles des tokens)
3. .claude/rules/[règle spécifique]
4. guidelines/components/[composant].md (contrat)
```

En cas de doute : **escalader à un humain. Ne pas improviser.**

---

## Méthodologie d'audit

### Audit de tokens
1. Lire `.claude/skills/ai-component-metadata.md`
2. Scanner tous les fichiers de code pour les valeurs en dur
3. Scanner pour les tokens dépréciés
4. Générer un rapport structuré (liste par fichier, par type de dérive)
5. Proposer des corrections — ne pas appliquer sans approbation

### Audit de composant
1. Lire `guidelines/components/[composant].md`
2. Comparer avec l'implémentation dans le code
3. Vérifier les métadonnées dans `tokens/component.json`
4. Lancer axe-core si disponible
5. Produire un rapport de conformité

### Audit d'accessibilité
1. Vérifier les ratios de contraste (min 4.5:1 texte, 3:1 UI)
2. Vérifier la présence de `:focus-visible` sur tous les interactifs
3. Vérifier les attributs ARIA requis
4. Vérifier la navigation clavier
5. Escalader toute violation critique immédiatement

---

## Génération de code

Avant de générer un composant :
1. Lire le contrat dans `guidelines/components/[composant].md`
2. Vérifier que tous les tokens utilisés existent dans `tokens/component.json`
3. Générer le code avec les tokens (jamais de valeur en dur)
4. Inclure les attributs ARIA et le focus
5. Signaler tout cas non couvert par le système

---

## Mise à jour de documentation

Avant de modifier un fichier `.md` :
1. Vérifier que le changement reflète le système réel (pas une intention)
2. Mettre à jour la date de dernière modification
3. Ouvrir une PR `docs/` — ne pas pusher directement
4. Si le changement affecte un contrat de composant : approbation requise

---

## Économie de contexte

Pour éviter de saturer le contexte :
- Lire uniquement les fichiers pertinents à la tâche en cours
- Utiliser les skills pour les tâches répétables
- Sous-agents spécialisés pour les tâches complexes multi-domaines
- Ne pas charger tous les tokens — chercher par composant concerné
