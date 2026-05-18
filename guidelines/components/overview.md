# Composants — Catalogue

> Toujours lire ce fichier avant de travailler avec un composant.
> Si un composant n'est pas listé ici, il n'existe pas dans le système — ne pas improviser.

---

## Catalogue complet

| Composant | Tag Web | Statut | Contrat | Storybook |
|-----------|---------|--------|---------|-----------|
| **Button** | `<ds-button>` | ✅ Agent-ready | [button.md](./button.md) | ✅ |
| **Input** | `<ds-input>` | 🟡 Partiel | À compléter | ✅ |
| **Modal** | `<ds-modal>` | 🔴 À documenter | À créer | 🟡 |
| **Badge** | `<ds-badge>` | 🟡 Partiel | À compléter | ✅ |
| **Card** | `<ds-card>` | 🟡 Partiel | À compléter | ✅ |

**Légende :**
- ✅ Agent-ready : contrat complet, tokens définis, score ≥ 90%
- 🟡 Partiel : utilisable mais métadonnées incomplètes
- 🔴 À documenter : composant existe dans le code mais sans contrat formel

---

## Noms alternatifs à connaître

| Terme utilisé | Composant correct |
|---------------|------------------|
| CTA, call to action | Button (variant: primary) |
| Lien d'action | Button (variant: ghost) ou lien natif |
| Bouton danger / destructif | Button (variant: critical) |
| Pastille, chip de statut | Badge |
| Panneau, bloc | Card |
| Fenêtre modale, popup, dialogue | Modal |
| Champ de saisie, champ texte | Input |

---

## Règles de composition

### Hiérarchie par section
```
✅ 1 bouton primary maximum par section ou formulaire
✅ 1 bouton critical maximum par flux
❌ Jamais deux boutons primary côte à côte
```

### Combinaisons autorisées
```
primary + secondary         ✅ Standard
primary + ghost             ✅ Avec action tertiaire
secondary + secondary       ✅ Deux alternatives
critical + secondary        ✅ Confirmation + annulation
```

### Combinaisons interdites
```
primary + primary           ❌ Hiérarchie cassée
critical + primary          ❌ Double CTA fort
critical sans confirmation  ❌ Non conforme au contrat
```

---

## Ajouter un composant au système

Si tu as besoin d'un composant qui n'existe pas :
1. Ne pas improviser une solution locale
2. Signaler au Design System Lead
3. Proposer : nom, intention, variantes, règles d'usage
4. Attendre validation avant implémentation

Un composant local = dette technique = dérive future.
