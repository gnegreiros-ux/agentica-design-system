# Skill : ai-component-metadata

> Capacité réutilisable : auditer et enrichir les métadonnées des composants.
> Utiliser ce skill pour vérifier qu'un composant est "agent-ready".
> **Type:** skill
> **Chemin logique:** .claude/skills/ai-component-metadata.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** guidelines/components/, tokens/component.json, .claude/skills/codebase-index.md

---

## Objectif

S'assurer que chaque composant possède les métadonnées structurées nécessaires
pour qu'un agent puisse l'analyser, le valider et l'utiliser correctement.

---

## Métadonnées requises — checklist

Pour chaque composant, vérifier la présence de :

```
✅ intent          — Pourquoi ce composant existe
✅ variants        — Liste des variantes autorisées
✅ rules           — Règles d'usage (quand utiliser, quand ne pas utiliser)
✅ accessibility   — Exigences WCAG (contraste, focus, ARIA)
✅ behavior        — États, animations, interactions spéciales
✅ dependencies    — Tokens et composants dont il dépend
✅ antiPatterns    — Ce qu'il ne faut jamais faire avec ce composant
✅ owner           — Qui est responsable
✅ approvalLevel   — Quel niveau d'approbation pour le modifier
✅ version         — Version courante du contrat
```

---

## Processus d'audit des métadonnées

### Étape 1 — Inventaire
```
Pour chaque composant dans guidelines/components/ :
  - Lire le fichier .md
  - Lire le token correspondant dans tokens/component.json
  - Comparer les deux pour détecter les écarts
```

### Étape 2 — Scoring
Calculer un score de complétude :
- 10 champs requis × 10 points = 100 points possible
- Score < 70 : composant non agent-ready → signaler
- Score 70–89 : composant partiellement agent-ready → amélioration recommandée
- Score ≥ 90 : composant agent-ready ✅

### Étape 3 — Rapport
Produire un rapport structuré :
```markdown
## Rapport de métadonnées — [DATE]

| Composant | Score | Manquant | Priorité |
|-----------|-------|----------|----------|
| button    | 100%  | —        | ✅ |
| input     | 70%   | antiPatterns, approvalLevel | 🟡 |
| modal     | 40%   | rules, accessibility, behavior, dependencies | 🔴 |

### Recommandations
[Liste des actions à faire, par ordre de priorité]
```

### Étape 4 — Ne pas modifier sans approbation
Ce skill génère uniquement des rapports et des suggestions.
**Ne jamais modifier les fichiers directement.**

---

## Format de métadonnées enrichies (exemple JSON)

```json
{
  "component": {
    "button": {
      "$metadata": {
        "intent": "Déclencher une action dans l'interface",
        "variants": ["primary", "secondary", "critical", "ghost"],
        "rules": [
          "Maximum 1 bouton primary par section",
          "Le bouton critical requiert une confirmation"
        ],
        "accessibility": {
          "minimumContrast": "4.5:1",
          "requiresFocusVisible": true,
          "ariaAttributes": ["aria-label si pas de texte visible", "aria-disabled"]
        },
        "antiPatterns": [
          "Deux boutons primary côte à côte",
          "Libellé 'OK' ou 'Confirmer' seul pour un bouton critical"
        ],
        "owner": "design-system-team",
        "approvalLevel": "principal-designer",
        "version": "2.1.0"
      }
    }
  }
}
```
