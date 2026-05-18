# Guidelines — Vue d'ensemble

> Point d'entrée du système de guidelines.
> Lire ce fichier avant d'accéder à n'importe quelle guideline.

---

## Structure

```
guidelines/
├── overview.md              ← ce fichier — toujours lire en premier
├── foundations/
│   ├── color.md             ← palette, rôles sémantiques, règles
│   ├── typography.md        ← familles, échelle, line-height, weight
│   └── spacing.md           ← unité de base, échelle, contextes d'usage
└── components/
    ├── overview.md          ← catalogue complet des composants
    └── button.md            ← contrat complet (Annexe I)
```

---

## Principes de lecture

### Fichiers always-read
Ces fichiers sont lus avant **chaque tâche** :
- `guidelines/overview.md` (ce fichier)
- `guidelines/components/overview.md`

### Fichiers on-demand
Lire uniquement quand la tâche le concerne :
- `guidelines/foundations/color.md` → si tu travailles sur les couleurs
- `guidelines/foundations/typography.md` → si tu travailles sur la typographie
- `guidelines/components/button.md` → si tu travailles sur le composant Button

---

## Hiérarchie de décision

```
DESIGN.md                       ← règles globales, non négociables
    ↓
foundations/                    ← décisions de fondation
    ↓
components/[composant].md       ← contrat spécifique au composant
    ↓
tokens/component.json           ← implémentation formelle du contrat
```

---

## Catalogue des composants disponibles

| Composant | Statut | Variantes | Contrat |
|-----------|--------|-----------|---------|
| Button | ✅ Agent-ready | primary, secondary, critical, ghost | `components/button.md` |
| Input | 🟡 Partiel | default, error, disabled | À compléter |
| Modal | 🔴 À documenter | default | À créer |
| Badge | 🟡 Partiel | success, warning, danger, info | À compléter |
| Card | 🟡 Partiel | default | À compléter |

**Légende :**
- ✅ Agent-ready : contrat complet, tokens définis, score ≥ 90%
- 🟡 Partiel : utilisable mais métadonnées incomplètes
- 🔴 À documenter : composant existe mais sans contrat formel

---

## Ce qui n'existe pas encore

Si tu ne trouves pas un composant ici, il n'est pas encore dans le système.
**Ne pas improviser.** Escalader au Design System Lead pour :
- Confirmer si le composant doit être créé
- Proposer une alternative existante
- Planifier l'ajout au système
