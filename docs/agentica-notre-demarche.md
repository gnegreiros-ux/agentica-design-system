# Agentica — Comment nous avons construit ce système de design
**Un document pour nos collègues designers, conseillers CX et gestionnaires**

---

## Pourquoi ce document ?

Ce système de design a été construit différemment des autres.
Pas parce qu'on voulait faire compliqué — mais parce qu'on avait un problème nouveau à résoudre.

Ce document explique la démarche, les étapes, et les choix qu'on a faits,
dans un langage que tout le monde peut comprendre.

---

## Le problème de départ

Les systèmes de design existent depuis longtemps. Ils regroupent les composants visuels
d'une organisation (boutons, formulaires, couleurs, typo) pour que toutes les équipes
les utilisent de la même façon.

Mais aujourd'hui, les équipes travaillent avec des **agents IA** — des assistants comme
Claude ou Copilot — qui génèrent du code, proposent des designs, et font des modifications
automatiques.

Et là, un problème est apparu :

> **Les agents inventent.** Quand ils ne comprennent pas l'intention derrière une décision,
> ils improvisent. Un agent qui voit `#3B82F6` ne sait pas si c'est une couleur d'action,
> de décoration ou d'alerte. Il devine. Et parfois, il se trompe.

La question qu'on s'est posée :

> Comment construire un système de design que les agents comprennent vraiment,
> sans perdre le contrôle humain sur les décisions importantes ?

---

## L'idée centrale

Agentica est un **système de design conçu pour être lu par les humains ET par les agents IA.**

Chaque décision est explicitée. Chaque règle est documentée. Chaque composant a un "contrat"
qui explique pourquoi il existe, comment il fonctionne, et ce qu'on ne peut pas changer sans approbation.

**Le principe fondateur, en une phrase :**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Les agents proposent, détectent et exécutent.         │
│   Le dernier mot est toujours humain.                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## La démarche en 5 étapes

### Étape 1 — Poser les fondations (28 mai 2026)

Avant d'écrire une seule ligne de code ou de créer un seul composant,
on a posé les règles du jeu.

**Deux documents fondateurs ont été créés :**

- `DESIGN.md` — le *contrat de marque* : qui sommes-nous, quels sont nos principes,
  comment on prend les décisions
- `AGENTS.md` — le *guide pour les agents* : ce qu'ils peuvent faire, ce qu'ils ne peuvent
  pas faire, et qui appelle qui quand un doute apparaît

Ces deux fichiers sont la *constitution* du système. Tout agent qui travaille sur Agentica
les lit en premier.

```
  ┌──────────────────┐     ┌──────────────────┐
  │    DESIGN.md     │     │    AGENTS.md      │
  │                  │     │                  │
  │  Qui sommes-     │     │  Ce que les      │
  │  nous, nos       │     │  agents peuvent  │
  │  principes,      │     │  et ne peuvent   │
  │  notre identité  │     │  pas faire       │
  └──────────────────┘     └──────────────────┘
          │                         │
          └────────────┬────────────┘
                       │
                  Source de vérité
               pour humains et agents
```

---

### Étape 2 — Inventer un langage partagé (28-29 mai)

La grande découverte : pour qu'un agent comprenne l'*intention* derrière une couleur
ou un espacement, il faut lui donner des **noms qui ont du sens**, pas juste des valeurs.

On a donc créé une architecture en **3 niveaux de tokens** :

```
  NIVEAU 1             NIVEAU 2             NIVEAU 3
  Valeurs brutes  →    Intention UX   →    Contrats UI
  (les faits)          (le sens)           (les règles)

  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │             │    │              │    │              │
  │  blue-700   │───▶│ action.      │───▶│ button.      │
  │  #3B82F6    │    │ primary      │    │ critical.    │
  │  space-4    │    │              │    │ requires     │
  │  16px       │    │ feedback.    │    │ Confirmation │
  │             │    │ danger       │    │              │
  └─────────────┘    └──────────────┘    └──────────────┘
  primitives.json    semantic.json       component.json
```

**Pourquoi c'est important ?**

Quand un agent voit `color.action.primary`, il comprend immédiatement :
*"Cette couleur est réservée aux actions principales de l'utilisateur."*

Quand il voit `#3B82F6`, il ne sait rien. Il improvise.

**La règle absolue :** les valeurs brutes ne vont jamais directement dans les composants.
Tout passe par la couche du milieu — la couche sémantique.

---

### Étape 3 — Construire les fondations visuelles (29 mai)

Avec le langage en place, on a posé les bases visuelles du système :

| Décision | Pourquoi |
|----------|----------|
| **Police Atkinson Hyperlegible** | Conçue pour l'accessibilité — meilleure lisibilité pour les personnes malvoyantes ou dyslexiques |
| **Grille de 4px** | Tous les espacements sont des multiples de 4 — cohérence mathématique automatique |
| **Icônes Lucide** | Bibliothèque open source, constante, lisible par les agents |
| **Palette teal (sarcelle)** | Couleur d'action principale, testée WCAG AA (contraste suffisant pour l'accessibilité) |
| **Échelle typographique Minor Third** | Progression mathématique harmonieuse de xs à 5xl |

Ces choix ne sont pas arbitraires. Chacun a un **ADR** — un *Architecture Decision Record* —
qui explique pourquoi on a choisi cette option plutôt qu'une autre, et quelles alternatives
ont été rejetées et pourquoi.

> Un ADR, c'est la mémoire écrite d'une décision. Pas juste *quoi* on a décidé,
> mais *pourquoi*, et ce qu'on a écarté.

---

