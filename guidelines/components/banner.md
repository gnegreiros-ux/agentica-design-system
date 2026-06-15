# Composant : Banner — Contrat complet

> Version : 1.0.0
> Responsable : design-system-team
> Dernière révision : 2026-06-03
> Toute modification requiert approbation du Principal Designer.
> **Type:** contract
> **Chemin logique:** guidelines/components/banner.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** tokens/component.json, decisions/ADR-042-agtc-banner-implementation.md, guidelines/components/badge.md, DESIGN.md

---

## INTENTION

**Pourquoi ce composant existe :**
Afficher un **message inline contextuel** (callout / alerte) dans le flux de la page : information,
succès, avertissement ou erreur. Généralise le `contribution-banner` du site.

**Ce composant n'est pas :**
- Un *toast* (notification flottante temporaire) — composant distinct ultérieur
- Une *modale* / `alertdialog` (interrompt et capture le focus)
- Un `agtc-badge` (label compact de statut)

---

## VARIANTES

| Variante | Sémantique | Usage typique |
|----------|-----------|---------------|
| `neutral` | Neutre | Information générique |
| `brand` | Identité | Highlight produit, contribution |
| `info` | Information | Aide contextuelle (défaut) |
| `success` | Succès | Confirmation d'opération |
| `warning` | Attention | Conséquence à vérifier |
| `danger` | Erreur | Échec, action bloquée |

---

## PROPRIÉTÉS

| Attribut | Type | Défaut | Description |
|----------|------|--------|-------------|
| `variant` | String | `info` | Variante sémantique |
| `heading` | String | — | Titre optionnel |
| `icon` | String | (par variante) | Icône Lucide — override du défaut |
| `no-icon` | Boolean | `false` | Masque l'icône |
| `dismissible` | Boolean | `false` | Affiche un bouton fermer (émet `dismiss`) |
| `live` | String | `off` | `off` / `polite` (role=status) / `assertive` (role=alert) — **usage dynamique** |

Corps via le **slot** par défaut · actions via **`slot="actions"`**.

---

## TOKENS UTILISÉS

| Rôle | Token |
|------|-------|
| Fond (par variante) | `component.banner.<variant>.background` |
| Accent — bordure gauche + icône (par variante) | `component.banner.<variant>.accent` |
| Texte du titre | `component.banner.heading-text` |
| Texte du corps | `component.banner.body-text` |
| Bouton fermer / survol | `component.banner.close-color` / `close-hover` |
| Anneau de focus | `component.banner.border-focus` |
| Rayon / padding | `component.banner.radius` / `padding-x` / `padding-y` |

---

## ACCESSIBILITÉ — NON NÉGOCIABLE

| Règle | Valeur |
|-------|--------|
| Sens jamais par la couleur seule | Icône par variante **+** préfixe de sévérité masqué pour AT (« Erreur : »…) |
| Banner statique | **Aucune** région live (ne pas s'annoncer au chargement) |
| Banner dynamique | `live="polite"` (role=status) ou `live="assertive"` (role=alert) — **avec parcimonie** |
| Bouton fermer | `<button>` réel, `aria-label="Fermer"`, `:focus-visible` ; ne capture jamais le focus |
| Contraste | Texte gris.12/gris.11 sur fond subtil ≥ 4.5:1 |

---

## COMPORTEMENTS

- **Inline** : le banner reste dans le flux, ne flotte pas, ne capture pas le focus.
- **Dismiss** : clic → émet `dismiss` (annulable via `preventDefault`) puis se masque.
- **Persistance** : ne pas auto-masquer un `danger` / `warning` (N9).

---

## ANTI-PATTERNS

| À éviter | Raison |
|----------|--------|
| `role="alert"` sur un banner statique de page | S'annonce au chargement — perturbant |
| Couleur seule pour la sévérité | Inaccessible (daltonisme, AT) |
| Auto-dismiss d'une erreur | L'utilisateur rate le message |
| Banner pour une notification flottante | Utiliser un *toast* (composant distinct) |
| Bouton fermer sans `aria-label` ni focus | Inutilisable au clavier / AT |

---

## Patterns UX de référence

> Patterns approuvés via le workflow `ux-pattern-review` (ADR-036/042). Décision : **N1–N9 tous approuvés**.

| Pattern | Source | Appliqué | Justification |
|---------|--------|----------|---------------|
| Variantes sémantiques (6) | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Alignées sur `agtc-badge` |
| Sens jamais par la couleur seule (icône + texte AT) | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Préfixe de sévérité masqué |
| Icône par variante | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Overridable, `no-icon` possible |
| Statique par défaut (pas de live region) | [MDN — status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role) | ✅ | `live="off"` par défaut |
| `role="alert"` assertif avec parcimonie | [A11Y Collective](https://www.a11y-collective.com/blog/aria-alert/) | ✅ | Via `live="assertive"` |
| Bouton fermer accessible, sans piège de focus | [MDN — alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role) | ✅ | `dismissible` + événement `dismiss` |
| Titre + corps + zone d'action | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | `heading` + slot + `slot="actions"` |
| Bordure d'accent gauche + fond subtil | [Dashboard](https://dashboarddesignpatterns.github.io/patterns.html) | ✅ | Reprend le style du `contribution-banner` |
| Pas d'auto-dismiss du critique | [NN/g](https://www.nngroup.com/articles/indicators-validations-notifications/) | ✅ | Guidance documentée (danger/warning persistants) |

---

## IMPLÉMENTATION

### Composant (Lit)
```html
<agtc-banner variant="warning" heading="Attention">
  Cette action affectera 3 fichiers liés.
</agtc-banner>

<agtc-banner variant="brand" heading="Contribuer" dismissible>
  Ce système est ouvert aux contributions.
  <span slot="actions"><a href="…">Voir sur GitHub →</a></span>
</agtc-banner>

<!-- Notification dynamique (insérée par JS) -->
<agtc-banner variant="danger" live="assertive" heading="Erreur">
  Impossible de contacter le serveur.
</agtc-banner>
```

### Classe (HTML statique du site)
```html
<div class="agtc-banner info">
  <span class="banner-icon">…</span>
  <div class="banner-content"><strong>Titre</strong><span>Corps du message.</span></div>
</div>
```

---

## GOUVERNANCE

| Action | Approbation requise |
|--------|-------------------|
| Ajout d'une variante | Principal Designer + Tech Lead |
| Modification d'un token | Principal Designer |
| Ajout d'un comportement (auto-dismiss, toast) | Principal Designer + nouvel ADR |
| Correction bug accessibilité | Review design system team |
