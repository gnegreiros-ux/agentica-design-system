# Refonte du site Agentica

## Contexte

Tu travailles sur la refonte du site d'Agentica.

Il ne s'agit PAS d'un rafraîchissement visuel.

L'objectif est de transformer un site orienté documentation en une expérience narrative qui explique :

* ce qu'est Agentica ;
* pourquoi Agentica existe ;
* à qui il s'adresse ;
* comment il fonctionne.

La documentation devient une conséquence naturelle de la vision, et non le point de départ.

---

# Documents de référence

Avant toute modification, lis attentivement :

* `definition-agentica.md`
* `maquette-redesign.md`

Ces documents constituent la source de vérité du projet.

Ils définissent :

* la vision d'Agentica ;
* les clientèles cibles ;
* le storytelling ;
* l'architecture du site ;
* la structure de la page d'accueil ;
* la hiérarchie des messages.

Aucune décision ne doit contredire ces documents.

---

# Illustrations

Toutes les illustrations sont disponibles dans :

```text
/img
```

Elles font partie intégrante de l'identité d'Agentica.

Toujours utiliser les illustrations existantes.

Ne pas les recréer.

Les illustrations :

* sont des PNG transparents ;
* sont isométriques ;
* sont cohérentes entre elles ;
* ne contiennent aucun texte ;
* ne contiennent aucun code ;
* servent à soutenir le récit.

---

# Ce qu'est Agentica

Agentica n'est PAS :

* un système de design traditionnel ;
* une simple bibliothèque de composants ;
* un simple dépôt de tokens ;
* une vitrine Storybook ;
* un ensemble de directives visuelles isolées.

Agentica est :

> Un système de décisions conçu pour les humains et les agents IA.

Il transforme les connaissances en actifs :

* structurés ;
* durables ;
* auditables ;
* compréhensibles par les humains et les agents IA.

Agentica est un système de design nouvelle génération où les composants, les tokens, les décisions architecturales, les règles de gouvernance et les agents IA font partie d'un même système cohérent.

La finalité n'est pas uniquement de produire des interfaces cohérentes, mais de préserver les connaissances, de rendre les décisions explicites et de permettre leur compréhension autant par les humains que par les agents IA.

---

# Philosophie visuelle

Inspirations :

* Stripe
* Linear
* Vercel

Le ton doit être :

* éditorial ;
* premium ;
* moderne ;
* élégant ;
* calme ;
* aéré.

Éviter :

* l'aspect tableau de bord ;
* l'approche documentation-first ;
* les interfaces surchargées ;
* les murs de cartes ;
* les blocs trop denses.

---

# Changement fondamental

## Ancien site

Le site actuel est organisé selon les domaines techniques :

* Fondations
* Composants
* Tokens
* Décisions
* Agents
* Pipelines

Cette organisation est pertinente pour la documentation, mais elle n'explique pas Agentica.

Le visiteur est exposé trop tôt aux détails internes.

---

## Nouveau site

Le site devient narratif.

Storytelling d'abord.

Documentation ensuite.

Le visiteur doit comprendre la vision avant d'explorer les détails.

---

# Progression de la page d'accueil

Le récit doit suivre cette séquence :

```text
Le problème
        ↓
Humains + IA
        ↓
Connaissances
        ↓
Source unique de vérité
        ↓
Valeur pour les équipes
        ↓
Qualité
        ↓
Traçabilité
        ↓
Human-in-the-loop
        ↓
Durabilité
        ↓
Documentation
```

La documentation est la conséquence du récit, jamais son point de départ.

---

# Structure de la page d'accueil

Respecter l'ordre défini dans `maquette-redesign.md`.

---

## Hero

Illustration :

`IMG-HERO-SYSTEM`

Titre :

# Le système de décisions pour les humains et les agents IA

---

## Les équipes accumulent des décisions invisibles

Illustration :

`IMG-CONTEXT`

Expliquer :

* les connaissances dispersées ;
* la dette UX ;
* la documentation obsolète ;
* les difficultés d'intégration avec l'IA.

---

## Human First, AI Ready

Illustration :

`IMG-HUMANS-AI`

Humains :

* comprennent ;
* décident ;
* approuvent ;
* gouvernent.

Agents IA :

* détectent ;
* analysent ;
* proposent ;
* automatisent.

