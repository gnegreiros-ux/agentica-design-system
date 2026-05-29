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
| Sigle | sda |
| Auteur | Guilherme Negreiros |
| Version | 1.0.0 |
| Préfixe CSS | `--sda-` |
| Gouvernance | Le dernier mot est toujours humain |
| Stack | Lit (Web Components), Style Dictionary, axe-core, Storybook, Lucide Icons |

---

## Inventaire des composants

| Composant | Variantes | Contrat | Tokens | Statut |
|-----------|-----------|---------|--------|--------|
| `ds-button` | primary, secondary, ghost, critical | `guidelines/components/button.md` | `component.json#button` | ✅ agent-ready |
| `ds-icon` | size: inline, control, nav | `guidelines/components/icon.md` | `semantic.json#icon` | ✅ agent-ready |

> Mettre à jour ce tableau à chaque ajout de composant.

---

## Tokens sémantiques — référence rapide

| Intention | Token | Niveau |
|-----------|-------|--------|
| Action principale | `color.action.primary` | sémantique |
| Action hover | `color.action.primary-hover` | sémantique |
| Danger / destructeur | `color.feedback.danger` | sémantique |
| Texte sur action | `color.text.on-action` | sémantique |
| Texte principal | `color.text.primary` | sémantique |
| Fond de page | `color.background.page` | sémantique |
| Focus border | `color.border.focus` | sémantique |
| Padding horizontal contrôle | `space.control.padding-x` | sémantique |
| Padding vertical contrôle | `space.control.padding-y` | sémantique |
| Gap interne contrôle | `space.control.gap` | sémantique |
| Espacement entre sections | `space.layout.section` | sémantique |
| Espacement entre composants | `space.layout.component` | sémantique |
| Rayon contrôle | `radius.control` | sémantique |
| Police principale | `typography.fontFamily` | sémantique |
| Taille icône inline | `icon.size.inline` | sémantique |
| Taille icône contrôle | `icon.size.control` | sémantique |
| Taille icône navigation | `icon.size.nav` | sémantique |

> Source de vérité complète : `tokens/semantic.json`

---

## Grille dimensionnelle — échelle 4px

| Token primitif | Valeur | Usage |
|----------------|--------|-------|
| `primitive.space.1` | 4px | Micro — séparateur |
| `primitive.space.2` | 8px | Petit — padding vertical |
| `primitive.space.3` | 12px | Intermédiaire |
| `primitive.space.4` | 16px | Standard — padding horizontal |
| `primitive.space.5` | 20px | Moyen |
| `primitive.space.6` | 24px | Intermédiaire large |
| `primitive.space.8` | 32px | Grand |
| `primitive.space.10` | 40px | Très grand |
| `primitive.space.12` | 48px | Macro |
| `primitive.space.16` | 64px | Macro — sections |

> Toute valeur d'espacement doit être un multiple de 4px. Jamais de valeur hors échelle.

---

## Règles critiques — mémo agent

```
❌ Jamais de valeur en dur (hex, px, rem brut)
❌ Jamais de token primitif dans un composant
❌ Jamais de variante inventée (hors component.json)
❌ Jamais de merge sans approbation humaine
❌ Jamais d'icône sémantique sans label ou decorative
✅ Toujours via var(--sda-[token])
✅ Toujours :focus-visible visible
✅ Toujours aria-* appropriés
✅ Escalader si doute sur impact d'une action
```

---

## Variantes autorisées par composant

### ds-button
`primary` | `secondary` | `ghost` | `critical`

> ⚠️ `critical` requiert `requiresConfirmation: true` dans le token + pattern de confirmation dans l'interface.

### ds-icon
`size="inline"` (16px) | `size="control"` (20px) | `size="nav"` (24px)

> ⚠️ Si l'icône est la seule information visible, `label` est obligatoire. Si elle accompagne un texte, utiliser `decorative`.

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
| ADR-007 | Choix de axe-core pour les tests d'accessibilité | ✅ Actif |
| ADR-008 | Choix de Radix UI Colors pour la palette primitive | ✅ Actif |
| ADR-009 | Choix de Storybook pour la documentation des composants | ✅ Actif |
| ADR-010 | Choix de Playwright pour les tests E2E et d'accessibilité | ✅ Actif |
| ADR-011 | Choix de Tokens Studio pour la synchronisation Figma ↔ JSON | ✅ Actif |
| ADR-012 | Détection de dérive par script d'audit (audit-tokens.js) | ✅ Actif |
| ADR-013 | DESIGN.md comme contrat portable versionné avec le code | ✅ Actif |
| ADR-014 | Choix de Conventional Commits pour les messages de commit | ✅ Actif |
| ADR-015 | Hook de rappel ADR dans les sessions IA | ✅ Actif |
| ADR-016 | Journal de construction (log/kit-construction.md) | ✅ Actif |
| ADR-017 | Correction du contraste text.disabled (4.54:1 WCAG AA) | ✅ Actif |
| ADR-018 | Migration des références primitives vers notation Radix | ✅ Actif |
| ADR-019 | Résolution dynamique des tokens dans le build | ✅ Actif |
| ADR-020 | Grille 4px comme échelle dimensionnelle systémique | ✅ Actif |
| ADR-021 | Atkinson Hyperlegible comme police principale | ✅ Actif |
| ADR-022 | Lucide Icons comme bibliothèque d'icônes | ✅ Actif |

> Dossier complet : `decisions/`

---

## Tokens dépréciés

Aucun token déprécié à ce jour.

> Tenir ce tableau à jour à chaque TCR. Voir `tokens/deprecated.md` quand le fichier existera.

---

## Dernière mise à jour

Date : 2026-05-29
Modifié par : Guilherme Negreiros
Raison : Ajout des tokens fontFamily, iconSize, space étendu (grille 4px) — ADR-020/021/022. Mise à jour préfixe --ds- → --sda-. Ajout ds-icon dans l'inventaire composants. Complétion des ADRs 015-022.
