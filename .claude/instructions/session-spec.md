# Instruction : session-spec

> Spec condensée rechargée à chaque session IA — source de vérité rapide.
> **Type:** instruction
> **Chemin logique:** .claude/instructions/session-spec.md
> **Lecture avant:** AGENTS.md, DESIGN.md
> **Relations:** tokens/semantic.json, tokens/component.json, guidelines/components/, decisions/

---

## Identité du système

| Champ | Valeur |
|-------|--------|
| Nom | Agentic Design System |
| Version | 1.0.0 |
| Gouvernance | Le dernier mot est toujours humain |
| Stack | Lit (Web Components), Style Dictionary, axe-core, Storybook |

---

## Inventaire des composants

| Composant | Variantes | Contrat | Tokens | Statut |
|-----------|-----------|---------|--------|--------|
| `button` | primary, secondary, ghost, critical | `guidelines/components/button.md` | `component.json#button` | ✅ agent-ready |

> Mettre à jour ce tableau à chaque ajout de composant.

---

## Tokens sémantiques — référence rapide

| Intention | Token | Niveau |
|-----------|-------|--------|
| Action principale | `color.action.primary` | sémantique |
| Action hover | `color.action.primary-hover` | sémantique |
| Danger / destructeur | `color.feedback.danger` | sémantique |
| Texte sur action | `color.text.on-action` | sémantique |
| Padding horizontal contrôle | `space.control.padding-x` | sémantique |
| Padding vertical contrôle | `space.control.padding-y` | sémantique |
| Rayon contrôle | `radius.control` | sémantique |
| Focus border | `color.border.focus` | sémantique |

> Source de vérité complète : `tokens/semantic.json`

---

## Règles critiques — mémo agent

```
❌ Jamais de valeur en dur (hex, px, rem brut)
❌ Jamais de token primitif dans un composant
❌ Jamais de variante inventée (hors component.json)
❌ Jamais de merge sans approbation humaine
✅ Toujours via var(--ds-[token])
✅ Toujours :focus-visible visible
✅ Toujours aria-* appropriés
✅ Escalader si doute sur impact d'une action
```

---

## Variantes autorisées par composant

### button
`primary` | `secondary` | `ghost` | `critical`

> ⚠️ `critical` requiert `requiresConfirmation: true` dans le token + pattern de confirmation dans l'interface.

---

## Gouvernance — niveaux d'approbation

| Action | Qui | Approbation |
|--------|-----|-------------|
| Modifier token primitif | Dev / agent | Principal Designer |
| Ajouter token sémantique | Dev / agent (PR) | Design System Lead |
| Modifier token composant | Humain seulement | Principal Designer |
| Supprimer token | Humain seulement | Principal Designer + audit d'impact |
| Ajouter composant | Dev / agent (PR) | Design System Lead + Principal Designer |

---

## Décisions architecturales actives

| ADR | Décision | Statut |
|-----|----------|--------|
| ADR-001 | Architecture 3 niveaux de tokens (primitif → sémantique → composant) | ✅ Actif |
| ADR-002 | Choix de Lit pour les Web Components | ✅ Actif |
| ADR-003 | Choix de Style Dictionary pour la compilation des tokens | ✅ Actif |
| ADR-004 | Gouvernance humaine : le dernier mot est toujours humain | ✅ Actif |
| ADR-005 | Remplacement de la variante `danger` par `critical` | ✅ Actif |
| ADR-006 | Choix de Chromatic pour les tests de régression visuelle | ✅ Actif |

> Dossier complet : `decisions/`

---

## Tokens dépréciés

Aucun token déprécié à ce jour.

> Tenir ce tableau à jour à chaque TCR. Voir `tokens/deprecated.md` quand le fichier existera.

---

## Dernière mise à jour

Date : 2026-05-28
Modifié par : Guilherme Negreiros
Raison : Création initiale du fichier — référencé dans AGENTS.md et How-to-devs.md sans exister.