Le dernier mot reste toujours humain.

---

## Les connaissances sont un actif stratégique

Illustration :

`IMG-KNOWLEDGE-ASSETS`

Expliquer que les connaissances doivent survivre :

* aux frameworks ;
* aux outils ;
* aux technologies.

---

## Une seule source de vérité

Illustration :

`IMG-SINGLE-SOURCE`

Section majeure du site.

Présenter :

1. Fondations
2. Contrats sémantiques
3. Composants
4. Applications

Ne jamais représenter cela comme une pile technique.

L'idée centrale est :

> Une même source alimente plusieurs destinations.

---

## Une valeur différente pour chaque rôle

Illustration :

`IMG-PERSONAS`

Présenter les bénéfices pour :

* l'organisation ;
* les gestionnaires ;
* les Product Owners ;
* les designers ;
* les développeurs.

Mettre l'accent sur les résultats, pas sur les fonctionnalités.

---

## La qualité est une propriété du système

Illustration :

`IMG-QUALITY-GATES`

Expliquer :

* l'accessibilité ;
* les régressions visuelles ;
* la documentation ;
* les ADRs ;
* la cohérence.

La qualité est intégrée au système.

Elle n'est pas ajoutée après coup.

---

## Chaque décision possède une mémoire

Illustration :

`IMG-CONTRACTS`

Présenter :

* le contexte ;
* la décision ;
* les alternatives rejetées ;
* les conséquences ;
* les coûts acceptés.

Objectif :

préserver les connaissances dans le temps.

---

## Human-in-the-loop

Illustration :

`IMG-HUMAN-LOOP`

Les agents peuvent :

* générer ;
* détecter ;
* documenter ;
* proposer.

Les agents ne peuvent pas :

* approuver ;
* déployer ;
* contourner les règles.

Les humains demeurent responsables.

---

## Construire pour aujourd'hui. Préserver pour demain.

Illustrations :

* `IMG-DURABILITY`
* `IMG-FUTURE`

Mettre l'accent sur :

* les standards ouverts ;
* les Web Components ;
* la portabilité ;
* l'indépendance des frameworks ;
* la durabilité.

---

## CTA final

Illustration :

`IMG-AGENTICA`

Inviter les visiteurs à :

* démarrer ;
* explorer la documentation ;
* consulter GitHub.

---

# Nouvelle navigation

La navigation actuelle expose trop tôt les détails internes.

La nouvelle navigation doit exposer le sens.

## Navigation principale

* Accueil
* Pourquoi
* Architecture
* Qualité
* IA
* Documentation

Bouton principal :

* Démarrer

---

# Documentation

Rien ne disparaît.

Les sections actuelles sont conservées :

* Fondations
* Composants
* Tokens
* Décisions
* Agents
* Pipelines

Elles deviennent des sous-sections de Documentation.

La refonte modifie la manière de découvrir le contenu, pas le contenu lui-même.

---

# Mise en page

Grille :

12 colonnes.

Largeur maximale :

1280 px.

Espacements généreux.

Les sections doivent respirer.

Utiliser :

```css
padding-block: 10rem;
```

ou davantage pour les sections majeures.

---

# Arrière-plans

Ne plus alterner :

* noir ;
* blanc ;
* noir ;
* blanc.

Éviter les coupures visuelles fortes.

Créer une ambiance continue.

Utiliser :

* une seule atmosphère ;
* des surfaces subtiles ;
* des dégradés radiaux ;
* des transitions douces ;
* des séparateurs discrets.

Cette approche doit fonctionner naturellement en mode sombre.

---

# Ce qui doit être préservé

Ne jamais supprimer :

* les pages de documentation ;
* les tokens ;
* les composants ;
* les ADRs ;
* les agents ;
* les pipelines ;
* Storybook ;
* GitHub ;
* les audits.

Ces éléments restent essentiels.

Seule leur présentation évolue.

---

# Principe directeur

L'ancien site explique ce que contient Agentica.

Le nouveau site explique pourquoi Agentica existe.

La compréhension doit précéder l'exploration.

L'objectif de la refonte n'est pas seulement d'améliorer l'apparence du site, mais de faire comprendre qu'Agentica est un système de design de nouvelle génération, conçu pour préserver les connaissances et permettre la collaboration entre les humains et les agents IA.
