# Rule : figma-components

> Règles de construction des composants Figma pour la librairie Agentica.
> Basées sur les meilleures pratiques officielles Figma (2024-2025) + retours d'expérience de la session de build.
> **Type:** rule
> **Chemin logique:** .claude/rules/figma-components.md
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
✅ Créer un ComponentSet par famille (Button/Primary, Button/Secondary…)
   OU un seul ComponentSet multi-propriétés si < 10 variantes
❌ Ne jamais copier-coller la structure d'un composant au lieu d'imbriquer son instance
❌ Ne jamais dupliquer les variantes pour créer "une version légèrement différente"
```

### Structure d'un ComponentSet Agentica

```
ComponentSet "Button / Primary"
  └── Component State=Default
  └── Component State=Hover
  └── Component State=Focus
  └── Component State=Disabled
  └── Component State=Loading

ComponentSet "Button / Secondary"
  └── (même structure)
```

Préféré à un seul grand ComponentSet `Variant=Primary, State=Default` → 20 variantes
car les ComponentSets restent sous 10 éléments.

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
t.fontName = {family:"Inter", style:"Regular"}; // 1. font chargée
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
    badge.fontName = {family:"Inter", style:"Semi Bold"};
    badge.fontSize = 12;
    badge.characters = type === "do" ? "✅  DO" : "❌  DON'T";
    badge.fills = vFill(borderToken, borderFallback); // 6.4:1 sur blanc ✅
    col.appendChild(badge);

    // Exemple
    const example = figma.createText();
    example.fontName = {family:"Inter", style:"Regular"};
    example.fontSize = 14;
    example.characters = exampleText;
    example.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
    example.textAutoResize = "HEIGHT";
    col.appendChild(example);

    // Description
    const desc = figma.createText();
    desc.fontName = {family:"Inter", style:"Regular"};
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
dosLabel.fontName = {family:"Inter", style:"Semi Bold"};
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

**Chaque page composant doit avoir une `links-row` dans son header.**

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
    txt.fontName = {family:"Inter", style:"Medium"};
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
✅ links-row dans section-header, sous le titre et la description
❌ opacity sur la pill entière — dilue la lisibilité ; mettre opacity sur la pill frame, pas sur le texte
❌ Lien vers un fichier Figma (risque de loop circulaire)
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
function mkHeaderSection(title, description, links) {
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
  titleNode.fontName = {family:"Inter", style:"Semi Bold"};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/primary", "#1C2024"); // 16.4:1 ✅
  section.appendChild(titleNode);

  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Inter", style:"Regular"};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = vFill("color/text/secondary", "#4A5568"); // 7.5:1 ✅
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  section.appendChild(mkLinksRow(links)); // token color/border/focus — 6.5:1 ✅

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
function mkHeaderSectionBold(title, description, links) {
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
  titleNode.fontName = {family:"Inter", style:"Semi Bold"};
  titleNode.fontSize = 32;
  titleNode.characters = title;
  titleNode.fills = vFill("color/text/on-primary", "#FFFFFF");
  section.appendChild(titleNode);

  // Description — couleur légèrement teintée pour hiérarchie visuelle (4.95:1 ✅)
  const descNode = figma.createText();
  descNode.name = "description";
  descNode.fontName = {family:"Inter", style:"Regular"};
  descNode.fontSize = 16;
  descNode.characters = description;
  descNode.fills = [{type:"SOLID", color:{r:0.941,g:0.980,b:0.973}}]; // #F0FAF8 — fallback color/action/primary-subtle
  descNode.textAutoResize = "HEIGHT";
  section.appendChild(descNode);

  // Pills blanches avec texte teal pour les liens
  section.appendChild(mkLinksRowOnDark(links));

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
    txt.fontName = {family:"Inter", style:"Medium"};
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
  frame.fills = [{ type: "SOLID", color: hex("#FAFAFA") }];
  frame.strokes = [{ type: "SOLID", color: hex("#E8E8E8") }];
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
    titleNode.fontName = { family: "Atkinson Hyperlegible", style: "Bold" };
    titleNode.fontSize = 12; titleNode.characters = label;
    titleNode.fills = [{ type: "SOLID", color: hex("#202020") }];
    titleNode.textAutoResize = "WIDTH_AND_HEIGHT";
    section.appendChild(titleNode);

    const varNode = figma.createText();
    varNode.fontName = { family: "Atkinson Hyperlegible", style: "Regular" };
    varNode.fontSize = 10; varNode.characters = variants;
    varNode.fills = [{ type: "SOLID", color: hex("#646464") }];
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

## Erreurs connues — Plugin API Figma

| Erreur | Cause | Fix |
|--------|-------|-----|
| Frame reste à 40 px en hauteur | `primaryAxisSizingMode="AUTO"` avant `resize()` | `resize()` d'abord, `AUTO` ensuite |
| `page.appendChild(node)` — conflit | Les nœuds s'auto-attachent à la page courante | Ne jamais appeler `page.appendChild()` pour les nœuds top-level |
| `Cannot write to node with unloaded font` | textStyleId utilise une police non chargée | Charger TOUTES les polices au début de l'appel (`loadFontAsync`) |
| Texte vide après `textStyleId` | `characters` posé après `textStyleId` sur nœud vide | Toujours : `fontName` → `characters` → `textStyleId` → `fills` |
| `strokeAlign OUTSIDE` invisible | Frame avec `clipsContent=true` | Mettre `clipsContent=false` sur le parent quand anneau focus externe |
| Variantes ComponentSet chevauchées | CS inséré directement dans le flux — variantes à `(0,0)` | CS à `y=3000` + `variant.createInstance()` dans instRow WRAP |
| `instRow` déborde (2637 px+) | `primaryAxisSizingMode="AUTO"` sans contrainte | Après `append` : `instRow.layoutSizingHorizontal = "FILL"` |
