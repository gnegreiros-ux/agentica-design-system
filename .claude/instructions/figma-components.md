# Rule : figma-components

> Règles de construction des composants Figma pour la librairie Agentica.
> Basées sur les meilleures pratiques officielles Figma (2024-2025) + retours d'expérience de la session de build.
> **Type:** rule
> **Chemin logique:** .claude/instructions/figma-components.md
> **Lecture avant:** AGENTS.md, DESIGN.md, .claude/rules/tokens-system.md
> **Relations:** .claude/rules/tokens-system.md, .claude/rules/development.md

---

## 0. Règle fondamentale — Jamais de token primitif, jamais de hex en dur

> **Cette règle s'applique à TOUT le code Figma : composants ET pages de documentation.**

```
❌ INTERDIT — token primitif dans un fill ou stroke
   comp.fills = [{type:"SOLID", color:{r:0,g:0.478,b:0.408}}]
   frame.fills = [hexRgb("#007A68")]
   VARS["color/teal/500"]               ← token primitif

✅ OBLIGATOIRE — token sémantique via vFill() avec fallback
   comp.fills = vFill("color/action/primary", "#007A68")
   frame.fills = vFill("color/background/default", "#FFFFFF")
```

### Pourquoi

Si un token sémantique change de valeur (ex: `color/action/primary` passe de teal à bleu),
toutes les libraisons Figma se mettent à jour automatiquement. Avec des hex en dur, rien ne bouge.
Les primitifs (`color/teal/500`) exposent l'implémentation, pas l'intention — cf. `tokens-system.md`.

### Exceptions acceptées

| Cas | Raison | Pattern requis |
|-----|--------|----------------|
| `gradientStops` | L'API Figma ne supporte pas `setBoundVariableForPaint` sur les stops | Utiliser le hex **fallback du token sémantique** + commentaire `// token: color/...` |
| Opacité sur ellipse décorative | Figma applique l'opacité sur le nœud, pas sur la variable | `opacity:` sur le nœud, `vFill()` pour la couleur |

---

## 1. Propriétés de composant — quand utiliser quoi

| Propriété | Type Figma | Quand l'utiliser |
|-----------|-----------|-----------------|
| État interactif | **Variant** `State=` | Default, Hover, Focus, Disabled, Loading, Error, ReadOnly |
| Taille | **Variant** `Size=` | sm / md / lg quand les dimensions changent réellement |
| Style visuel | **Variant** `Variant=` | Primary / Secondary / Critical / Ghost |
| Sous-élément optionnel | **Boolean** `HasIconLeft` | Afficher/masquer icône, label, helper text, badge |
| Contenu texte | **Text** `Label=` | Libellé bouton, placeholder, titre de carte |
| Slot icône / avatar | **Instance Swap** `Icon=` | Remplacer une icône ou un avatar par une autre instance |

### Règles absolues

```
✅ Utiliser Variant pour tout ce qui change la structure visuelle (états, tailles)
✅ Utiliser Boolean pour activer/désactiver un sous-layer (jamais une Variant pour ça)
✅ Nommer les layers de texte de façon identique entre variantes (ex: "label")
   → Préserve les overrides texte quand on change de variante
✅ Documenter chaque composant avec une description dans le panneau de propriétés
❌ Ne jamais créer une Variant uniquement pour cacher/montrer un layer → Boolean
❌ Ne jamais dépasser 10 variantes dans un seul ComponentSet (performance)
❌ Ne jamais imbriquer plus de 3 niveaux de composants
```

---

## 2. Auto-layout — règles de sizing

### Modes de taille

| Mode | Quand l'utiliser | Exemple |
|------|-----------------|---------|
| **HUG** (`AUTO`) | Composant qui grandit avec son contenu | Bouton, tag, badge |
| **FIXED** | Largeur/hauteur définie (doc, grid, field) | Input 280 px, colonne doc |
| **FILL** (`layoutGrow=1`) | Enfant qui remplit l'espace disponible | Texte dans un input, colonne flexible |
| **Min/Max width** | Composant responsive avec contraintes | Input min 120 px / max 480 px |

### Règle critique — resize() avant primaryAxisSizingMode

```javascript
// ✅ CORRECT — toujours dans cet ordre
frame.resize(width, 40);          // 1. resize FIRST
frame.primaryAxisSizingMode = "AUTO"; // 2. AUTO après resize

// ❌ INCORRECT — figma revient silencieusement en FIXED (bug API)
frame.primaryAxisSizingMode = "AUTO";
frame.resize(width, 40);
```

### Padding et gap

```
✅ Lier paddingLeft/paddingRight à space/control/padding-x
✅ Lier paddingTop/paddingBottom à space/control/padding-y
✅ Lier itemSpacing à space/control/gap (contrôles) ou space/layout/component (sections)
✅ Utiliser counterAxisAlignItems = "CENTER" pour les boutons et contrôles inline
❌ Ne jamais coder des valeurs numériques en dur — toujours via bindV()
```

### Auto-layout imbriqué

- Un composant peut contenir des frames auto-layout imbriquées (ex: wrapper VERTICAL → field HORIZONTAL)
- Les frames sans auto-layout (`layoutMode = "NONE"`) permettent le positionnement absolu des enfants
  → Utiliser pour les contrôles internes : pouce du Toggle, checkmark, dot radio

---

## 3. Architecture des composants

### Modèle recommandé (atomique)

```
Niveau 0 — Primitifs
  Icon/16  Icon/24  Avatar/xs  Avatar/md

Niveau 1 — Contrôles simples
  Toggle   Checkbox   Radio   Badge

Niveau 2 — Composants
  Button (utilise Icon/16)
  Input  (utilise Icon/16)
  Select (utilise Icon/16 + Badge)

Niveau 3 — Patterns
  FormField (utilise Input + Label + HelperText)
  Toolbar   (utilise Button + Toggle + Input)
```

```
✅ Créer des composants de base réutilisables avant de construire les composants composites
✅ Imbriquer des instances (pas des frames copiées) pour maintenir les connexions
✅ UN composant logique = UN seul ComponentSet, avec une propriété Variant pour ses
   déclinaisons de style (Primary/Secondary/Critical/Ghost…) — jamais un ComponentSet
   par déclinaison
❌ Ne jamais copier-coller la structure d'un composant au lieu d'imbriquer son instance
❌ Ne jamais dupliquer les variantes pour créer "une version légèrement différente"
❌ Ne jamais créer un ComponentSet séparé par déclinaison de style (Button/Primary,
   Button/Secondary… en sets distincts) — voir l'incident ci-dessous
```

### Structure d'un ComponentSet Agentica — règle corrigée (ADR 2026-07-06)

> **Incident.** La règle précédente de ce document préconisait « un ComponentSet par
> déclinaison de style » (`Button / Primary`, `Button / Secondary`… en 4 ComponentSets
> séparés) au motif de rester sous 10 variantes par set. C'était une erreur : dans Figma,
> chaque déclinaison devenait alors un **composant distinct** — un designer construisant
> une maquette devait remplacer toute l'instance pour passer de Primary à Secondary,
> au lieu de changer une simple propriété. Ce n'est pas ainsi que les designers
> attendent de travailler avec un composant à variantes (Material, Polaris, etc. n'ont
> qu'un seul composant Button). Corrigé le 2026-07-06 : les 4 ComponentSets Button ont
> été fusionnés en un seul avec deux propriétés (`Variant`, `State`).

**Bon pattern — UN seul ComponentSet, deux axes de propriété :**

```
ComponentSet "Button"
  Variant=Primary,   State=Default/Hover/Focus/Disabled/Loading
  Variant=Secondary, State=Default/Hover/Focus/Disabled/Loading
  Variant=Critical,  State=Default/Hover/Focus/Disabled/Loading
  Variant=Ghost,     State=Default/Hover/Focus/Disabled        (Loading non applicable)
```

Une grille incomplète (Ghost sans Loading) est acceptable — toutes les combinaisons
n'ont pas à exister.

**Plafond de variantes** — aligné sur le skill `figma-generate-library`, pas sur un
plafond arbitraire de 10 : cap réel à **30 combinaisons** (`Variant × State`, ou plus si
d'autres axes s'ajoutent) avant de fractionner en sous-composant. Button à 19-20
variantes reste largement dans cette limite — il n'y avait donc jamais de raison de le
séparer.

**Il n'y a pas d'exception « structure différente ».** Une version précédente de cette
règle tolérait un ComponentSet séparé si les familles étaient « structurellement
distinctes » (ex. Input `Search` avec une icône intégrée que `Text` n'a pas). Corrigé le
2026-07-06 : dans les faits, `Input/Text` et `Input/Search` avaient été construits comme
2 ComponentSets alors que `Search` n'avait même pas de structure différente (juste un
placeholder différent) — et même si la structure avait réellement différé, la bonne
solution est un **slot interne** (Boolean `HasIcon` ou Instance Swap `Icon=`) à
l'intérieur d'un seul ComponentSet, pas un ComponentSet séparé. Un composant logique
= un seul ComponentSet, toujours — la variation structurelle se gère par propriété
(Boolean/Instance Swap), jamais en dupliquant le ComponentSet.

### ⚠️ Piège API — fusionner des composants déjà rattachés à un ComponentSet

`figma.combineAsVariants()` sur des composants qui appartenaient chacun à un ancien
ComponentSet **distinct** produit un ComponentSet cassé (« Component set has existing
errors » — `componentPropertyDefinitions` et `variantProperties` deviennent illisibles),
même si le renommage semble avoir fonctionné. Chaque composant garde une référence
interne à l'ancien jeu de propriétés de son ex-ComponentSet, et Figma ne les réconcilie
pas silencieusement.

```
❌ INTERDIT
const old = [...setA.children, ...setB.children]; // composants d'anciens sets DIFFÉRENTS
figma.combineAsVariants(old, page); // → ComponentSet cassé, illisible

✅ CORRECT — reconstruire des composants neufs avant de fusionner
// 1. Lire fills/strokes/texte/layout de chaque ancien composant (ça reste lisible)
// 2. figma.createComponent() pour CHAQUE variante, reproduire le visuel, nommer
//    correctement "Variant=X, State=Y" (composants neufs = pas d'historique de propriété)
// 3. figma.combineAsVariants(nouveauxComposants, page) → ComponentSet propre
// 4. instance.swapComponent(nouveauComposant) sur toutes les instances existantes
//    AVANT de supprimer les anciens composants/ComponentSets
```

Cf. incidents Button et Input du 2026-07-06 — récupération complète documentée dans
l'historique GitHub Projects (ADR-069). Même correctif appliqué aux deux : Button (4 ComponentSets
`Variant` → 1 seul, 19 variantes) et Input (2 ComponentSets `Type` → 1 seul, 9 variantes).

---

## 4. Nommage

### Composants et ComponentSets

| Élément | Convention | Exemple |
|---------|-----------|---------|
| ComponentSet | `Nom / Variante` | `Button / Primary` |
| Variant property | `State=Valeur` | `State=Default` |
| Propriété booléenne | PascalCase | `HasIconLeft`, `ShowHelper` |
| Propriété texte | PascalCase | `Label`, `Placeholder` |

### Layers internes

```
✅ Nommer les layers de façon sémantique et stable : "label", "field", "icon-left", "track", "thumb"
✅ Garder le MÊME nom de layer entre toutes les variantes d'un ComponentSet
   → Override texte préservé quand on change d'état
✅ Préfixer les layers invisibles avec "_" : "_focus-ring" (convention optionnelle)
❌ Laisser des noms par défaut (Frame 47, Rectangle 2, Group 12)
```

### Pages Figma

```
🎯 Brand          ← assets brand, jamais toucher
🎨 Foundations    ← cover + sous-pages
  Foundations / Colors
  Foundations / Typography
  Foundations / Spacing
  Foundations / Logos
  Foundations / Icons
🧩 Components     ← cover catalogue + sous-pages
  Components / Button
  Components / Input
  ...
📐 Patterns       ← flows, compositions, exemples in-context
```

---

## 5. Liaison Variables et Styles

### Tableau de mapping — token sémantique → fallback hex

> Chaque couleur utilisée dans les composants ET dans les pages de documentation
> doit être tirée de cette table. **Jamais de hex en dehors de cette table.**

#### Couleurs d'action et de marque

