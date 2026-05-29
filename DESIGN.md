# DESIGN.md — Contrat portable du système de design

> Spécification portable, versionnée avec le code.
> Lisible par les humains et par les agents IA.
> Source : Google Labs, avril 2026 — licence Apache 2.0
> **Type:** contract
> **Chemin logique:** DESIGN.md
> **Auteur:** Guilherme Negreiros
> **Lecture avant:** AGENTS.md
> **Relations:** AGENTS.md, tokens/semantic.json, tokens/component.json, guidelines/components/

> **Note pour la réutilisation :** Remplacer les valeurs "sda" et "GNegreiros.com" ci-dessous par le nom du système et de votre organisation.

---

## 1. Identité et intention du système

**Nom du système :** sda
**Organisation :** GNegreiros.com
**Version :** 1.0.0
**Dernière mise à jour :** 2026-05-29
**Responsable :** Guilherme Negreiros

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

## 3. Composants — règles générales

Chaque composant est un **contrat**. Il encode :
- Son intention (pourquoi il existe)
- Ses variantes autorisées
- Ses règles d'accessibilité non négociables
- Ses comportements (états, animations)
- Sa gouvernance (qui approuve les changements)

Les contrats de composants sont dans `guidelines/components/`.

---

## 4. Accessibilité — non négociable

| Règle | Standard |
|-------|----------|
| Contraste texte normal | WCAG AA — 4.5:1 minimum |
| Contraste texte large | WCAG AA — 3:1 minimum |
| Navigation clavier | 100% des interactions accessibles |
| Attributs ARIA | Obligatoires sur tous les composants interactifs |
| Tests automatisés | axe-core + Playwright avant chaque déploiement |

---

## 5. Token Change Request (TCR)

Tout changement de token suit ce flux :

1. Problème identifié et documenté
2. Demande formelle soumise (TCR)
3. Couche identifiée (primitif / sémantique / composant)
4. Évaluation de l'impact
5. Approbation selon le niveau de risque
6. Modification + compilation automatique
7. Tests et audits
8. Communication aux équipes

**Le dernier mot appartient toujours à l'équipe design system.**

---

## 6. Ce que les agents peuvent faire

| Action | Autorisé |
|--------|----------|
| Lire les contrats de composants | ✅ |
| Générer du code depuis les tokens | ✅ |
| Détecter les dérives | ✅ |
| Proposer des corrections | ✅ (avec approbation humaine) |
| Modifier un token sémantique | ❌ — TCR requis |
| Modifier un contrat de composant | ❌ — approbation Principal Designer |
| Déployer en production | ❌ — validation humaine obligatoire |
