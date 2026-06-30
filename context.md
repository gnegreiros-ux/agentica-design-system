# Agentica — AI Brief
> Système de design agentique. Version 1.0.0. Site : https://designsystem.gnegreiros.com
> Mis à jour : 2026-06-30. Auteur : Guilherme Negreiros.

## Comment utiliser ce brief

Copiez l'intégralité de ce fichier et collez-le comme premier message dans votre IA (Claude, Copilot, ChatGPT, Gemini…). Toutes les questions suivantes sur Agentica recevront des réponses précises et conformes aux décisions versionnées.

---

## 1. Identité et mission

**Nom :** Agentica (préfixe technique : agtc)
**Organisation :** GNegreiros.com
**Site :** https://designsystem.gnegreiros.com

**Mission :** Encoder les décisions d'interface dans un format lisible par les humains et les agents IA — pour garantir cohérence, accessibilité et souveraineté numérique.

**Principes directeurs :**
1. Le dernier mot est humain. Les agents proposent, les humains approuvent.
2. Si ce n'est pas un token, ce n'est pas une décision — toute valeur locale est une dette.
3. La documentation instruit les machines, pas seulement les humains.
4. Souveraineté numérique : outils, données et décisions restent sous contrôle organisationnel.

---

## 2. Architecture des tokens (3 niveaux — règle absolue)

```
Primitifs → Sémantiques → Composant
(valeurs brutes)  (intention UX)  (contrats UI)
```

| Niveau | Fichier source | Exemple |
|--------|---------------|---------|
| Primitif | tokens/primitives.json | color.teal.9 = #34d3bb |
| Sémantique | tokens/semantic.json | color.action.primary → teal.9 |
| Composant | tokens/component.json | button.critical.requiresConfirmation = true |

**Règles absolues (violations = dette immédiate) :**
- JAMAIS de valeur en dur (couleur, espacement, radius) dans le code
- Les tokens primitifs ne s'utilisent JAMAIS directement dans un composant
- Les tokens sémantiques encodent l'INTENTION (ex: `color.action.primary`), pas la valeur (ex: `teal`)
- Les tokens de composant sont des contrats — toute modification exige une approbation humaine

**Convention de nommage CSS :**
```
--agtc-[niveau]-[catégorie]-[composant]-[variante]-[propriété]

--agtc-primitive-color-teal-9: #34d3bb
--agtc-semantic-color-action-primary: var(--agtc-primitive-color-teal-9)
--agtc-component-button-primary-background: var(--agtc-semantic-color-action-primary)
```

**Standard :** Format W3C DTCG (Design Tokens Community Group) — https://www.designtokens.org/

---

## 3. Composants disponibles (17 Web Components Lit)

| Composant | Usage principal |
|-----------|----------------|
| agtc-button | Action principale, secondaire, critique, fantôme |
| agtc-input | Champ de saisie texte, email, password |
| agtc-badge | Étiquette statut (success/warning/danger/info/neutral/brand) |
| agtc-banner | Message informatif inline (6 variantes, dismissible) |
| agtc-card | Conteneur composable pour contenu structuré |
| agtc-feature-card | Carte marketing glassmorphism avec icône et titre |
| agtc-checkbox | Case à cocher avec états indeterminate |
| agtc-radio / agtc-radio-group | Sélection exclusive dans un groupe |
| agtc-toggle | Interrupteur binaire avec retour visuel immédiat |
| agtc-table | Tableau de données lisible en lecture seule |
| agtc-code-block | Bloc de code avec copie accessible (aria-live) |
| agtc-tabs | Navigation par onglets avec aria-selected |
| agtc-segmented | Contrôle segmenté mono-sélection (ex: langue, densité) |
| agtc-link | Lien avec détection automatique externe (noopener + icône) |
| agtc-icon | Icône Lucide tokenisée |
| agtc-top-nav | Navigation principale, tabs visuels full-height |

### Règles critiques — agtc-button

- Maximum 1 bouton `primary` par section ou formulaire
- La variante `critical` EXIGE un pattern de confirmation (token requiresConfirmation: true)
- Libellé explicite obligatoire — jamais "OK" ou "Confirmer" seul sur une action critique
- Largeur préservée pendant les états async (loading)
- Variantes autorisées : `primary` | `secondary` | `critical` | `ghost`
- INTERDIT : inventer une variante (`danger`, `destructive`) — escalader à un humain

