# Pipeline : wcag

> Checklist de conformité WCAG 2.2 AA à valider après toute modification d'interface.
> **Statut :** ✅ Actif
> **Déclencheur :** tout changement dans `site/build.js`, `components/`, `tokens/` (couleurs)

---

## Déclencheurs

| Fichier modifié | Checks requis |
|----------------|--------------|
| `tokens/primitives.json` (couleurs) | Contraste — vérification complète |
| `tokens/semantic.json` (couleurs) | Contraste — vérification complète |
| `site/build.js` (CSS) | Focus visible, touch targets |
| `components/*.js` | ARIA, focus, rôles |
| Nouveau composant interactif | Checklist complète |

---

## Checks WCAG 2.2

### 1.4.3 — Contraste texte normal ≥ 4.5:1 (AA)

Vérifier les paires token texte / fond :

| Contexte | Paire de tokens | Minimum |
|----------|----------------|---------|
| Corps de texte | `text-primary` / `background-page` | 4.5:1 |
| Texte secondaire | `text-secondary` / `background-page` | 4.5:1 |
| Texte sur action | `text-on-action` / `action-primary` | 4.5:1 |
| Texte disabled | `text-disabled` / `background-page` | 3:1 (large) |
| Code inline | `text-primary` / `background-subtle` | 4.5:1 |

Outil de référence : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 1.4.11 — Contraste des composants non-textuels ≥ 3:1

- Bordures de champs de saisie vs fond
- Icônes significatives vs fond
- Indicateurs d'état (badges, chips)

### 1.4.12 — Espacement du texte (AA)

Le système doit supporter sans perte d'information :
- Line-height ≥ 1.5× la taille de police
- Espacement des paragraphes ≥ 2× la taille de police
- Letter-spacing ≥ 0.12× la taille
- Word-spacing ≥ 0.16× la taille

Notre token `reading` (1.6) respecte ce critère.

### 2.4.7 — Focus visible (AA)

Chaque élément interactif doit avoir un `:focus-visible` explicite :
```css
/* obligatoire */
:focus-visible {
  outline: 2px solid var(--agtc-semantic-color-border-focus);
  outline-offset: 2px;
}
```
Vérifier que `outline: none` ou `outline: 0` n'est jamais utilisé sans alternative visible.

### 2.4.11 — Focus non masqué (AA, nouveau en WCAG 2.2)

Le focus ne doit pas être entièrement masqué par d'autres contenus (sticky headers, modales).
Notre header fixe de 60px doit laisser le focus visible sur les éléments en dessous.

### 2.5.3 — Étiquette dans le nom accessible

Tout bouton dont le `aria-label` contient du texte visible doit inclure ce texte.

```html
<!-- ✅ -->
<button aria-label="Supprimer le dossier">Supprimer</button>

<!-- ❌ -->
<button aria-label="Effacer">Supprimer</button>
```

### 2.5.8 — Taille des cibles tactiles ≥ 24×24px (AA, nouveau en WCAG 2.2)

Tout élément interactif doit avoir une zone cliquable d'au moins 24×24px.
Les boutons du système (`ds-button`) doivent respecter cette règle via leur padding.

### Mouvement et animation

```css
/* Obligatoire pour toute animation */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## Rapport partiel (exemple)

```
### 2. WCAG 2.2
- [x] text-primary / background-page : 14.7:1 ✓
- [x] text-secondary / background-page : 5.2:1 ✓
- [x] text-on-action / action-primary (#12A594) : vérifier → [résultat]
- [x] Focus visible sur ds-button (toutes variantes)
- [x] Touch targets boutons ≥ 24×24px
- [ ] ⚠️ Vérifier focus sur nouveau composant [nom]
```
