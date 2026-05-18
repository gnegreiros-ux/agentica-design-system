# Rule : tokens-system

> Règles absolues pour la gestion des tokens dans ce système.
> Ces règles s'appliquent à tout agent et à toute équipe.

---

## Les trois niveaux — règle non négociable

```
Tokens primitifs   →   Tokens sémantiques   →   Tokens de composant
(valeurs brutes)        (intention UX)            (contrats institutionnels)
```

### Niveau 1 — Primitifs (`tokens/primitives.json`)
- Valeurs physiques : couleurs, espacements, rayons, tailles de police.
- **Très stables.** On les change rarement.
- **Jamais utilisés directement dans les composants.** Toujours via un token sémantique.

### Niveau 2 — Sémantiques (`tokens/semantic.json`)
- Traduisent les primitives en langage métier.
- Exemple : `color.action.primary` = `primitive.color.blue.700`
- **Ce que les agents doivent utiliser** pour comprendre l'intention.
- Nommés pour exprimer la **fonction**, pas la valeur.

### Niveau 3 — Composant (`tokens/component.json`)
- Décisions spécifiques à chaque composant.
- Portent les règles comportementales (ex: `requiresConfirmation: true`).
- **Contrats institutionnels** — toute modification requiert une approbation.

---

## Règles absolues

```
❌ INTERDIT : color: #3B82F6                 → utiliser var(--ds-color-action-primary)
❌ INTERDIT : padding: 16px                  → utiliser var(--ds-space-control-padding-x)
❌ INTERDIT : token primitif dans composant  → passer par le token sémantique
❌ INTERDIT : modifier un token de composant sans approbation humaine
```

---

## Règle de nommage

Format : `[catégorie].[rôle].[variante]`

| ✅ Valide | ❌ Invalide |
|----------|------------|
| `color.action.primary` | `blue500` |
| `space.control.padding` | `mainPadding` |
| `radius.button.default` | `btnRadius` |
| `color.feedback.danger` | `red` |

---

## Règle de gouvernance des tokens

| Type de changement | Qui peut le faire | Approbation |
|-------------------|-------------------|-------------|
| Valeur d'un token primitif | Dev ou agent | Principal Designer |
| Ajout d'un token sémantique | Dev ou agent (PR) | Design System Lead |
| Modification d'un token de composant | Humain seulement | Principal Designer |
| Suppression d'un token | Humain seulement | Principal Designer + audit d'impact |

---

## Ce que les agents voient — et ce qu'ils ratent

Un agent IA comprend `color.feedback.danger` comme **une intention**.
Il ne comprend pas `red-700` comme **une intention** — c'est juste une valeur.

> « Les agents comprennent la fonction, pas seulement la valeur. »
> — Jan Six, GitHub, IDS 2026