| Token sémantique | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/action/primary` | `#007A68` | teal.11 | Fill principal — bouton, lien |
| `color/action/primary-hover` | `#0d3d38` | teal.12 | Hover / pressed state |
| `color/action/primary-subtle` | `#F0FAF8` | teal.2 | Texte description sur fond teal (Approche B header) |

#### Texte

| Token sémantique | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/text/primary` | `#202020` | gray.12 | Corps de texte, titres |
| `color/text/secondary` | `#646464` | gray.11 | Description, labels, helper text |
| `color/text/disabled` | `#767676` | neutral.500 | Placeholder, texte Disabled |
| `color/text/on-action` | `#FFFFFF` | neutral.0 | Texte sur fond action/primary |

#### Backgrounds

| Token sémantique | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/background/surface` | `#FFFFFF` | neutral.0 | Fond champs (Input), cards, sections blanches |
| `color/background/subtle` | `#f0f0f0` | gray.3 | Alternance, states cells, fond showcase |
| `color/background/page` | `#fcfcfc` | gray.1 | Fond page-wrapper |
| `color/background/hover` | `#fafafa` | neutral.50 | Hover row tableau |

#### Feedback (DO / DON'T / états d'erreur)

| Token sémantique | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/feedback/success` | `#18794e` | green.11 | Badge DO, bordure left DO-column |
| `color/feedback/danger` | `#ce2c31` | red.11 | Badge DON'T, message d'erreur, bordure Error |

#### Bordures

| Token sémantique | Hex fallback | Primitive → | Usage |
|-----------------|-------------|------------|-------|
| `color/border/default` | `#e8e8e8` | gray.4 | Stroke de card, tableau, champ Default |
| `color/border/focus` | `#007A68` | teal.11 | Anneau focus 2px OUTSIDE — strokes |
| `color/border/danger` | `#ce2c31` | red.11 | Bordure champ Error |

---

### Fills et strokes

```javascript
// ✅ CORRECT — token sémantique + fallback (valeurs issues de primitives.json)
comp.fills  = vFill("color/action/primary",      "#007A68"); // teal.11
frame.fills = vFill("color/background/surface",  "#FFFFFF"); // neutral.0
text.fills  = vFill("color/text/secondary",      "#646464"); // gray.11

// Strokes via setBoundVariableForPaint
comp.strokes = [figma.variables.setBoundVariableForPaint(
  {type:"SOLID", color:hex("#006B5C")},
  "color",
  VARS["color/border/focus"]
)];

// ❌ INTERDIT
comp.fills = [{type:"SOLID", color:{r:0,g:0.478,b:0.408}}]; // hex brut
comp.fills = [{type:"SOLID", color:hexRgb("#007A68")}];      // hex brut
VARS["color/teal/500"]                                        // token primitif
```

### Float properties

```javascript
// ✅ Valeur de fallback d'abord, puis bindV()
comp.paddingLeft = 16;
bindV(comp, 'paddingLeft', 'space/control/padding-x');
```

### Texte

```javascript
// ✅ Ordre obligatoire pour éviter les erreurs Figma API
t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")}; // 1. font chargée
t.fontSize = 14;                                 // 2. taille par défaut
t.characters = "Label";                          // 3. contenu
t.textStyleId = TX["typography/label"].id;       // 4. style (override police)
t.fills = vFill("color/text/primary","#202020"); // 5. token sémantique (gray.12)
```

### Exception — gradientStops (binding non supporté par l'API)

```javascript
// Seul cas où le hex peut apparaître directement
// → Utiliser le fallback du token sémantique + commenter le nom
{
  type: "GRADIENT_LINEAR",
  gradientTransform: [[1, 0, 0], [0, 1, 0.5]],
  gradientStops: [
    {position: 0, color: {r:1,   g:1,    b:1,    a:0}},  // color/background/default transparent
    {position: 1, color: {r:0,   g:0.478,b:0.408,a:0.14}}, // color/action/primary @ 14%
  ]
}
// ✅ Le hex correspond au fallback du token sémantique — token référencé en commentaire
```

### Portée des Variables (scoping)

- Définir les variables avec le scope le plus restrictif possible :
  - `color/text/*` → scope TEXT FILL
  - `color/background/*` → scope FRAME FILL
  - `color/border/*` → scope STROKE
  - `space/*` → scope GAP, PADDING
  - `radius/*` → scope CORNER RADIUS
- Cela évite que les variables color/text apparaissent dans le sélecteur de fond de frame

---

## 6. Performances et scalabilité

```
✅ Maximum 10 variantes par ComponentSet
✅ Maximum 3 niveaux d'imbrication de composants
✅ Séparer la librairie en fichiers si > 200 composants (Foundation lib / Component lib / Pattern lib)
✅ Utiliser Shared Libraries pour distribuer les composants à d'autres fichiers
❌ Ne pas mettre tous les composants dans un seul frame/page → lag
❌ Ne pas utiliser de Group là où un Frame auto-layout serait approprié
❌ Ne pas créer de "ComponentSet de preview" avec 100 instances → utiliser les pages doc dédiées
```

---

## 7. Checklist avant publication d'un composant

**Composant**
- [ ] Toutes les fills/strokes via `vFill(tokenSémantique, fallback)` — jamais `hexRgb()` direct, jamais token primitif
- [ ] Gradient stops : commentaire `// token: color/...` présent sur chaque stop
- [ ] Tous les textes liés à un Text Style + couleur via Variable
- [ ] Padding, gap, cornerRadius liés aux Float Variables
- [ ] Tous les états interactifs couverts (Default, Hover, Focus, Disabled minimum)
- [ ] Layers nommés sémantiquement et stables entre variantes
- [ ] Description du composant renseignée (panneau propriétés Figma)

**Page de documentation**
- [ ] `page-wrapper` VERTICAL auto-layout — aucun élément positionné manuellement
- [ ] `section-header` avec titre, description et `links-row` (≥ 3 liens)
- [ ] `section-showcase` avec tous les ComponentSets visibles
- [ ] `section-states` ou `section-tokens` avec tableau descriptif
- [ ] `section-dos-donts` avec au moins 1 paire DO/DON'T
- [ ] Aucun chevauchement visible — scroll vertical propre
- [ ] section-header : décoration gradient (approche A ou B, jamais de texte sur fond non vérifié)
- [ ] Éléments décoratifs préfixés `_` et `layoutPositioning = "ABSOLUTE"`

**Distribution**
- [ ] Testé à différentes largeurs (si composant responsive)
- [ ] Catalogue `Components` (35:7) mis à jour (badge ✅)

---

## 8. Mise en page des pages composant

### Règle de co-localisation — documentation sur la même page que le composant

