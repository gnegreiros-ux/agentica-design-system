# Rule : components/button

> Règles spécifiques au composant Button pour les agents.
> Ce fichier complète le contrat complet dans `guidelines/components/button.md`.
> **Type:** rule
> **Chemin logique:** .claude/rules/components/button.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, guidelines/components/button.md
> **Relations:** guidelines/components/button.md, tokens/component.json, .claude/rules/tokens-system.md

---

## Règles absolues

```
✅ Maximum 1 bouton primary par section ou formulaire
✅ Toujours un libellé explicite (jamais "OK", "Confirmer" seul)
✅ Le bouton critical DOIT avoir une confirmation avant exécution
✅ Toujours un :focus-visible visible
✅ Largeur préservée pendant les états async (loading)
❌ Jamais de bouton critical sans pattern de confirmation
❌ Jamais deux boutons primary côte à côte
❌ Jamais de couleur ou espacement en dur
❌ Jamais de variante inventée non définie dans component.json
```

---

## Variantes autorisées

| Variante | Token | Usage |
|----------|-------|-------|
| `primary` | `component.button.primary` | Action principale d'une section |
| `secondary` | `component.button.secondary` | Action alternative |
| `critical` | `component.button.critical` | Action irréversible — voir règles spéciales |
| `ghost` | `component.button.ghost` | Action tertiaire, faible emphase |

---

## Règles spéciales — variante critical

Si tu génères ou modifies un bouton `critical` :

1. Vérifier que `requiresConfirmation: true` est dans le token
2. Vérifier que le pattern de confirmation existe dans l'interface
3. Vérifier que le libellé décrit l'action (ex: "Supprimer définitivement le dossier")
4. Vérifier le contraste : minimum 4.5:1 sur fond blanc
5. **Escalader à un humain** si tu as un doute sur l'impact de l'action

---

## Anti-patterns à détecter

```
❌ <button style="background: red;">Supprimer</button>
   → Valeur en dur + pas de token + variante non reconnue

❌ <ds-button variant="critical">OK</ds-button>
   → Libellé non explicite pour une action critique

❌ Deux <ds-button variant="primary"> dans le même formulaire
   → Hiérarchie cassée

❌ <ds-button variant="danger">   (variante inexistante)
   → Escalader — demander la variante correcte
```

---

## Escalade obligatoire

Escalader à un humain si :
- La variante demandée n'existe pas dans `component.json`
- L'action du bouton critical n'est pas clairement irréversible ou non
- Le pattern de confirmation n'est pas défini dans le système
