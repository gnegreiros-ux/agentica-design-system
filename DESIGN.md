# DESIGN.md — Contrat portable du système de design

> Spécification portable, versionnée avec le code.
> Lisible par les humains et par les agents IA.
> Source : Google Labs, avril 2026 — licence Apache 2.0

---

## 1. Identité et intention du système

**Nom du système :** [NOM_DU_SYSTÈME]
**Organisation :** [NOM_ORGANISATION]
**Version :** 1.0.0
**Dernière mise à jour :** [DATE]
**Responsable :** [NOM_RESPONSABLE]

### Mission
Ce système de design encode les décisions d'interface partagées par toutes les équipes.
Il garantit la cohérence, l'accessibilité et la souveraineté numérique de l'organisation.

### Principes directeurs
1. **Le dernier mot est humain.** Les agents proposent, les humains approuvent.
2. **Si ce n'est pas un token, ce n'est pas une décision.** Toute valeur locale est une dette.
3. **La documentation instruit.** Elle doit être lisible par les machines, pas seulement par les humains.
4. **Souveraineté numérique.** Les outils, données et décisions restent sous contrôle organisationnel.

---

## 2. Architecture des tokens

### Trois niveaux — règle absolue

```
Tokens primitifs   →  Tokens sémantiques  →  Tokens de composant
(valeurs brutes)       (intention UX)          (contrats UI)
```

| Niveau | Fichier source | Exemple |
|--------|---------------|---------|
| Primitif | `tokens/primitives.json` | `blue-700`, `space-4` |
| Sémantique | `tokens/semantic.json` | `color.action.primary` |
| Composant | `tokens/component.json` | `button.critical.requiresConfirmation` |

### Règles de gouvernance des tokens
- Les tokens primitifs ne sont **jamais** utilisés directement dans les composants.
- Les tokens sémantiques encodent l'**intention**, pas la valeur.
- Les tokens de composant sont des **contrats institutionnels** — toute modification requiert une approbation.
- Aucune couleur ou espacement en dur dans le code. **Jamais.**

---

## 3. Contraintes d'accessibilité — Non négociables

| Règle | Standard | Valeur minimale |
|-------|----------|-----------------|
| Contraste texte | WCAG 2.1 AA | 4.5:1 |
| Contraste grandes interfaces | WCAG 2.1 AA | 3:1 |
| Focus visible | WCAG 2.1 AA | Obligatoire |
| Navigation clavier | WCAG 2.1 | Tous les composants |
| Attributs ARIA | WAI-ARIA 1.2 | Selon contexte |

> **Règle absolue :** Aucun composant ne peut être fusionné (merged) sans avoir passé l'audit d'accessibilité.

---

## 4. Conventions de nommage

### Tokens
- Format : `[catégorie].[rôle].[variante]`
- Exemples valides : `color.action.primary`, `space.control.padding`, `radius.button.default`
- Exemples invalides : `blue500`, `mainColor`, `btnPadding`

### Composants
- Format kebab-case : `ramq-button`, `ramq-input`, `ramq-modal`
- Préfixe organisationnel obligatoire.

### Fichiers
- Composants : `[nom-composant].md` dans `guidelines/components/`
- Fondations : `[nom-fondation].md` dans `guidelines/foundations/`

---

## 5. Règles d'escalade — Dernier mot humain

| Niveau d'autonomie | Action | Approbation requise |
|-------------------|--------|---------------------|
| Niveau 0 | Lecture, surveillance | Aucune |
| Niveau 1 | Rapport, suggestion | Aucune (lecture seule) |
| Niveau 2 | PR de correction automatique | Révision humaine obligatoire |
| Niveau 3 | Mise à jour documentation | Validation du responsable |
| Niveau 4 | Changement de token/contrat | Approbation Principal Designer |

> **Règle absolue :** Aucun agent n'a le droit de modifier un token de composant sans approbation humaine explicite.

---

## 6. Audit et auto-guérison

### Dérives détectées automatiquement
- Couleurs codées en dur (ex. `#3B82F6` au lieu d'un token)
- Tokens dépréciés encore utilisés
- Composants sans métadonnées complètes
- Instances détachées dans Figma
- Ratio de contraste insuffisant

### Processus de correction
1. Agent Observer détecte la dérive → rapport automatique
2. Agent Auditor évalue l'impact → score de conformité
3. Agent Guardian propose une PR de correction (niveau 2)
4. **Humain approuve ou rejette** → déploiement

---

## 7. Sources de référence

- Nielsen Norman Group — [Design Systems 101](https://nngroup.com/articles/design-systems-101/)
- The Design System Guide — Romina Kavcic — [thedesignsystem.guide](https://thedesignsystem.guide)
- Into Design Systems — [intodesignsystems.com](https://intodesignsystems.com)
- WCAG 2.1 — [w3.org/TR/WCAG21](https://www.w3.org/TR/WCAG21/)
- Style Dictionary — [styledictionary.com](https://styledictionary.com)
- Google Labs DESIGN.md spec — [github.com/google-labs-code/design.md](https://github.com/google-labs-code/design.md)
