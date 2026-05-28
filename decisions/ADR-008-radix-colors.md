# ADR-008 — Choix de Radix UI Colors pour la palette primitive

> **Date :** 2026-05-28
> **Statut :** ✅ Actif
> **Décideurs :** Design System Lead, Principal Designer
> **Type:** contract
> **Chemin logique:** decisions/ADR-008-radix-colors.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md, decisions/ADR-001-trois-niveaux-tokens.md
> **Relations:** tokens/primitives.json, tokens/semantic.json, guidelines/foundations/color.md, decisions/ADR-001-trois-niveaux-tokens.md, decisions/ADR-007-axe-core-accessibilite.md

---

## Contexte

L'ADR-001 établit que les tokens primitifs sont des **valeurs brutes sans intention UX**.
Pourtant, toutes les palettes de couleurs ne sont pas équivalentes pour un système agentique :
certaines encodent implicitement des contraintes d'accessibilité et d'usage, d'autres non.

Le projet avait besoin d'une palette primitive qui satisfasse trois contraintes simultanées :

**1. Accessibilité garantie structurellement**
Le choix de la palette ne doit pas reporter sur chaque designer ou développeur
la responsabilité de vérifier les ratios de contraste. La palette doit être conçue
pour que les combinaisons correctes soient les combinaisons naturelles.

**2. Lisibilité par les agents IA**
Un agent qui doit choisir une teinte pour un fond d'action doit pouvoir inférer
quelle valeur utiliser sans scanner toutes les nuances d'une palette plate.
La palette doit avoir une sémantique d'usage interne, pas seulement des valeurs.

**3. Dark mode natif sans effort**
Le système doit supporter le dark mode en remappant uniquement les tokens sémantiques.
La palette primitive doit fournir les équivalents dark de chaque nuance sans
que l'équipe ait à définir une deuxième palette manuellement.

---

## Décision

Adoption de **Radix UI Colors** comme source de toutes les couleurs primitives du système.

Radix fournit 30 palettes chromatiques (gray, mauve, slate, sage, olive, sand,
tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan,
teal, jade, green, grass, brown, bronze, gold, sky, mint, lime, yellow, amber, orange)
plus les palettes alpha `white` et `black`.

Chaque palette est structurée en **12 steps** avec une sémantique d'usage documentée :

| Steps | Usage sémantique |
|-------|-----------------|
| 1–2 | Fond d'application et fond subtil |
| 3–4 | Fond de composant UI, hover, pressed |
| 5–6 | Bordures et séparateurs |
| 7–8 | Texte atténué, fills discrets |
| 9–10 | **Solides** — CTA, brand, fond d'action |
| 11–12 | Texte haute contrast, icônes |

Cette sémantique est encodée directement dans `primitives.json` via le champ
`$description` de chaque token, et documentée dans le `_readme` de la section couleur.

---

## Pourquoi le système 12 steps est central pour les agents

Un agent qui reçoit l'instruction "choisir une couleur de fond pour un bouton d'action"
peut raisonner ainsi avec Radix :

```
Step 9 ou 10 = "Solid fills (brand, CTA)"
→ primitive.color.blue.9 = #0090ff  ← fond CTA bleu
→ primitive.color.blue.10 = #0588f0 ← état hover
```

Sans ce système, l'agent devrait scanner toutes les valeurs de la palette
et évaluer le contraste de chaque nuance pour trouver une valeur utilisable.
Avec Radix, la sémantique d'usage est dans le token lui-même.

Ce principe est cohérent avec ADR-005 (`critical` plutôt que `danger`) :
**nommer par comportement, pas par valeur**.

---

## Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|-----------------|
| **Tailwind CSS colors** | Palette plate sans sémantique d'usage par nuance. `blue-700` ne dit pas si la valeur convient pour un fond CTA, du texte ou une bordure. Un agent face à cette palette doit calculer les contrastes lui-même. Populaire mais sémantiquement pauvre pour un système agentique. |
| **Material Design color system (Google)** | Palette conçue pour l'écosystème Material. Les noms (`Primary`, `Secondary`, `Tertiary`) sont des rôles, pas des niveaux de nuance — ils anticipent déjà la couche sémantique et confondent les deux niveaux de l'ADR-001. Moins adaptable à un système de design custom. |
| **Palette personnalisée définie par l'équipe** | Requiert une expertise en science des couleurs (espace perceptuel, contraste APCA/WCAG, cohérence entre teintes). Sans outillage dédié, les garanties d'accessibilité doivent être vérifiées manuellement pour chaque nuance. Coût de maintenance élevé dès qu'une teinte est modifiée. |
| **IBM Carbon Design System colors** | Palette de qualité et accessible, mais couplée aux conventions de nommage Carbon (`carbon-10` à `carbon-100`). L'intégration nécessite de mapper les niveaux Carbon vers les niveaux du système local. Radix offre la même qualité sans ce couplage. |
| **Open Color** | Palette open source légère et simple. 12 teintes × 10 nuances chacune. Pas de sémantique d'usage documentée par nuance, pas de palettes alpha ni de dark mode natif. Insuffisant pour les besoins du système. |
| **Palette Figma auto-générée** | Les variables Figma peuvent générer des dégradés automatiquement. Mais les valeurs générées ne sont pas testées pour le contraste WCAG et ne fournissent pas de dark mode cohérent. Rompt également la souveraineté numérique — la palette devient dépendante de Figma. |

---

## Conséquences

**Pour les agents IA :**
- Le champ `$description` de chaque step (ex: `"Solid background — brand / CTA"`) est
  lisible directement — un agent peut choisir le step approprié sans calcul de contraste
- La convention step 9 = fond solide CTA et step 11 = texte lisible est prévisible et
  cohérente sur les 30 palettes : apprendre la règle une fois suffit pour toutes les teintes
- Un agent qui génère un token sémantique sait que les combinaisons `step 9 (fond) + white`
  et `step 11 (texte) + step 1 (fond)` sont accessibles par construction

**Pour les designers :**
- La palette dark mode Radix est disponible nataly — le remapping se fait uniquement
  au niveau des tokens sémantiques (ex: `color.background.page` pointe vers `gray.1`
  en light et `gray.2` en dark), sans redéfinir la couche primitive
- Figma : les 30 palettes sont importables via Tokens Studio directement depuis le JSON

**Pour l'accessibilité (ADR-007) :**
- Radix garantit que les steps 9-10 sur fond blanc atteignent un ratio ≥ 4.5:1 pour
  les teintes saturées, et que les steps 11-12 atteignent ≥ 7:1 — les seuils WCAG AA et AAA
- axe-core détecte les violations de contraste au runtime, mais Radix réduit la
  probabilité d'en introduire au moment de la conception

**Pour la gouvernance :**
- Radix Colors est open source (MIT) — pas de dépendance commerciale, pas de risque de
  changement de licence
- Les valeurs sont stables entre versions majeures — une mise à jour Radix ne casse
  pas les tokens primitifs existants sans changelog explicite

**Point de vigilance :**
Les tokens sémantiques actuels (`semantic.json`) référencent les primitifs avec
une notation `{color.blue.700}` héritée d'une convention Tailwind (100–900),
qui ne correspond pas directement aux steps Radix (1–12) définis dans `primitives.json`.
Cette incohérence de référence doit être résolue dans un TCR dédié pour aligner
les deux couches et garantir que Style Dictionary résout les références correctement.

---

## Incidents ou déclencheurs

Décision fondatrice, prise avant incident.
Motivée par les tests menés avec des agents génératifs : lorsqu'une palette plate
sans sémantique d'usage était fournie, les agents choisissaient des nuances visuellement
cohérentes mais inaccessibles (ex: `blue-300` sur fond blanc, ratio < 3:1).
Avec la palette Radix et ses descriptions de step, les agents convergeaient
naturellement vers des steps accessibles sans règle explicite injectée.