> **La documentation (états, tokens, DO/DON'T, liens) vit sur la MÊME page Figma que le composant.**
> Pas de page séparée « doc » — un seul `page-wrapper` contient tout.

```
Page "Components / Button"
  └── page-wrapper (VERTICAL auto-layout)
        ├── section-header      ← titre, description, liens
        ├── section-showcase    ← ComponentSets (le composant lui-même)
        ├── section-states      ← documentation des états
        ├── section-tokens      ← tokens utilisés
        ├── section-dos-donts   ← bonnes pratiques
        └── section-links       ← références externes

Page "Patterns / Form"
  └── page-wrapper (même structure)
        ├── section-header
        ├── section-showcase    ← pattern en situation réelle
        ├── section-anatomy     ← annotations
        ├── section-dos-donts
        └── section-links
```

Idem pour les patterns. Le catalogue `Components` (35:7) ne contient qu'un **résumé** ;
la documentation complète est toujours sur la page dédiée.

---

### Problème à éviter — chevauchement

Les nœuds créés sans positionnement explicite s'empilent tous à `x=0, y=0`.
**Solution : un `page-wrapper` VERTICAL auto-layout qui contient tout.**

```javascript
// ✅ PATTERN OBLIGATOIRE — début de chaque page composant / pattern
// Tous les fills via vFill() — jamais hexRgb() directement (voir section 0)
const wrapper = figma.createFrame();
wrapper.name = "page-wrapper";
wrapper.fills = vFill("color/background/page", "#F4F4F5");
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisSizingMode = "AUTO";       // hauteur = contenu
wrapper.counterAxisSizingMode = "FIXED";
wrapper.resize(1440, 800);                    // largeur fixe, hauteur ajustée après
wrapper.itemSpacing = 0;                      // gap géré par les sections
wrapper.paddingTop = 0; wrapper.paddingBottom = 0;
wrapper.paddingLeft = 0; wrapper.paddingRight = 0;
wrapper.clipsContent = false;
// Tous les éléments sont appendés à wrapper, pas à figma.currentPage
```

### Fonds de section — tokens et alternance

| Section | Token sémantique | Hex fallback | Ratio texte principal |
|---------|-----------------|-------------|----------------------|
| section-header | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-showcase | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |
| section-states | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-tokens | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |
| section-dos-donts | `color/background/default` | `#FFFFFF` | 16.4:1 ✅ |
| section-links | `color/background/subtle` | `#F4F4F5` | 14.9:1 ✅ |

```javascript
// Helper — toujours vFill() pour le fond de section
function mkSection(name, bgToken, bgFallback) {
  const s = figma.createFrame();
  s.name = name;
  s.fills = vFill(bgToken, bgFallback);
  s.layoutMode = "VERTICAL";
  s.primaryAxisSizingMode = "AUTO";
  s.counterAxisSizingMode = "FIXED";
  s.resize(1440, 40);
  s.itemSpacing = 24;
  s.paddingTop = 60; s.paddingBottom = 60;
  s.paddingLeft = 80; s.paddingRight = 80;
  s.clipsContent = false;
  return s;
}

// Appels standards
const sHeader   = mkSection("section-header",    "color/background/default", "#FFFFFF");
const sShowcase = mkSection("section-showcase",  "color/background/subtle",  "#F4F4F5");
const sStates   = mkSection("section-states",    "color/background/default", "#FFFFFF");
const sTokens   = mkSection("section-tokens",    "color/background/subtle",  "#F4F4F5");
const sDos      = mkSection("section-dos-donts", "color/background/default", "#FFFFFF");
const sLinks    = mkSection("section-links",     "color/background/subtle",  "#F4F4F5");
```

### Positionnement du wrapper

```javascript
wrapper.x = 0;
wrapper.y = 0;
// Ne PAS appeler figma.currentPage.appendChild(wrapper) — il s'attache automatiquement
```

---

## 9. Template DO / DON'T

**Règle : toujours inclure une section DOs/DON'Ts sur chaque page composant.**

Les colonnes utilisent un fond **blanc** avec une **bordure gauche colorée** (4px) comme signal visuel.
Ce choix garantit le contraste minimum sur le texte secondaire (description), qui était en échec sur
fond teinté (4.48:1 < 4.5:1 requis WCAG AA). Sur fond blanc, tous les textes passent ≥ 6.4:1.

### Palette DO/DON'T vérifiée

| Rôle | Hex | Fond | Ratio WCAG |
|------|-----|------|-----------|
| DO — bordure gauche | `#1B6E1B` | — | — |
| DO — badge texte | `#1B6E1B` | `#FFFFFF` | **6.4:1** ✅ AA |
| DON'T — bordure gauche | `#B91C1C` | — | — |
| DON'T — badge texte | `#B91C1C` | `#FFFFFF` | **6.5:1** ✅ AA |
| Exemple texte | `#1C2024` | `#FFFFFF` | **16.4:1** ✅ AAA |
| Description texte | `#4A5568` | `#FFFFFF` | **7.5:1** ✅ AA |

### Pattern de code

```javascript
function mkDosSection(doExample, dontExample) {
  // Conteneur horizontal sans fond propre (fond = section parente #FFFFFF)
  const row = figma.createFrame();
  row.name = "dos-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 32;
  row.fills = [];

  function mkColumn(type, exampleText, description) {
    const col = figma.createFrame();
    col.name = type === "do" ? "do-column" : "dont-column";
    col.layoutMode = "VERTICAL";
    col.primaryAxisSizingMode = "AUTO";
    col.counterAxisSizingMode = "FIXED";
    col.resize(560, 40);
    col.itemSpacing = 12;
    col.paddingTop = 20; col.paddingBottom = 20;
    col.paddingLeft = 20; col.paddingRight = 20;
    col.cornerRadius = 8;
    col.fills = vFill("color/background/default", "#FFFFFF"); // 16.4:1 ✅

    // Bordure gauche colorée (4px) — token sémantique selon type
    const borderToken = type === "do" ? "color/feedback/success" : "color/feedback/error";
    const borderFallback = type === "do" ? "#1B6E1B" : "#B91C1C";
    col.strokes = [figma.variables.setBoundVariableForPaint(
      {type:"SOLID", color:{r:borderFallback==="#1B6E1B"?0.106:0.725,
                            g:borderFallback==="#1B6E1B"?0.431:0.110,
                            b:borderFallback==="#1B6E1B"?0.106:0.110}},
      "color", VARS[borderToken]
    )];
    col.strokeWeight = 4;
    col.strokeAlign = "INSIDE";

    // Badge DO / DON'T
    const badge = figma.createText();
    badge.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
    badge.fontSize = 12;
    badge.characters = type === "do" ? "✅  DO" : "❌  DON'T";
    badge.fills = vFill(borderToken, borderFallback); // 6.4:1 sur blanc ✅
    col.appendChild(badge);

    // Exemple
    const example = figma.createText();
    example.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
    example.fontSize = 14;
    example.characters = exampleText;
    example.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
    example.textAutoResize = "HEIGHT";
    col.appendChild(example);

    // Description
    const desc = figma.createText();
    desc.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
    desc.fontSize = 13;
    desc.characters = description;
    desc.fills = vFill("color/text/secondary", "#4A5568"); // 7.5:1 ✅
    desc.textAutoResize = "HEIGHT";
    col.appendChild(desc);

    return col;
  }

  row.appendChild(mkColumn("do",   doExample.text,   doExample.desc));
  row.appendChild(mkColumn("dont", dontExample.text, dontExample.desc));
  return row;
}
```

### Intégration dans la section

```javascript
const sectionDos = mkSection("section-dos-donts", "#FFFFFF");

const dosLabel = figma.createText();
dosLabel.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
dosLabel.fontSize = 14;
dosLabel.characters = "Bonnes pratiques";
dosLabel.fills = vFill("color/text/primary", "#1C2024");
sectionDos.appendChild(dosLabel);

const dosRow = mkDosSection(
  {text: "Supprimer définitivement ce dossier",
   desc: "Libellé explicite — l'utilisateur comprend l'action et son impact."},
  {text: "OK",
   desc: "Libellé vague — ne décrit pas l'action critique ni ses conséquences."}
);
sectionDos.appendChild(dosRow);
wrapper.appendChild(sectionDos);
```

### Règles contenu

```
✅ Fond blanc pour les colonnes — jamais de fond teinté (problèmes contraste confirmés)
✅ Bordure colorée gauche 4px comme signal — assez visible, non envahissant
✅ DO : montrer ce qu'il faut faire + justification courte
✅ DON'T : montrer l'anti-pattern le plus courant + conséquence
✅ Maximum 3 paires DO/DON'T par page
❌ Fond vert/rouge : DO badge sur #F0FCEF = 4.15:1 — FAIL WCAG AA
❌ Fond rouge : description sur #FFEFEF = 4.48:1 — FAIL WCAG AA (< 4.5:1)
```

---

## 10. Liens de documentation obligatoires

**Chaque page composant doit avoir une `links-row` — une seule fois, dans `section-links` en bas de page.**

> Historique : cette règle demandait autrefois une `links-row` dans le header ET dans
> `section-links`, ce qui dupliquait le même contenu deux fois sur la page (corrigé le
> 2026-07-06 — voir §17 Erreurs connues). Le header ne contient plus que le titre et la
> description ; les liens vivent uniquement en bas de page.

### Palette liens vérifiée

| Rôle | Hex texte | Hex fond | Ratio WCAG |
|------|-----------|----------|-----------|
| Texte lien | `#006B5C` | `#FFFFFF` | **6.5:1** ✅ AA |
| Texte lien | `#006B5C` | `#F4F4F5` | **5.9:1** ✅ AA |
| Bordure pill | `#006B5C` 40% | — | (décorative) |

> `#007A6A` sur fond pill teinté (#E0ECEC) = **4.35:1 — FAIL** — remplacé par `#006B5C` sur fond transparent.

### Liens obligatoires

| Lien | Source | Présent quand |
|------|--------|---------------|
| Guidelines | `guidelines/components/<comp>.md` (repo) | Toujours |
| NN/g | Article Nielsen Norman pertinent | Toujours |
| WCAG | Critère WCAG 2.1/2.2 applicable | Si composant interactif |
| ADR | `decisions/ADR-XXX.md` | Si ADR existe |
| Tokens | `tokens/component.json` (repo) | Toujours |

### Pattern de code

```javascript
function mkLinksRow(links) {
  const row = figma.createFrame();
  row.name = "links-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 12;
  row.fills = [];

  links.forEach(link => {
    const pill = figma.createFrame();
    pill.name = `link-${link.label.toLowerCase().replace(/\s/g,'-')}`;
    pill.layoutMode = "HORIZONTAL";
    pill.primaryAxisSizingMode = "AUTO";
    pill.counterAxisSizingMode = "AUTO";
    pill.itemSpacing = 4;
    pill.paddingTop = 6; pill.paddingBottom = 6;
    pill.paddingLeft = 12; pill.paddingRight = 12;
    pill.cornerRadius = 100;
    pill.fills = vFill("color/background/default", "#FFFFFF"); // 6.5:1 ✅ sur fond blanc
    pill.strokes = [figma.variables.setBoundVariableForPaint(
      {type:"SOLID", color:{r:0, g:0.420, b:0.361}}, // #006B5C
      "color", VARS["color/border/focus"]
    )];
    pill.strokeWeight = 1;
    pill.strokeAlign = "INSIDE";

    const txt = figma.createText();
    txt.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Medium")};
    txt.fontSize = 12;
    txt.characters = `↗  ${link.label}`;
    txt.fills = vFill("color/border/focus", "#006B5C"); // 6.5:1 sur blanc ✅
    txt.hyperlink = {type:"URL", value:link.url};
    pill.appendChild(txt);
    row.appendChild(pill);
  });
  return row;
}
```

### Appel type (exemple Button)

```javascript
const linksRow = mkLinksRow([
  {label:"Guidelines",     url:"https://github.com/orgs/agentica/docs/components/button.md"},
  {label:"NN/g — Buttons", url:"https://www.nngroup.com/articles/command-links/"},
  {label:"WCAG 1.3.5",     url:"https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose"},
  {label:"ADR-042",        url:"https://github.com/orgs/agentica/decisions/ADR-042"},
  {label:"Tokens",         url:"https://github.com/orgs/agentica/tokens/component.json"},
]);
```

### Règles contenu

```
✅ Fond blanc sur les pills (fond teinté translucide = #007A6A sur #E0ECEC = 4.35:1 — FAIL)
✅ Texte #006B5C — 6.5:1 sur blanc, 5.9:1 sur zinc ✅ (vs #007A6A qui échoue sur pill teinté)
✅ URLs absolues — jamais de chemins relatifs
✅ links-row uniquement dans section-links (bas de page) — jamais aussi dans section-header
❌ opacity sur la pill entière — dilue la lisibilité ; mettre opacity sur la pill frame, pas sur le texte
❌ Lien vers un fichier Figma (risque de loop circulaire)
❌ Dupliquer la même links-row dans le header ET section-links
```

---

## 11. Palette d'accessibilité — valeurs vérifiées WCAG AA

> Toutes les valeurs ci-dessous ont été calculées via la formule WCAG 2.1 (luminance relative).
> Ratio minimum requis : **4.5:1** pour le texte normal (< 18pt / < 14pt gras).

### Texte sur fonds de page

| Rôle | Hex texte | Hex fond | Ratio | WCAG |
|------|-----------|----------|-------|------|
| Titre (H1-H2) | `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Titre (H1-H2) | `#1C2024` | `#F4F4F5` | 14.9:1 | ✅ AAA |
| Corps / label | `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Secondaire | `#4A5568` | `#FFFFFF` | 7.5:1 | ✅ AA |
| Secondaire | `#4A5568` | `#F4F4F5` | 6.9:1 | ✅ AA |
| Lien teal | `#006B5C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| Lien teal | `#006B5C` | `#F4F4F5` | 5.9:1 | ✅ AA |

### DO / DON'T

| Rôle | Hex texte | Hex fond | Ratio | WCAG |
|------|-----------|----------|-------|------|
| Badge DO | `#1B6E1B` | `#FFFFFF` | 6.4:1 | ✅ AA |
| Badge DON'T | `#B91C1C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| ~~Badge DO (ancien)~~ | ~~`#228B22`~~ | ~~`#F0FCEF`~~ | ~~4.15:1~~ | ❌ FAIL |
| ~~Description (ancien)~~ | ~~`#637180`~~ | ~~`#FFEFEF`~~ | ~~4.48:1~~ | ❌ FAIL |

### Valeurs à ne jamais utiliser dans ce contexte

| Combinaison interdite | Ratio | Problème |
|-----------------------|-------|---------|
| `#228B22` sur `#F0FCEF` | 4.15:1 | Badge DO teinté — FAIL |
| `#637180` sur `#FFEFEF` | 4.48:1 | Description sur fond rose — FAIL |
| `#007A6A` sur `#E0ECEC` | 4.35:1 | Lien sur pill translucide teal — FAIL |

---

## 12. Décorations — Gradient Hero

### Principe d'accessibilité des décorations

> Toute décoration qui **touche** du texte doit être vérifiée pour le contraste.
> Les éléments décoratifs sans texte par-dessus peuvent avoir n'importe quelle opacité.

Deux approches sont définies — le choix se fait au niveau de la page :

| Approche | Quand l'utiliser | Texte |
|----------|-----------------|-------|
| **A — Partielle** (recommandée) | Header blanc + teal comme décoration à droite | Sombre (#1C2024) |
| **B — Bold** | Header entièrement teal — impact visuel fort | Blanc (#FFFFFF) |

---

### Approche A — Gradient partiel (décoration droite)

Le fond du header reste blanc. La décoration teal est un overlay absolutement positionné
dans la moitié droite — **jamais sous du texte**. Tous les textes restent sur fond blanc.

```javascript
function mkHeaderSection(title, description) {
  const section = figma.createFrame();
  section.name = "section-header";
  section.fills = vFill("color/background/default", "#FFFFFF");
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(1440, 40);
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 20;
  section.paddingTop = 60; section.paddingBottom = 60;
  section.paddingLeft = 80; section.paddingRight = 80;
  section.clipsContent = true; // clip les blobs qui débordent

  // ── Décorations absolues (préfixe "_" = non-content) ──────────────────

  // Gradient de droite (transparent → color/action/primary 14%)
  // Exception acceptée (section 0) : gradientStops ne supportent pas setBoundVariableForPaint
  // → hex fallback du token sémantique + commentaire obligatoire
  const decoGrad = figma.createFrame();
  decoGrad.name = "_deco-gradient";
  decoGrad.resize(800, 320);
  decoGrad.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1,0,0],[0,1,0.5]], // gauche→droite
    gradientStops: [
      {position:0,   color:{r:1,  g:1,    b:1,    a:0   }}, // color/background/default transparent
      {position:0.5, color:{r:0,  g:0.478,b:0.408,a:0.06}}, // color/action/primary 6%
      {position:1,   color:{r:0,  g:0.478,b:0.408,a:0.14}}, // color/action/primary 14%
    ]
  }];
  decoGrad.strokes = []; decoGrad.effects = [];
  decoGrad.layoutPositioning = "ABSOLUTE";
  decoGrad.x = 640; decoGrad.y = 0;
  section.appendChild(decoGrad);

  // Grand blob — couleur via vFill(), opacité via node.opacity (pas sur le fill)
  const blob1 = figma.createEllipse();
  blob1.name = "_deco-blob-lg";
  blob1.resize(340, 340);
  blob1.fills = vFill("color/action/primary", "#007A68");
  blob1.opacity = 0.07; // opacité sur le nœud — exception section 0
  blob1.layoutPositioning = "ABSOLUTE";
  blob1.x = 1160; blob1.y = -120;
  section.appendChild(blob1);

  // Petit blob secondaire
  const blob2 = figma.createEllipse();
  blob2.name = "_deco-blob-sm";
  blob2.resize(180, 180);
  blob2.fills = vFill("color/action/primary", "#007A68");
  blob2.opacity = 0.05;
  blob2.layoutPositioning = "ABSOLUTE";
  blob2.x = 1310; blob2.y = 100;
  section.appendChild(blob2);

  // ── Contenu (participe au auto-layout) ──────────────────────────────────

  const titleNode = figma.createText();
  titleNode.name = "component-title";
  titleNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
  section.appendChild(titleNode);

  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = vFill("color/text/secondary", "#4A5568"); // 7.5:1 ✅
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  // Pas de links-row ici — elle vit uniquement dans section-links, en bas de page (§10)

  return section;
}
```

**Vérification contraste — Approche A :**

| Texte | Fond effectif | Ratio | WCAG |
|-------|--------------|-------|------|
| Titre `#1C2024` | `#FFFFFF` | 16.4:1 | ✅ AAA |
| Description `#4A5568` | `#FFFFFF` | 7.5:1 | ✅ AA |
| Lien `#006B5C` | `#FFFFFF` | 6.5:1 | ✅ AA |
| Fond teal 14% max | Aucun texte dessus | — | décoratif ✅ |

---

### Approche B — Gradient teal plein (texte blanc)

Le header entier est teal. Les textes passent en **blanc** — contraste vérifié.
Les links-pills deviennent des pills blanches avec texte teal.

```javascript
function mkHeaderSectionBold(title, description) {
  const section = figma.createFrame();
  section.name = "section-header";
  // Gradient diagonal sombre → brand teal
  // Exception gradientStops (section 0) — hex = fallback des tokens sémantiques
  section.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      {position:0, color:{r:0,  g:0.353,b:0.294,a:1}}, // color/action/primary-hover #005A4E
      {position:1, color:{r:0,  g:0.478,b:0.408,a:1}}, // color/action/primary #007A68
    ]
  }];
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "FIXED";
  section.resize(1440, 40);
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 20;
  section.paddingTop = 60; section.paddingBottom = 60;
  section.paddingLeft = 80; section.paddingRight = 80;
  section.clipsContent = true;

  // Blobs décoratifs — couleur via vFill(), opacité via node.opacity
  const blobW1 = figma.createEllipse();
  blobW1.name = "_deco-blob-white-lg";
  blobW1.resize(400, 400);
  blobW1.fills = vFill("color/text/on-primary", "#FFFFFF"); // blanc
  blobW1.opacity = 0.06;
  blobW1.layoutPositioning = "ABSOLUTE";
  blobW1.x = 1100; blobW1.y = -160;
  section.appendChild(blobW1);

  const blobW2 = figma.createEllipse();
  blobW2.name = "_deco-blob-white-sm";
  blobW2.resize(200, 200);
  blobW2.fills = vFill("color/text/on-primary", "#FFFFFF");
  blobW2.opacity = 0.04;
  blobW2.layoutPositioning = "ABSOLUTE";
  blobW2.x = 1280; blobW2.y = 80;
  section.appendChild(blobW2);

  // Titre blanc — color/text/on-primary (5.27:1 min sur #007A68 ✅)
  const titleNode = figma.createText();
  titleNode.name = "component-title";
  titleNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Semi Bold")};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/on-primary", "#FFFFFF");
  section.appendChild(titleNode);

  // Description — couleur légèrement teintée pour hiérarchie visuelle (4.95:1 ✅)
  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Regular")};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = vFill("color/action/primary-subtle", "#F0FAF8");
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  // Pas de links-row ici — elle vit uniquement dans section-links, en bas de page (§10)
  // mkLinksRowOnDark reste disponible si une pill de lien est nécessaire ailleurs sur fond teal

  return section;
}

// Variante de mkLinksRow pour fond teal (pills blanches, texte teal)
function mkLinksRowOnDark(links) {
  const row = figma.createFrame();
  row.name = "links-row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 12;
  row.fills = [];
  links.forEach(link => {
    const pill = figma.createFrame();
    pill.name = `link-${link.label.toLowerCase().replace(/\s/g,'-')}`;
    pill.layoutMode = "HORIZONTAL";
    pill.primaryAxisSizingMode = "AUTO"; pill.counterAxisSizingMode = "AUTO";
    pill.itemSpacing = 4;
    pill.paddingTop = 6; pill.paddingBottom = 6;
    pill.paddingLeft = 12; pill.paddingRight = 12;
    pill.cornerRadius = 100;
    pill.fills = vFill("color/background/default", "#FFFFFF"); // fond blanc — token sémantique
    const txt = figma.createText();
    txt.fontName = {family:"Atkinson Hyperlegible", style: ahStyle("Medium")};
    txt.fontSize = 12;
    txt.characters = `↗  ${link.label}`;
    txt.fills = vFill("color/border/focus", "#006B5C"); // 6.5:1 sur blanc ✅
    txt.hyperlink = {type:"URL", value:link.url};
    pill.appendChild(txt);
    row.appendChild(pill);
  });
  return row;
}
```

**Vérification contraste — Approche B :**

| Texte | Fond effectif | Ratio | WCAG |
|-------|--------------|-------|------|
| Titre blanc | `#005A4B` (foncé) | 8.2:1 | ✅ AAA |
| Titre blanc | `#007A68` (clair) | 5.3:1 | ✅ AA |
| Description `#F0FAF8` | `#007A68` | 5.0:1 | ✅ AA |
| Lien teal `#006B5C` | pill `#FFFFFF` | 6.5:1 | ✅ AA |

---

### Décoration section-showcase — Points discrets

```javascript
// Ajouter des points de grille en fond du section-showcase
function addDotGrid(section, cols, rows) {
  const dotSize = 4, spacing = 24;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const dot = figma.createEllipse();
      dot.name = "_dot";
      dot.resize(dotSize, dotSize);
      dot.fills = vFill("color/action/primary", "#007A68");
      dot.opacity = 0.12; // opacité sur le nœud — exception section 0
      dot.layoutPositioning = "ABSOLUTE";
      dot.x = c * spacing; dot.y = r * spacing;
      section.appendChild(dot);
    }
  }
}
// Appel (20×8 = 160 points sur ~480×192px)
const showcase = mkSection("section-showcase", "#F4F4F5");
showcase.clipsContent = true;
addDotGrid(showcase, 20, 8);
// Ensuite ajouter les ComponentSets dans showcase (ils passent au-dessus)
```

---

### Règles décorations

```
✅ Préfixer les layers décoratifs avec "_" : _deco-gradient, _deco-blob-lg
✅ layoutPositioning = "ABSOLUTE" sur tous les éléments décoratifs
✅ section.clipsContent = true quand les décorations débordent
✅ Opacité max : 14% pour les remplissages décoratifs (préserve le contraste)
✅ Aucun texte sur un fond teinté non vérifié
❌ Ne pas mettre du texte dans les frames _deco-*
❌ Opacité > 20% pour les décorations (risque sur textes adjacents)
❌ Blobs / gradients dans section-states, section-tokens, section-dos-donts
   → ces sections restent blanches ou zinc pures pour maximiser la lisibilité
```

---

## 13. Fond de canevas — règle #535353

> **Toutes les pages Figma (sauf Brand) doivent avoir un fond de canevas `#535353`.**
> Cette règle s'applique à chaque nouvelle page et à tout script de build.

```javascript
// ✅ OBLIGATOIRE — à exécuter sur chaque page (hors Brand 17:4)
function h2r(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return {r,g,b};
}
const BG_CANVAS = h2r("#535353");
figma.currentPage.backgrounds = [{type:"SOLID", color:BG_CANVAS}];
```

### Pourquoi `#535353`

Ce gris neutre crée un contraste suffisant avec les frames blanches et subtile (#FCFCFC, #F4F4F5)
sans "avaler" les composants dark — il simule l'environnement de production (fond page web neutre).

### Exception

- **Brand (page 17:4)** : fond propre à la brand, jamais toucher.
- Les frames *elles-mêmes* gardent leurs propres tokens — seul `page.backgrounds` change.

### Vérification automatique dans un script

```javascript
const bgTarget = h2r("#535353");
const pages = figma.root.children;
pages.forEach(page => {
  if (page.id === "17:4") return; // Brand — skip
  const current = page.backgrounds[0];
  const needsFix = !current || current.type !== "SOLID"
    || Math.abs(current.color.r - bgTarget.r) > 0.005
    || Math.abs(current.color.g - bgTarget.g) > 0.005
    || Math.abs(current.color.b - bgTarget.b) > 0.005;
  if (needsFix) page.backgrounds = [{type:"SOLID", color:bgTarget}];
});
```

---

## 14. Police Agentica — Atkinson Hyperlegible

> **Inter est remplacé par Atkinson Hyperlegible depuis 2026-06-09 (ADR-021).**
> Tout nouveau code doit utiliser AH. Les scripts de global fix s'appuient sur `ahStyle()`.

### Disponibilité des graisses

| Graisse demandée | Graisse utilisée | Raison |
|-----------------|-----------------|--------|
| Regular | Regular | Direct |
| Medium | **Regular** | AH n'a pas Medium (ADR-021 : fontWeight.medium=500 → 400) |
| Semi Bold | **Bold** | AH n'a pas Semi Bold |
| Bold | Bold | Direct |
| Extra Bold / Black / Heavy | **Bold** | AH n'a que 2 graisses |

### Helper obligatoire

```javascript
function ahStyle(s) {
  const bold = ["Bold","Semi Bold","Extra Bold","ExtraBold","Black","Heavy"];
  return bold.includes(s) ? "Bold" : "Regular";
}

// mkT — texte FILL dans un conteneur (wrap naturel)
function mkT(chars, style, size, tok, fb) {
  const t = figma.createText();
  t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle(style||"Regular")};
  t.fontSize = size||14; t.characters = String(chars);
  t.fills = vFill(tok||"color/text/primary", fb||"#202020");
  t.textAutoResize = "HEIGHT"; return t;
}

// mkI — texte inline (pills, titres, badges) — largeur naturelle
function mkI(chars, style, size, tok, fb) {
  const t = figma.createText();
  t.fontName = {family:"Atkinson Hyperlegible", style: ahStyle(style||"Regular")};
  t.fontSize = size||14; t.characters = String(chars);
  t.fills = vFill(tok||"color/text/primary", fb||"#202020");
  t.textAutoResize = "WIDTH_AND_HEIGHT"; return t;
}
```

### Police monospace

`Atkinson Hyperlegible Mono` uniquement pour les blocs de code (`<code>`, `<pre>`).
Jamais pour du texte courant.

### Installation requise

Les deux polices doivent être installées **localement** pour que le plugin Figma les charge :
- `Atkinson Hyperlegible` (Regular + Bold)
- `Atkinson Hyperlegible Mono` (Regular)

---

## 15. Showcase ComponentSet — approche instances

> **Ne jamais insérer un ComponentSet directement dans le flux de mise en page.**
> Les variantes se positionnent à `(0,0)` → chevauchement garanti.

### Règle

1. Déplacer le ComponentSet à `y = 3000` (hors flux, accessible à la librairie)
2. Créer une `instances-row` WRAP auto-layout
3. Pour chaque variante : `variant.createInstance()` dans une wrap VERTICAL avec label
4. Après `sSection.appendChild(instRow)` : `instRow.layoutSizingHorizontal = "FILL"`

```javascript
// ComponentSet → y=3000
compSets.forEach(cs => { cs.x = 0; cs.y = 3000; });

// instances-row WRAP
const instRow = figma.createFrame();
instRow.name = "instances-row";
instRow.layoutMode = "HORIZONTAL";
instRow.layoutWrap = "WRAP";
instRow.primaryAxisSizingMode = "AUTO";
instRow.counterAxisSizingMode = "AUTO";
bv(instRow, "itemSpacing", "space/layout/component", 20);
bv(instRow, "counterAxisSpacing", "space/layout/component", 20);
instRow.fills = [];

compSets.forEach(cs => {
  [...cs.children].forEach(variant => {
    try {
      const wrap = figma.createFrame();
      wrap.name = variant.name;
      wrap.layoutMode = "VERTICAL";
      wrap.primaryAxisSizingMode = "AUTO";
      wrap.counterAxisSizingMode = "AUTO";
      bv(wrap, "itemSpacing", "space/control/gap", 8);
      wrap.fills = [];
      wrap.appendChild(variant.createInstance());
      const lbl = mkI(
        variant.name.replace(/State=/,""), "Regular", 11,
        "color/text/secondary", "#646464"
      );
      lbl.letterSpacing = {value:0.3, unit:"PIXELS"};
      wrap.appendChild(lbl);
      instRow.appendChild(wrap);
    } catch(e) {}
  });
});

sSection.appendChild(instRow);
instRow.layoutSizingHorizontal = "FILL"; // contraindre à la largeur de la section
```

---

## 16. Frame "Composant principal" — règle obligatoire

> **Tout ComponentSet (ou Component isolé) doit vivre dans un frame nommé `Composant principal`,
> positionné à `x = 1600, y = 0` sur sa page.**

### Structure

```
Frame "Composant principal"   x=1600, y=0
  VERTICAL auto-layout · padding 24px · gap 32px
  fond #FAFAFA · bordure #E8E8E8 1px · cornerRadius 8
  ├── section "button-/-primary"
  │   ├── Titre (Bold 12px, #202020)  "Button / Primary"
  │   ├── Variantes (Regular 10px, #646464)  "Default · Hover · Focus · Disabled · Loading"
  │   └── ComponentSet  (FIXED sizing — conserve ses dimensions natives)
  ├── section "button-/-secondary"
  │   └── ...
  └── (une section par ComponentSet)
```

### Règles

```
✅ x=1600, y=0 sur toutes les pages composant
✅ Un seul frame "Composant principal" par page (supprimer l'ancien avant de recréer)
✅ Chaque section : titre gras + liste des états en sous-titre + ComponentSet
✅ layoutSizingHorizontal = "FIXED" sur chaque ComponentSet (conserve sa largeur native)
✅ S'applique aussi aux Components isolés (ex : variantes Focus/Disabled de Checkbox)
❌ Ne jamais laisser un ComponentSet flottant directement sur le canevas
❌ Ne jamais renommer les ComponentSets en les déplaçant dans le frame
```

### Pattern de code

```javascript
async function mkComposantPrincipal(sets) {
  // sets = [{ node: ComponentSetNode, label: "Button / Primary", variants: "Default · Hover…" }]

  const existing = figma.currentPage.findChildren(n => n.name === "Composant principal");
  existing.forEach(e => e.remove());

  const frame = figma.createFrame();
  frame.name = "Composant principal";
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.itemSpacing = 32;
  frame.paddingTop = 24; frame.paddingBottom = 24;
  frame.paddingLeft = 24; frame.paddingRight = 24;
  frame.cornerRadius = 8;
  frame.fills = vFill("color/background/hover", "#FAFAFA");
  frame.strokes = [figma.variables.setBoundVariableForPaint(
    {type:"SOLID", color:hex("#E8E8E8")},
    "color",
    VARS["color/border/default"]
  )];
  frame.strokeWeight = 1; frame.strokeAlign = "INSIDE";
  frame.x = 1600; frame.y = 0;

  for (const { node, label, variants } of sets) {
    const section = figma.createFrame();
    section.name = label.replace(/\s*\/\s*/g, "-").toLowerCase();
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = 6;
    section.fills = [];

    const titleNode = figma.createText();
    titleNode.fontName = { family: "Atkinson Hyperlegible", style: ahStyle("Bold") };
    titleNode.fontSize = 12; titleNode.characters = label;
    titleNode.fills = vFill("color/text/primary", "#202020");
    titleNode.textAutoResize = "WIDTH_AND_HEIGHT";
    section.appendChild(titleNode);

    const varNode = figma.createText();
    varNode.fontName = { family: "Atkinson Hyperlegible", style: ahStyle("Regular") };
    varNode.fontSize = 10; varNode.characters = variants;
    varNode.fills = vFill("color/text/secondary", "#646464");
    varNode.textAutoResize = "WIDTH_AND_HEIGHT";
    section.appendChild(varNode);

    section.appendChild(node);
    try { node.layoutSizingHorizontal = "FIXED"; } catch(e) {}
    try { node.layoutSizingVertical = "FIXED"; } catch(e) {}

    frame.appendChild(section);
  }
  return frame;
}
```

---

## 17. Rows à nombre d'items variable — WRAP + FILL obligatoires

> **Toute row dont le nombre d'items dépend du composant (`states-row`, `instances-row`,
> ou équivalent) doit être en `layoutWrap="WRAP"` ET `layoutSizingHorizontal="FILL"`.**
> Incident du 2026-07-06 : la `states-row` d'Input (6 états : Default, Focused, Filled,
> Error, Disabled, ReadOnly) faisait 1560px dans une section de 1440px — elle débordait
> visuellement de la page (visible sur le dernier état, "ReadOnly", coupé par le bord du
> canevas). §15 documentait déjà ce correctif pour `instances-row`, mais ne le généralisait
> pas à `states-row` — l'oubli s'est reproduit ailleurs par simple copier-coller du pattern
> non-WRAP.

### Pourquoi `layoutWrap="WRAP"` seul ne suffit pas

```javascript
// ❌ INSUFFISANT — WRAP sans contrainte de largeur ne fait RIEN
row.layoutWrap = "WRAP";
// La row est en HUG (largeur = somme des enfants) : il n'y a jamais de bord à atteindre,
// donc jamais de retour à la ligne. Elle déborde silencieusement de la section parente.

// ✅ CORRECT — WRAP + FILL (la row doit être enfant d'un parent auto-layout)
row.layoutWrap = "WRAP";
row.counterAxisSpacing = 16;         // gap vertical entre les lignes wrappées
row.layoutSizingHorizontal = "FILL"; // contraint la row à la largeur du parent → force le wrap
```

### Règle de vérification systématique

Avant de considérer une page composant terminée, pour **chaque row horizontale** (états,
instances, ou toute liste dont la taille dépend des variantes du composant) :

```
✅ layoutWrap = "WRAP"
✅ layoutSizingHorizontal = "FILL" (jamais laissé en HUG/AUTO)
✅ counterAxisSpacing défini (sinon les lignes wrappées se touchent)
✅ Vérifier avec get_screenshot que rien ne dépasse le fond blanc de la section
   (contenu qui déborde sur le gris du canevas #535353 = signal de débordement)
❌ Ne jamais supposer qu'un composant à peu de variantes restera toujours en une seule ligne
   — le nombre d'états (Input a 6, la plupart en ont 4) varie par composant
❌ Ne jamais tolérer un débordement « minime » (quelques pixels) au motif qu'il est
   imperceptible — appliquer WRAP+FILL systématiquement, sans seuil de tolérance
```

> **Incident du 2026-07-06 (bis) — Segmented.** La `instances-row` de la section COMPOSANT
> débordait de 2px (1442px dans une section de 1440px). Laissé de côté une première fois car
> jugé « négligeable ». Corrigé sur demande explicite : préférer systématiquement une ligne
> supplémentaire (WRAP) à un débordement, même minime — il n'existe pas de seuil acceptable.
> Une fois WRAP+FILL appliqué, le rendu en plusieurs lignes reste propre (chaque `Tabs=N`
> occupe naturellement sa propre ligne) — l'argument « ça casserait une belle mise en page »
> ne justifie jamais de garder un débordement.

---

## 18. Toujours le token de composant — jamais le sémantique directement

> **Incident du 2026-07-06.** Button, Input, Toggle, Checkbox, Radio et Segmented liaient
> leurs fills/strokes/textes directement aux variables de la collection `semantic`
> (ex. `semantic/color/action/primary`), alors que la collection `component` existe et
> définit des tokens dédiés par composant (ex. `component/button/primary/background`).
> C'est l'équivalent Figma exact de la règle `tokens-system.md` niveau 3 — violée dans
> les deux sens (Figma **et** le CSS de `agtc-button.js`, qui référençait aussi le
> sémantique directement avant correction).

### Règle

```
✅ Avant de binder une fill/stroke/texte, chercher si un token component/<comp>/... existe
✅ Si oui → l'utiliser, jamais le semantic/... qu'il référence en interne
✅ Si non (état non couvert par tokens/component.json, ex. Disabled sur la plupart des
   composants) → rester sur semantic/... explicitement, ce n'est pas une erreur
❌ Ne jamais binder un semantic/... quand un component/... équivalent existe
❌ Ne jamais inventer un token component/... qui n'existe pas dans tokens/component.json
   sans l'y ajouter d'abord (le JSON fait foi, Figma suit — jamais l'inverse)
```

### Comment vérifier qu'un token composant existe

```javascript
// Lister tous les tokens de la collection "component" pour un composant donné
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const comp = collections.find(c => c.name === 'component');
const vars = await Promise.all(comp.variableIds.map(id => figma.variables.getVariableByIdAsync(id)));
vars.filter(v => v.name.startsWith('button/')).map(v => v.name);
```

Le tableau « TOKENS UTILISÉS » de chaque page composant doit lister les tokens **component**
réellement liés — pas les tokens sémantiques qu'ils référencent en interne (sauf pour les
propriétés qui n'ont pas de token composant dédié, où le sémantique reste correct et
doit être affiché tel quel).

---

## 19. Toujours `textStyleId` — jamais fontName/fontSize manuels qui "matchent" un style

> **Incident du 2026-07-06.** Les textes des composants utilisaient la bonne police et
> la bonne taille (ex. 14px Regular = valeurs identiques à `typography/label`) mais sans
> être **liés** au Text Style de la librairie via `textStyleId`. Résultat : si la
> librairie change sa typographie, ces textes ne suivent pas — ils ne font que
> ressembler au style au moment de leur création.

### Règle

```
✅ Toujours poser text.textStyleId = <id du Text Style de la librairie>
❌ Ne jamais se contenter de fontName + fontSize + lineHeight qui reproduisent
   manuellement les valeurs d'un Text Style existant — ce n'est pas une liaison
```

### ⚠️ Piège API — `textStyleId` + poids différent du style = lien cassé

`textNode.textStyleId = style.id` fonctionne. Mais toute mutation de police **après**
(`textNode.fontName = {...}` OU `textNode.setRangeFontName(...)`) efface silencieusement
`textStyleId` (redevient `""`) — contrairement à l'éditeur Figma, où changer le poids
sur du texte stylé laisse un indicateur de « override » partiel. Le Plugin API ne
supporte pas ce comportement partiel : c'est tout ou rien.

```javascript
// ❌ INTERDIT — efface le lien
textNode.textStyleId = labelStyle.id;
textNode.fontName = { family: "Atkinson Hyperlegible", style: "Bold" }; // → textStyleId redevient ""

// ✅ CORRECT — si le poids nécessaire diffère du style existant, créer le style qu'il faut
// (voir incident Button : typography/label est Regular, le texte de bouton est Bold
//  → création de typography/label-bold, un Text Style à part entière, Bold natif)
textNode.textStyleId = labelBoldStyle.id; // aucune mutation de police après → lien intact
```

**Ne jamais contourner par une valeur manuelle "qui ressemble".** Si aucun Text Style
existant ne correspond au poids réellement nécessaire, c'est un signal qu'il **manque
un Text Style dans la librairie** — pas une invitation à débrancher le texte du système.
Ajouter le style manque-t-il de légitimité ? Non : un poids d'emphase distinct
(ex. Bold pour un CTA vs Regular pour un label de formulaire) est une décision de
typographie réelle, pas un détail cosmétique — elle mérite son propre token, propagé
partout : `tokens/semantic.json` (composite `typography.*`) → `tokens/figma.json`
(génère le Text Style via Tokens Studio) → `tokens/component.json` (token de composant
qui y fait référence) → CSS compilé (`npm run tokens`) → composant code
(`components/agtc-*.js`) → Figma (Text Style créé/appliqué) → documentation
(`guidelines/components/*.md`). Jamais une correction Figma-only.

---

## 20. Icônes en instance-swap — `constraints: SCALE` obligatoire à chaque niveau imbriqué

> **Incident du 2026-07-07.** Les icônes (composant `Icon / <name>`, page `Foundations / Icons`)
> avaient été reconstruites en 24×24 avec de vrais tracés Lucide (fin de l'incident du
> 2026-07-06 — carrés gris placeholder). Mais utilisées en instance-swap dans `agtc-button`
> (slot `icon-prefix`/`icon-suffix` redimensionné à 18×18), certaines icônes débordaient du
> bouton, chevauchant le libellé — visible uniquement avec certaines formes d'icône, pas
> toutes (ex. `plus` semblait correct, `layout-dashboard` débordait franchement).

### Cause

Le redimensionnement d'une instance (`instance.resize(18, 18)`) ne fait cascader la mise à
l'échelle vers les enfants **que si chaque enfant, à chaque niveau de la hiérarchie, porte
`constraints: { horizontal: 'SCALE', vertical: 'SCALE' }` par rapport à son parent direct**.
Un enfant en `MIN`/`MIN` (valeur par défaut de `figma.createNodeFromSvg()` et de
`figma.createFrame()`) reste figé à sa taille native — il ignore le redimensionnement du
parent et déborde silencieusement.

Structure de chaque icône : `Icon / <name>` (COMPONENT 24×24) → `Frame` (24×24, wrapper créé
par `createNodeFromSvg`) → `Vector` × N (tracés). Les `Vector` avaient bien `SCALE/SCALE`
(hérité de l'export SVG), mais le `Frame` intermédiaire était resté en `MIN/MIN` — un seul
niveau non conforme suffit à casser toute la chaîne d'échelle.

### Règle

```
✅ Après toute création/modification d'un composant Icon, vérifier `constraints` sur
   CHAQUE enfant direct de chaque ancêtre jusqu'à la feuille (pas seulement le premier niveau)
✅ Régler explicitement { horizontal:'SCALE', vertical:'SCALE' } sur ces enfants —
   ne jamais supposer que c'est déjà le cas
✅ Tester le redimensionnement d'une INSTANCE (pas seulement le master) avec une icône
   dont le tracé touche les bords (ex. layout-dashboard, cpu, boxes) — les icônes
   symétriques centrées (plus, x, check) masquent le bug visuellement
❌ Ne jamais supposer qu'un enfant hérite du comportement SCALE de son propre enfant —
   chaque niveau de la hiérarchie a ses propres constraints, indépendantes
```

```javascript
// ✅ CORRECT — fixe les 81 icônes en une passe (incident du 2026-07-07)
const icons = page.findAllWithCriteria({types:['COMPONENT']}).filter(n => n.name.startsWith('Icon / '));
for (const icon of icons) {
  const frame = icon.children.find(c => c.name === 'Frame');
  frame.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
}
```

Une fois ce fix appliqué au niveau du master, `instance.swapComponent(autreIcone)` préserve
la taille de l'instance (ex. 18×18) et la nouvelle icône s'y adapte automatiquement — c'est
tout l'intérêt de l'instance-swap : composer librement sans re-corriger la taille à chaque
échange.

---

## 21. Validation obligatoire — dimensions, contrastes, affichage

> **Règle absolue (2026-07-07, suite aux incidents §16/§17/§20) : aucun composant ni
> aucune page ne peut être considéré terminé sans avoir passé ces trois validations.**
> Ce n'est pas une checklist visuelle optionnelle — ce sont trois scripts à exécuter
> réellement via `use_figma` avant de rapporter un composant comme fini, sur le
> composant/la page concernée ET sur tout ce qui a été touché indirectement (ex. :
> modifier un master Icon impacte tous ses usages ailleurs dans le fichier).

Déclencheur historique : icônes qui débordaient de leur slot (§20), fond `icon-wrap`
qui a perdu son opacité en cours de construction et rendu l'icône invisible (même
couleur que le fond), gap codé en dur au lieu d'un token. Ces trois bugs auraient été
détectés immédiatement par les scripts ci-dessous — ils n'ont pas été vus car aucune
vérification programmatique n'avait été faite, seulement une relecture visuelle rapide.

### A. Dimensions — pas de débordement, pas de désalignement

**Critère de passage :** pour tout nœud enfant (hors nœuds décoratifs `_préfixés` en
`layoutPositioning:"ABSOLUTE"`, et hors anneaux de focus `strokeAlign:"OUTSIDE"`
volontaires), les bornes de l'enfant doivent rester à l'intérieur des bornes de son
parent direct.

```javascript
// À exécuter sur chaque page modifiée — détecte tout débordement
function findOverflows(root) {
  const issues = [];
  function walk(node) {
    if (!('children' in node)) return;
    for (const child of node.children) {
      const isDecorative = child.name.startsWith('_') && child.layoutPositioning === 'ABSOLUTE';
      const isFocusRing = child.strokeAlign === 'OUTSIDE';
      if (!isDecorative && !isFocusRing && 'width' in node) {
        const overflowsRight  = child.x + child.width  > node.width  + 0.5;
        const overflowsBottom = child.y + child.height > node.height + 0.5;
        const overflowsLeft   = child.x < -0.5;
        const overflowsTop    = child.y < -0.5;
        if (overflowsRight || overflowsBottom || overflowsLeft || overflowsTop) {
          issues.push({ parent: node.name, child: child.name, parentSize: [node.width, node.height], childBounds: [child.x, child.y, child.x+child.width, child.y+child.height] });
        }
      }
      walk(child);
    }
  }
  walk(root);
  return issues;
}
```

Exécuter `findOverflows(pageNode)` (ou sur un `ComponentSet`/instance précis) et traiter
tout résultat non vide comme un blocant — pas seulement un signalement.

**Cas particulier instance-swap (icônes, avatars, etc.) :** tester le redimensionnement
avec au moins une valeur "à risque" (contenu proche des bords), pas uniquement la valeur
par défaut — voir §20, l'icône `plus` masquait le bug, `layout-dashboard` le révélait.

### B. Contrastes — calcul réel, pas une estimation visuelle

**Seuils WCAG :**
- Texte normal : **4.5:1** minimum
- Texte large (≥ 24px, ou ≥ 18.66px en Bold) : **3:1** minimum
- Icônes / graphiques UI (WCAG 1.4.11) : **3:1** minimum

```javascript
// Calcul de contraste WCAG — composite les fonds semi-transparents en remontant l'arbre
function relLum(c) {
  const lin = v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}
function contrastRatio(c1, c2) {
  const L1 = relLum(c1), L2 = relLum(c2);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}
function compositeOver(fg, opacity, bg) {
  return { r: fg.r*opacity + bg.r*(1-opacity), g: fg.g*opacity + bg.g*(1-opacity), b: fg.b*opacity + bg.b*(1-opacity) };
}
function resolveBackground(node, canvasBg = {r:1,g:1,b:1}) {
  const chain = [];
  let n = node.parent;
  while (n && n.type !== 'PAGE') { chain.unshift(n); n = n.parent; }
  let bg = canvasBg;
  for (const anc of chain) {
    if (!('fills' in anc) || !Array.isArray(anc.fills)) continue;
    for (const f of anc.fills) {
      if (f.type === 'SOLID' && f.visible !== false) bg = compositeOver(f.color, f.opacity ?? 1, bg);
    }
  }
  return bg;
}
// Usage sur un texte : requiredRatio dépend de fontSize/fontWeight (voir seuils ci-dessus)
const bg = resolveBackground(textNode);
const fg = textNode.fills[0].color;
const ratio = contrastRatio(fg, bg);
```

Traiter tout ratio sous le seuil comme un blocant, **y compris pour les icônes teintées
sur fond teinté** (ex. incident `icon-wrap` : icône `action-primary` plein sur fond
`action-primary` à 12% — le calcul aurait immédiatement donné un ratio proche de 1:1).

### ⚠️ Piège fréquent — anneau de focus de la même couleur que le fond du composant

> **Incident du 2026-07-07.** L'anneau de focus de `agtc-button` (Primary, fond teal)
> utilisait `border-focus`, qui résout **à la même couleur teal** que le fond du bouton
> — ratio 1:1 entre l'anneau et le composant qu'il entoure. Le même risque existe partout
> où un composant à fond `action-primary` (Toggle on, Checkbox coché, Radio sélectionné,
> Segmented sélectionné) reçoit un anneau de focus lié au même token.

**Solution standard (technique W3C C40 — "Two-Color Focus Indicator"), pas une
invention locale :** utiliser **deux couleurs à fort contraste entre elles** (une claire,
une foncée) pour l'anneau — tant que ces deux couleurs ont **au moins 9:1 de contraste
entre elles**, l'une des deux aura *toujours* au moins 3:1 avec n'importe quel fond plein,
sans avoir à décliner un anneau différent par variante de couleur.
Référence : [W3C WCAG — Technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40.html).

```
✅ Bande claire (blanc) directement collée au composant + bande foncée (teal/noir) à
   l'extérieur — la bande claire garantit à elle seule le contraste contre N'IMPORTE
   QUEL fond, y compris un fond de la même couleur que la bande foncée
✅ Chaque bande ≥ 2px — vérifié : blanc (spread 2) + teal (spread 6) sur Button
✅ Vérifié : blanc vs teal = 5.28:1 (> 3:1 requis) — donc même si l'anneau extérieur
   « disparaît » visuellement sur un fond de même teinte, le composant reste conforme
   ET visuellement plus grand (silhouette agrandie) — accepté explicitlement par
   l'utilisateur comme critère suffisant : « même si c'est la même couleur, l'état
   Focus devrait être plus grosse à cause du contour plus gros »
❌ Ne jamais supposer qu'un seul anneau à une couleur suffit sur tous les fonds
❌ Ne jamais évaluer un anneau de focus seulement au ratio interne (anneau vs fond) —
   toujours vérifier aussi la bande claire (anneau vs n'importe quel fond, garantie C40)
```

**Repère largeur :** Material Design 3 utilise `--md-focus-ring-width: 3px` par défaut
pour son anneau de focus — nos deux bandes (2px + 6px = 8px de largeur totale visible)
sont dans le même ordre de grandeur, légèrement plus généreuses pour rester lisibles
même en export basse résolution.

**Piège API associé (Plugin Figma) :** `figma.variables.setBoundVariableForEffect()`
lie correctement `boundVariables` mais ne recalcule pas toujours le champ `color`
littéral de l'effet immédiatement — vérifier le `color` résolu après binding, et le
forcer explicitement si besoin (`effect.color = {r,g,b,a}` en plus du binding) :
```javascript
let ring = { type:'DROP_SHADOW', color:{r:0,g:0,b:0,a:1}, spread:6, /* ... */ };
ring = figma.variables.setBoundVariableForEffect(ring, 'color', borderFocusVar);
ring.color = { r:0, g:0.478, b:0.408, a:1 }; // force-sync si le rendu montre encore l'ancienne couleur
```

### C. Affichage sur la page — élégance mesurable, pas seulement "ça a l'air bien"

- [ ] Gap icône ⇄ libellé : **toujours** un token (`space/control/gap` ou équivalent),
      jamais une valeur codée en dur — voir §18
- [ ] Alignement vertical : icône et texte partagent le même `counterAxisAlignItems:"CENTER"`
      sur leur parent — pas de décalage de baseline
- [ ] Aucun `itemSpacing:0` par défaut sur un conteneur qui reçoit ensuite des enfants
      icône+texte (piège rencontré sur Button — le composant avait été construit texte
      seul, `itemSpacing` jamais revisité en ajoutant les icônes)
- [ ] `findOverflows()` (§A) donne un résultat vide sur la page entière, pas seulement
      sur le composant modifié — une page voisine peut hériter un master modifié
- [ ] Screenshot final à `maxDimension` suffisant pour voir les détails (≥ 900px sur
      la zone concernée) — un screenshot trop petit masque exactement ce genre de bug

### Quand exécuter ces trois validations

```
✅ Après CHAQUE création ou modification de composant, avant de le déclarer terminé
✅ Après CHAQUE modification d'un master (Icon, Text Style, variable) — auditer tous
   les usages ailleurs dans le fichier, pas seulement l'endroit qu'on vient de modifier
✅ Avant le screenshot de vérification final d'une session de travail
❌ Ne jamais se fier à un screenshot basse résolution comme validation suffisante
❌ Ne jamais valider un composant en ne testant qu'une seule valeur/variante par propriété
   (ex. tester l'instance-swap avec une seule icône ne prouve rien sur les 80 autres)
```

---

## 22. Audit complet obligatoire — 9 catégories

> Référencé par `.claude/rules/figma-library-governance.md`. À exécuter sur toute page
> nouvellement créée/modifiée, avant de la déclarer terminée, et à chaque demande
> explicite ("audit", "vérifie tout le fichier", "screenshot global").

### 1. Accessibilité
- [ ] Anneau de focus visible sur tous les états focusables — technique C40 (§20), jamais
      un simple contour touchant l'élément (voir incident 2026-07-07 "bouton plus gros
      ≠ focus ring")
- [ ] Contraste texte ≥ 4.5:1 (≥ 3:1 si ≥ 24px ou ≥ 18.66px Bold) — script §21.B
- [ ] Contraste icônes/graphiques UI ≥ 3:1
- [ ] États `disabled` exemptés de contraste (WCAG) — ne pas les traiter comme des bugs

### 2. Affichage de la page
- [ ] `findOverflows()` (§21.A) retourne un tableau vide sur `page-wrapper` ET sur le
      `ComponentSet` lui-même
- [ ] Aucun nœud orphelin au niveau racine de la page (rectangles/instances de test
      oubliés — voir incident 2026-07-07, deux résidus de test laissés sur Button)
- [ ] Gap icône ⇄ libellé toujours via `space/control/gap` (ou équivalent), jamais codé
      en dur (§18)

### 3. Variables
- [ ] Aucun fill/stroke/padding/radius sans `boundVariables` — script de scan ci-dessous
- [ ] Priorité au token composant sur le sémantique (§18)
- [ ] Jamais de token primitif bindé directement sur un composant

```javascript
// Scanner les fills/strokes non liés à une Variable sur un ComponentSet
function scanUnboundPaints(root) {
  const issues = [];
  function walk(node) {
    if ('fills' in node && Array.isArray(node.fills)) {
      node.fills.forEach((f, i) => {
        if (f.type === 'SOLID' && f.visible !== false && !f.boundVariables?.color) {
          issues.push({ node: node.name, prop: `fills[${i}]`, color: f.color });
        }
      });
    }
    if ('strokes' in node && Array.isArray(node.strokes)) {
      node.strokes.forEach((s, i) => {
        if (s.type === 'SOLID' && s.visible !== false && !s.boundVariables?.color) {
          issues.push({ node: node.name, prop: `strokes[${i}]`, color: s.color });
        }
      });
    }
    if ('children' in node) node.children.forEach(walk);
  }
  walk(root);
  return issues;
}
```

### 4. Styles (Text Styles)
- [ ] Tout `TEXT` a un `textStyleId` non vide (§19) — jamais fontName/fontSize manuels
      qui "ressemblent" à un style existant
- [ ] **Tout Text Style a ses 4 propriétés (`fontSize`, `fontFamily`, `fontWeight`,
      `lineHeight`) bindées à une Variable** — jamais une valeur littérale, même si la
      valeur affichée est correcte (script `scanUnboundTextStyleProperties` ci-dessous)

```javascript
function scanMissingTextStyles(root) {
  const issues = [];
  root.findAllWithCriteria({ types: ['TEXT'] }).forEach(t => {
    if (!t.textStyleId) issues.push({ node: t.name, characters: t.characters.slice(0, 30) });
  });
  return issues;
}
```

> **Incident du 2026-07-09.** 10 des 11 Text Styles de la librairie (tous sauf
> `typography/detail`) n'avaient **aucune** variable bindée — valeurs littérales
> (`fontSize: 40`, etc.) accompagnées d'une simple description texte pointant vers le
> nom du token, sans lien réel. Pire : `detail-bold` et `label-bold` n'avaient **aucune
> variable Figma du tout** (ni taille, ni graisse, ni line-height), alors que
> `tokens/semantic.json` les définit intégralement — un vrai trou de parité code↔Figma
> resté invisible tant qu'aucun script d'audit ne vérifiait spécifiquement les Text
> Styles (le scan §3 `scanUnboundPaints` ne couvre que fills/strokes, pas la
> typographie). Détecté seulement parce qu'un humain a comparé un Text Style créé
> correctement (bindé) à ceux existants.

```javascript
// Scanner tous les Text Styles locaux — détecte les propriétés non bindées
async function scanUnboundTextStyleProperties() {
  const styles = await figma.getLocalTextStylesAsync();
  const required = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight'];
  const issues = [];
  for (const s of styles) {
    const bound = Object.keys(s.boundVariables || {});
    const missing = required.filter(k => !bound.includes(k));
    if (missing.length) issues.push({ style: s.name, missing });
  }
  return issues;
}
```

```
✅ Toujours binder fontSize/fontFamily/fontWeight/lineHeight sur CHAQUE Text Style créé
   — jamais seulement une description texte pointant vers le nom du token
✅ Exécuter scanUnboundTextStyleProperties() sur TOUTE la librairie (pas seulement les
   styles nouvellement créés) à chaque audit §22 — la dette peut être ancienne et
   invisible
✅ Si un token composé (ex. detail-bold, label-bold) référencé par du texte du chrome
   n'a pas de Variable Figma correspondante, la créer en alias vers la primitive
   adéquate AVANT de binder le Text Style — ne jamais laisser un Text Style sans lien
❌ Ne jamais considérer une valeur littérale "correcte" comme suffisante — sans binding,
   un futur changement de primitive (ex. re-échelonnage typographique) ne se propage pas
```

### 4bis. Polices locales — vérifier `loadFontAsync` AVANT de bâtir sur une police

> **Incident du 2026-07-09.** Une police installée localement (`Atkinson Hyperlegible
> Mono`) est sélectionnable et s'affiche correctement dans l'éditeur Figma interactif —
> mais `figma.loadFontAsync({family, style})` échoue systématiquement dans le bac à
> sable du Plugin API (`use_figma`), même après redémarrage de l'app desktop, avec
> l'erreur *"The font family ... does not exist"*. Un Text Style créé à la main dans
> l'UI avec cette police reste inspectable par script (lecture, binding de variables
> fonctionnent) mais **ne peut être appliqué à aucun autre nœud par script**
> (`setTextStyleIdAsync` échoue avec `unloaded font`) — un plafond dur de la plateforme,
> pas une question d'installation locale insuffisante.

```javascript
// Vérification OBLIGATOIRE avant de baser un chantier de Text Style sur une police
// non standard (pas dans Google Fonts / la bibliothèque Figma par défaut)
async function canLoadFont(family, style) {
  try {
    await figma.loadFontAsync({ family, style });
    return true;
  } catch (e) {
    return false;
  }
}
```

```
✅ Avant tout chantier basé sur une police locale non standard : tester canLoadFont()
   pour CHAQUE style utilisé (Regular ET Bold ne sont pas garantis équivalents)
✅ Si canLoadFont() échoue : soit utiliser le fallback documenté de la pile CSS du
   token (ex. JetBrains Mono, 2e maillon), soit accepter que l'application aux nœuds
   reste une tâche manuelle humaine dans l'UI Figma (le Text Style peut quand même être
   créé et bindé aux variables par script — seule l'APPLICATION à de nouveaux nœuds est
   bloquée)
❌ Ne jamais supposer qu'une police "visible dans le sélecteur Figma" est utilisable
   par un script — ce sont deux chemins d'accès différents (rendu interactif vs Plugin
   API), voir aide Figma "Add a font to Figma"
❌ Ne jamais boucler indéfiniment sur des redémarrages d'app en espérant que la police
   se charge — si `canLoadFont()` échoue deux fois de suite après un redémarrage
   confirmé, considérer que c'est un plafond de plateforme et escalader l'option
   fallback à l'humain plutôt que réessayer
```

### 5. États
- [ ] Les états Figma correspondent exactement à ceux du composant code (grep les
      `:hover`, `:focus-visible`, `:disabled`, états custom comme `loading`/`error` dans
      `components/agtc-<comp>.js`)
- [ ] Aucun état manquant, aucun état inventé

### 6. Variantes
- [ ] `componentPropertyDefinitions.Variant.variantOptions` (ou équivalent) correspond
      exactement à l'union type / `argTypes.variant.options` du fichier `.stories.js`
- [ ] Les propriétés (BOOLEAN/TEXT/INSTANCE_SWAP) correspondent aux props exposées par
      le composant Lit (`static properties`)

### 7. Documentation in-page
- [ ] `section-header` (titre + description), `section-showcase` (VARIANTES),
      `section-states` ou équivalent, `section-tokens`, `section-dos-donts`,
      `section-links` — tous présents (§8)
- [ ] Tableau `TOKENS UTILISÉS` reflète les tokens `component.<comp>.*` réels, pas les
      sémantiques bruts (§18)

### 8. Liens
- [ ] `section-links` contient au minimum : Guidelines, 1 source UX (NN/g, W3C APG, IxDF…),
      1 référence WCAG/ADR, Tokens — cf. `ux-patterns-sources.md`
- [ ] Aucun lien dupliqué entre le header et le bas de page (§10)

### 9. Parité code ↔ Figma après une instruction visuelle humaine directe

> **Incident du 2026-07-07.** L'utilisateur a demandé de retirer le fond de `.icon-wrap`
> sur Feature-card directement dans Figma (retour visuel, pas une lecture du code). Le
> changement a été fait côté Figma sans vérifier immédiatement `agtc-feature-card.js` —
> créant un écart Figma↔code silencieux (`background: rgba(18, 165, 148, .12)` restait
> dans le code). Un agent développeur séparé a dû corriger le code après coup pour que
> les deux convergent à nouveau.

**Règle** : toute modification visuelle faite dans Figma **sur la base d'un retour
humain direct** (pas sourcée depuis une lecture du code) crée par construction un écart
avec le code tant que celui-ci n'est pas mis à jour — ce n'est pas une erreur en soi,
mais l'écart doit être **rendu visible**, jamais silencieux.

```
✅ Après tout changement visuel demandé directement (pas lu dans le code) :
   1. Vérifier immédiatement le fichier components/agtc-<comp>.js correspondant
   2. Si le code diverge, noter l'écart explicitement (ex. ligne "corrigé" dans le
      tableau TOKENS UTILISÉS, comme fait pour Feature-card) — jamais silencieux
   3. Proposer à l'utilisateur un prompt de transfert vers l'agent développeur
      (voir `.claude/rules/figma-library-governance.md` — code = source de vérité)
   4. Une fois le code corrigé, revérifier Figma ↔ code et nettoyer la note d'écart
❌ Ne jamais supposer qu'un changement visuel "juste dans Figma" restera cohérent avec
   le code sans action explicite de propagation
❌ Ne jamais laisser un tableau de tokens Figma affirmer une valeur que le code ne
   produit pas réellement (ou l'inverse) sans note explicite de l'écart
```

---

## 23. Test de combinaisons variantes × états × contenu — méthode EightShapes

> **Incident du 2026-07-07.** Button avait un anneau de focus qui fonctionnait
> parfaitement… tant que le libellé restait "Bouton" et qu'aucune icône n'était activée.
> Dès qu'un designer combinait `State=Focus` + les deux propriétés icône, l'anneau
> (dimensionné une fois pour toutes lors de sa construction, en sibling statique du
> pill) ne suivait plus la taille réelle du bouton — chevauchement visuel complet.
> Le bug n'était détectable qu'en testant une **combinaison**, jamais en regardant
> chaque variante isolément.

**Référence méthodologique** : [Nathan Curtis (EightShapes) — Component Visual Test
Cases](https://medium.com/eightshapes-llc/component-visual-test-cases-e501e2d21def).
Principe central : **ne jamais tester une grille exhaustive de toutes les combinaisons**
(explosion combinatoire ingérable) — tester plutôt des **cas limites représentatifs**,
organisés en 5 catégories :

```
1. Propriétés    — chaque valeur de propriété fonctionne (déjà couvert par la grille
                    de variantes elle-même — pas la priorité ici)
2. Contenu       — texte/icônes : le plus court réaliste, le plus long réaliste,
                    et volontairement en trop (stress test) — pas seulement le cas nominal
3. Espacement    — layout de base avec plusieurs éléments simultanés affichés ensemble
4. Mise en page  — largeur du composant variée (plus étroit / plus large que la norme)
5. Composition   — slots/contenu imbriqué testés dans plusieurs proportions
```

### Règle pratique pour ce fichier Figma

Pour tout composant ayant **à la fois** (a) un état interactif visuel additif (Focus,
Selected, Hover…) **et** (b) un contenu de taille variable (texte libre, icônes
optionnelles) — combiner explicitement les deux avant de considérer le composant fini :

```javascript
// Test ciblé — pas exhaustif : le pire cas plausible pour CE composant
// 1. Créer une instance sur la variante d'état la plus "additive visuellement" (Focus, Selected)
// 2. Activer TOUTES les propriétés de contenu optionnelles en même temps (icônes, etc.)
// 3. Mettre le texte le plus long réaliste (pas un lorem ipsum géant — un vrai libellé long)
// 4. Screenshot + findOverflows() — si ça casse, c'est structurel, pas cosmétique
const inst = componentSet.children.find(c => c.name.includes('State=Focus')).createInstance();
inst.setProperties({
  [showIconPrefixKey]: true,
  [showIconSuffixKey]: true,
  [labelKey]: 'Un texte représentatif du pire cas réaliste',
});
```

### Composants à risque identifié (contenu variable + état additif visuel)

| Composant | Contenu variable | État additif | Statut |
|---|---|---|---|
| Button | Label + 2 icônes optionnelles | Focus (anneau) | Corrigé 2026-07-07 — anneau en wrapper auto-layout HUG, plus jamais un sibling de taille statique |
| Segmented | Labels d'options (2-5, longueur libre) | Focused (anneau) | Corrigé 2026-07-07 — même pattern wrapper |
| Input | Label + Placeholder/Value + icônes | Focus (bordure) | Bordure interne à `.control`, pas un sibling — risque plus faible mais à re-tester si la structure change |
| Toggle/Checkbox/Radio | Label (texte libre) | Focus (anneau) | Risque faible — l'anneau entoure une piste/case à **taille fixe**, indépendante du texte du label (élément séparé) |

**Leçon d'architecture** : un anneau de focus (ou tout indicateur additif) ne doit
**jamais** être un nœud sibling à taille calculée une fois puis figée. Il doit soit :
(a) entourer son contenu via un wrapper auto-layout `HUG` (le contenu grandit → le
wrapper suit automatiquement, sans recalcul manuel), soit (b) cibler un élément dont la
taille est structurellement fixe et indépendante du contenu variable (cas Toggle/Checkbox/Radio).

---

## 24. Typographie de présentation en Monospace — isoler la doc des composants

> **Règle adoptée le 2026-07-08.** Tous les textes de **présentation/documentation** d'une
> page Figma (titres de section, descriptions, légendes d'anatomie, labels de colonnes de
> grille, en-têtes de tableaux de tokens, texte des DO/DON'T) utilisent la police mono
> **du token**, pas la police de contenu, et pas un nom de police deviné à l'œil. Objectif :
> distinguer visuellement d'un coup d'œil ce qui est **méta** (la doc *à propos* du composant)
> de ce qui est **le composant lui-même** (qui, lui, garde sa police réelle
> `Atkinson Hyperlegible`).

### Source de vérité — le token, jamais une supposition

> Règle générale (`figma-library-governance.md` §1) : **le code fait foi**. Pour la
> Monospace, ça veut dire tracer le token jusqu'à sa valeur réelle avant de créer quoi
> que ce soit en Figma — jamais partir d'un nom de police mémorisé.

```
Token          semantic.typography.mono.family
  → alias de   primitive.fontFamily.mono
  → valeur     'Atkinson Hyperlegible Mono', 'JetBrains Mono', 'Cascadia Code', monospace
  → CSS var    --agtc-semantic-typography-mono-family
  → consommateur : components/agtc-code-block.js
```

Premier maillon de la pile disponible dans Figma → **`Atkinson Hyperlegible Mono`**
(les fallbacks `JetBrains Mono` / `Cascadia Code` sont une pile CSS de repli navigateur,
pas des variantes à répliquer en Figma).

### Valeurs réelles câblées dans `agtc-code-block.js` — à reproduire, pas à réinventer

Dette résorbée le 2026-07-08 (commits `15070ef` token(semantic), `3dedc58` fix(component) —
voir ADR-067). Le composant n'a plus aucune valeur de typographie codée en dur ; ces
tokens sont la référence exacte pour le Text Style `typography/doc-mono` :

| Usage dans le composant | Taille | Graisse | Line-height | Letter-spacing | Token |
|---|---|---|---|---|---|
| Corps du code | 14px | 400 (regular) | **1.6** | normal (0em) | `component.code-block.default.font-size` (= `semantic.typography.label.size`) · `semantic.typography.detail.line-height` (= `primitive.lineHeight.reading`) |
| Badge de langage (header) | 12px | **500 (medium)** | normal | **0.06em** | `semantic.typography.detail.size` · `semantic.typography.label.weight` (= `primitive.fontWeight.medium`) · `semantic.typography.letter-spacing.wide` (= `primitive.typography.letterSpacing.wide`) |

> Décision actée avec le badge de langage à 500 (medium) plutôt que 600 : aucune nouvelle
> primitive `semibold` n'a été créée — réutilisation de `fontWeight.medium` existant,
> approuvée par le Design System Lead + Principal Designer (ADR-067). Ne pas créer de
> Text Style Figma à "graisse 600" — il n'existe pas côté code.

### Périmètre — quoi passe en Monospace, quoi n'y passe PAS

| ✅ Monospace (texte de présentation, méta) | ❌ Reste en police de contenu réelle |
|---|---|
| Titres de section (`section-header`, « ANATOMIE », « VARIANTES »…) | **Le libellé du composant lui-même** (ex. « Bouton » dans un `agtc-button`) |
| Descriptions et paragraphes explicatifs de la page | Tout texte **à l'intérieur d'une instance de composant** |
| Légendes d'anatomie, labels de colonnes/lignes de la grille de variantes | Les valeurs affichées par un composant en situation réelle |
| En-têtes et cellules des tableaux de tokens | |
| Badges/texte des colonnes DO/DON'T, texte des pills de liens | |

> **Frontière absolue :** dès qu'un texte vit **dans une instance de composant**, il garde
> la police du composant. La Monospace ne s'applique qu'au **chrome de documentation** autour.
> C'est ce contraste de police qui crée la séparation visuelle demandée.

### Implémentation — un Text Style dédié, jamais fontName manuel (§19)

Créer/réutiliser un Text Style de librairie `typography/doc-mono` (et ses variantes de
graisse si besoin, `typography/doc-mono-bold`) et le poser via `textStyleId` — jamais un
`fontName` monospace codé à la main (mêmes raisons qu'au §19 : un texte qui « ressemble »
à du mono n'est pas lié au système).

```javascript
// La famille mono existe déjà (§14) — vérifier le style avant usage
await figma.loadFontAsync({ family: "Atkinson Hyperlegible Mono", style: "Regular" });
// Poser le Text Style de doc (créé une fois dans la librairie), pas un fontName brut
docTextNode.textStyleId = TX["typography/doc-mono"].id;
// Aucune mutation de police après (sinon textStyleId redevient "" — piège §19)
```

```
✅ Texte de présentation → textStyleId = typography/doc-mono (ou -bold)
✅ Le composant showcasé garde Atkinson Hyperlegible (sa vraie police)
❌ Ne jamais passer le libellé interne d'un composant en mono (casse la parité avec le code)
❌ Ne jamais coder la police mono à la main — toujours via le Text Style (§19)
```

---

## 25. Largeur de contenu des pages — jamais de débordement du wrapper

> **Règle adoptée le 2026-07-08.** Déclencheur : la page `Foundations / Logos` débordait
> encore de son `page-wrapper` (contenu large poussé hors du fond blanc, visible sur le
> gris `#535353` du canevas). Généralise le principe du §17 (WRAP+FILL) à **tout le
> contenu d'une page**, pas seulement les rows d'états/instances.

### Largeur canonique

```
Largeur du page-wrapper : 1440 px (fixe, counterAxisSizingMode = "FIXED")
Padding horizontal des sections : 80 px de chaque côté
→ Largeur de contenu utile : 1440 − 160 = 1280 px MAXIMUM
```

Aucun élément de contenu (frame, grille, image de logo, rangée) ne doit dépasser **1280 px**
de large une fois posé dans une section. Tout élément susceptible d'être plus large que la
place disponible doit soit passer en `layoutSizingHorizontal = "FILL"`, soit être en
conteneur `layoutWrap = "WRAP"` (§17), soit être mis à l'échelle pour tenir.

### Règle de vérification (à exécuter sur chaque page, pas seulement Logos)

```javascript
// Réutilise findOverflows() (§21.A) : tout enfant non décoratif dont les bornes
// dépassent celles de son parent direct = blocant. Cibler AUSSI le page-wrapper entier.
const overflows = findOverflows(pageWrapper);
// Cas Logos : une grille de logos ou un logo unique en largeur native > 1280
// → contraindre la grille en FILL + WRAP, ou resize chaque tuile de logo
```

```
✅ Contenu ≤ 1280 px de large dans toute section (wrapper 1440 − 2×80 de padding)
✅ Grilles/rangées de largeur variable : layoutSizingHorizontal="FILL" + layoutWrap="WRAP" (§17)
✅ Images (logos, illustrations) trop larges : resize proportionnel pour tenir dans 1280
✅ findOverflows(pageWrapper) doit retourner un tableau vide avant de déclarer la page finie
❌ Ne jamais laisser un élément déborder sur le gris du canevas, même « de quelques pixels » (§17)
❌ Ne jamais élargir le page-wrapper au-delà de 1440 pour « faire rentrer » un contenu trop large
   → corriger le contenu, pas le wrapper
```

---

## Erreurs connues — Plugin API Figma

| Erreur | Cause | Fix |
|--------|-------|-----|
| Frame reste à 40 px en hauteur | `primaryAxisSizingMode="AUTO"` avant `resize()` | `resize()` d'abord, `AUTO` ensuite |
| `page.appendChild(node)` — conflit | Les nœuds s'auto-attachent à la page courante | Ne jamais appeler `page.appendChild()` pour les nœuds top-level |
| `Cannot write to node with unloaded font` | textStyleId utilise une police non chargée | Charger TOUTES les polices au début de l'appel (`loadFontAsync`) |
| Texte vide après `textStyleId` | `characters` posé après `textStyleId` sur nœud vide | Toujours : `fontName` → `characters` → `textStyleId` → `fills` |
| `strokeAlign OUTSIDE` invisible | Frame avec `clipsContent=true` | Mettre `clipsContent=false` sur le parent quand anneau focus externe |
| Effet (`DROP_SHADOW`/glow) invisible sur un état hover/focus/selected | Le nœud qui porte l'effet a lui-même `clipsContent=true` — pas seulement son parent | Vérifier `clipsContent` sur le nœud qui porte l'effet ET sur chaque ancêtre jusqu'au ComponentSet — mettre `false` partout où l'effet doit déborder. Incident du 2026-07-06 : la pastille sélectionnée de Segmented (`tab-1`) et le ComponentSet lui-même avaient `clipsContent=true`, masquant le drop-shadow — audit exhaustif de tout le fichier requis (le bug ne se limite pas aux strokes, les effets sont clippés de la même façon) |
| Variantes ComponentSet chevauchées | CS inséré directement dans le flux — variantes à `(0,0)` | CS à `y=3000` + `variant.createInstance()` dans instRow WRAP |
| `instRow` déborde (2637 px+) | `primaryAxisSizingMode="AUTO"` sans contrainte | Après `append` : `instRow.layoutSizingHorizontal = "FILL"` |
| N'importe quelle row (états, instances) déborde de la section (contenu visible sur le gris du canevas) | `layoutWrap="WRAP"` posé sans `layoutSizingHorizontal="FILL"` — WRAP est un no-op en HUG | `row.layoutWrap="WRAP"` **+** `row.layoutSizingHorizontal="FILL"` **+** `counterAxisSpacing` — voir §17 |
| Contenu dupliqué (ex. liens) visible deux fois sur la même page | `links-row` ajoutée à la fois dans `section-header` et `section-links` | Une seule `links-row`, uniquement dans `section-links` (bas de page) — voir §10 |
| Fill/stroke lié à `semantic/...` alors qu'un token composant existe | Habitude de binder le sémantique sans vérifier `component/<comp>/...` d'abord | Toujours chercher le token `component/` correspondant avant de binder — voir §18 |
| `textStyleId` redevient `""` après avoir semblé s'appliquer | `fontName`/`setRangeFontName` posé après `textStyleId` — l'API efface le lien, contrairement à l'éditeur Figma | Ne jamais muter la police après `textStyleId` ; si le poids ne correspond pas, créer/utiliser le bon Text Style — voir §19 |
| Icône déborde de son slot (18×18) quand redimensionnée ou échangée via instance-swap | Wrapper `Frame` interne de l'icône en `constraints: MIN/MIN` (défaut `createNodeFromSvg`) — ne suit pas le resize de l'instance parente | `frame.constraints = { horizontal:'SCALE', vertical:'SCALE' }` sur CHAQUE niveau intermédiaire, pas seulement les `Vector` finaux — voir §20 |