---

## 4. Accessibilité — WCAG 2.1 AA (non négociable)

| Règle | Standard | Token |
|-------|----------|-------|
| Contraste texte normal | 4.5:1 minimum | color.text.primary sur color.background.page |
| Contraste texte large | 3.0:1 minimum | — |
| Focus visible | Obligatoire sur tous les interactifs | color.border.focus |
| Navigation clavier | 100% des interactions | — |
| ARIA | Obligatoire sur tous les composants | aria-label, aria-describedby, aria-expanded |
| Cibles tactiles | ≥ 24×24px (WCAG 2.5.8) | — |

Tests automatisés : axe-core (CI bloquant) + Playwright (E2E).

---

## 5. Gouvernance des tokens (Token Change Request)

| Type de changement | Qui peut le faire | Approbation requise |
|---|---|---|
| Valeur d'un token primitif | Dev ou agent | Principal Designer |
| Ajout d'un token sémantique | Dev ou agent (via PR) | Design System Lead |
| Modification d'un token de composant | Humain seulement | Principal Designer |
| Suppression de token | Humain seulement | Principal Designer + audit d'impact |

Flux TCR : identifier → documenter → évaluer l'impact → approuver → modifier → compiler → tester → communiquer.

---

## 6. Contextes éditoriaux

**Mode Produit** (défaut, sans attribut) :
- Espacement normal, typographie max heading.1 (40px), grille régulière
- Usage : documentation de composants, tokens, décisions

**Mode Marketing** (`data-context="marketing"`) :
- Espacement sections 96px, gap hero 120px, typographie display (60px)
- Usage : pages de conviction et d'onboarding

Pages marketing : index.html, get-started.html, agents/index.html
Toutes les autres pages sont en mode Produit.

---

## 7. Décisions architecturales clés — 65 ADRs (au 2026-06-30)

| ADR | Décision | Impact |
|-----|----------|--------|
| ADR-001 | Architecture 3 niveaux de tokens | Non négociable — fondation du système |
| ADR-004 | Gouvernance humaine — le dernier mot est toujours humain | Tous les agents |
| ADR-005 | Variante `critical` remplace `danger` pour les actions irréversibles | agtc-button |
| ADR-021 | Atkinson Hyperlegible comme police principale | Typographie |
| ADR-047 | Jamais d'état :visited sur les éléments de navigation | CSS global |
| ADR-052 | Conformité W3C DTCG — standard de facto pour les tokens | tokens/*.json |
| ADR-057 | Deux contextes éditoriaux : Produit vs Marketing | Layout site |
| ADR-059 | Fermeture de la hiérarchie 3 niveaux (18 tokens sémantiques ajoutés) | Tokens |
| ADR-065 | Dark mode dual-mode via semantic.dark.json + Style Dictionary | Storybook/Chromatic |

---

## 8. Ce qu'un agent peut et ne peut pas faire

| ✅ Autorisé | ❌ Interdit sans approbation |
|---|---|
| Lire et appliquer les contrats de composants | Modifier tokens/component.json |
| Générer du code depuis les tokens sémantiques | Utiliser des valeurs en dur |
| Détecter les dérives et proposer des corrections | Merger sur main ou develop |
| Créer des branches fix/ docs/ feature/ | Pusher directement sur main |
| Ouvrir une PR avec description complète | Déployer en production seul |
| Ajouter ou modifier un token sémantique (via PR) | Supprimer un token |

---

## 9. Pile technologique

| Couche | Technologie |
|--------|-------------|
| Web Components | Lit (Google) |
| Compilation tokens | Style Dictionary (W3C DTCG) |
| Tests visuels | Chromatic (Storybook) |
| Tests accessibilité | axe-core (CI bloquant) |
| Tests E2E | Playwright |
| Documentation | Storybook |
| Sync Figma | Tokens Studio |
| Générateur site | Node.js custom (site/build.js) |
| CI/CD | GitHub Actions |

---

*Ce brief est généré automatiquement depuis les sources versionnées d'Agentica.*
*Toute modification passe par le dépôt : https://github.com/gnegreiros-ux/agentic-design-system*