### Étape 4 — Construire les composants (30 mai – 5 juin)

Avec les fondations en place, on a construit les composants un à un.

Mais **chaque composant suit un processus en 4 temps** :

```
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  1. REVUE UX       Quels patterns reconnus existent     │
  │                    pour ce type de composant ?          │
  │                    (Nielsen, IF Patterns, IxDF...)      │
  │                            │                           │
  │                            ▼                           │
  │  2. CONTRAT        Rédiger le "contrat" du composant :  │
  │                    intention, variantes, accessibilité  │
  │                            │                           │
  │                            ▼                           │
  │  3. CONSTRUCTION   Coder + documenter dans Storybook   │
  │                            │                           │
  │                            ▼                           │
  │  4. APPROBATION    Validation humaine avant publication │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

**Les composants construits jusqu'ici :**

```
  Formulaires      Navigation       Contenu          Feedback
  ───────────      ──────────       ───────          ────────
  Button           Link             Card             Banner
  Input            Segmented        Table            Badge
  Checkbox         (sélecteur)      Code Block       (étiquette)
  Radio
  Toggle
  Icon
```

---

### Étape 5 — Mettre en place les gardes-fous (30 mai – 8 juin)

Un système de design sans surveillance, c'est un système qui dérive.
Les équipes créent des variations locales, les agents inventent des valeurs,
et en quelques mois, plus personne n'utilise le vrai système.

On a donc mis en place des **gardes-fous automatiques** :

```
  À chaque modification de code...

  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  audit-tokens     Détecte les couleurs et espacements   │
  │                   écrits "en dur" (non tokenisés)       │
  │                                                         │
  │  axe-core         Vérifie l'accessibilité — contraste,  │
  │                   navigation clavier, ARIA              │
  │                                                         │
  │  Chromatic        Prend des captures d'écran et         │
  │                   détecte les régressions visuelles     │
  │                                                         │
  │  Playwright       Tests d'interaction utilisateur       │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
              │
              ▼
       Si une violation est détectée :
       le code ne peut PAS être mergé.
       Un humain doit examiner et approuver.
```

---

## La gouvernance : qui fait quoi ?

C'est peut-être la décision la plus importante du projet.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  Ce qu'un agent IA PEUT faire :                              │
  │                                                              │
  │    ✓  Lire tous les contrats et tokens                       │
  │    ✓  Générer du code en respectant les tokens               │
  │    ✓  Détecter les dérives (valeurs en dur, tokens périmés)  │
  │    ✓  Ouvrir une proposition de correction (Pull Request)    │
  │    ✓  Produire des rapports d'accessibilité                  │
  │                                                              │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  Ce qu'un agent IA NE PEUT PAS faire sans approbation :      │
  │                                                              │
  │    ✗  Modifier un token sémantique (couche d'intention)      │
  │    ✗  Changer un contrat de composant                        │
  │    ✗  Supprimer quoi que ce soit                             │
  │    ✗  Déployer en production                                 │
  │    ✗  Ignorer une violation d'accessibilité                  │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
```

**Pourquoi cette limite ?**

Un agent peut être "certain" d'un changement qui casse quelque chose
qu'il ne comprend pas — un contrat d'équipe non documenté, une stratégie
de marque, un engagement légal d'accessibilité. La confiance technique
ne remplace pas le jugement humain.

---

## Ce que ça change concrètement

| Avant Agentica | Avec Agentica |
|----------------|---------------|
| Un agent invente des noms de tokens | Il lit les contrats, il comprend l'intention |
| Un changement de couleur casse 30 composants | La couche sémantique absorbe le changement |
| Les dérives sont découvertes en production | Détection automatique avant chaque merge |
| Les décisions de design sont dans des têtes | Chaque décision a un ADR — traçable pour toujours |
| Le mode sombre nécessite de tout refaire | Il suffit de remapper les tokens sémantiques |

---

## La chronologie en un coup d'oeil

```
  Mai 28          Mai 29          Mai 30          Juin 1-8
  ────────        ────────        ────────        ────────
  Fondations      Visuels         Construction    Composants
  DESIGN.md       Tokens          Brand           suite
  AGENTS.md       sémantiques     "Agentica"      Gardes-fous
  52 règles       Typographie     Identité        Tests auto
  ADR-001→016     Couleurs        Composants      Conformité
                  Grille 4px      initiaux        W3C DTCG
```

**Du 28 mai au 8 juin 2026 — 11 jours de construction.**
52 décisions documentées. 14 composants. 1 site de documentation.

---

## Ce que ce système n'est pas

- Ce n'est pas une bibliothèque de composants "prête à l'emploi"
- Ce n'est pas un remplacement de Figma
- Ce n'est pas un outil autonome

**C'est une fondation.** Un gabarit de gouvernance formalisé, un contrat
lisible par les humains ET par les agents, un point de départ à adapter
à n'importe quelle organisation.

---

## Ce qu'on vise ensuite

Agentica est une base. La confiance entre humains et agents se construit
progressivement. À mesure que le système accumule des preuves de fiabilité
— décisions documentées, tests verts, audits propres — les frontières
d'action des agents pourront être élargies, par décision humaine explicite,
documentée dans un ADR.

**L'objectif final :**

> Un système où les agents font le travail répétitif et détectent les dérives,
> pendant que les humains se concentrent sur les décisions stratégiques,
> créatives et organisationnelles.

---

*Document rédigé à partir des 52 ADRs, du journal de construction,
et de l'historique git du projet Agentica — juin 2026.*

*Auteur du système : Guilherme Negreiros*
*Site de documentation : https://designsystem.gnegreiros.com*
