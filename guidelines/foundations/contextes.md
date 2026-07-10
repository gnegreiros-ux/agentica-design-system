# Contextes d'utilisation — Mode Produit vs Mode Marketing

> Décision de "direction" éditoriale — comment distinguer les pages qui convainquent des pages qui documentent.
> **Type:** guideline
> **Chemin logique:** guidelines/foundations/contextes.md
> **Lecture avant:** DESIGN.md, .claude/rules/contexts-utilisation.md
> **Relations:** decisions/ADR-057, tokens/semantic.json (semantic.marketing.*)

---

## Pourquoi deux contextes ?

Un système de design produit des outputs homogènes par défaut. Sans distinction explicite, la page
d'accueil d'un produit ressemble à sa page de documentation : même espacement, même typographie, même
densité visuelle.

Les deux contextes formalisent une différence d'intention :

| | Mode Produit (SaaS) | Mode Marketing (Narratif) |
|-|---------------------|--------------------------|
| **But** | Permettre d'agir | Communiquer une vision |
| **Lecteur** | Utilisateur qui travaille | Visiteur qui évalue |
| **Ton** | Précision, efficacité | Clarté, conviction |
| **Espace** | Densité normale | Respiration ample |
| **Hiérarchie** | Répétable, prévisible | Éditoriale, unique |

---

## Déclaration — comment activer chaque mode

```html
<!-- Mode Marketing (pages de conviction) -->
<body data-context="marketing">

<!-- Mode Produit (défaut — documentation, composants) -->
<body>
```

Le CSS réagit automatiquement via `[data-context="marketing"]`.

---

## Tokens par contexte

### Mode Produit — tokens autorisés

```css
/* Typographie — maximum heading.1 */
font-size: var(--agtc-semantic-typography-heading-1-size);      /* 40px */

/* Espacement — density=normal */
gap: var(--agtc-semantic-space-layout-section);                 /* 48px */
padding: var(--agtc-semantic-space-layout-component);           /* 24px */
```

### Mode Marketing — tokens supplémentaires

```css
/* Typographie display — hero uniquement */
font-size: var(--agtc-semantic-marketing-typography-display-size);        /* 60px */
font-weight: var(--agtc-semantic-marketing-typography-display-weight);    /* bold */
line-height: var(--agtc-semantic-marketing-typography-display-line-height); /* display */

/* Étiquette eyebrow */
font-size: var(--agtc-semantic-marketing-typography-eyebrow-size);            /* 12px */
font-weight: var(--agtc-semantic-marketing-typography-eyebrow-weight);        /* bold */
letter-spacing: var(--agtc-semantic-marketing-typography-eyebrow-letter-spacing); /* 0.12em — ADR-067 */

/* Espacement sections */
gap: var(--agtc-semantic-marketing-space-section-breathing);   /* 96px */
padding-top: var(--agtc-semantic-marketing-space-hero-gap);    /* 120px */
```

---

## Mapping des pages actuelles

| Page | Mode | Justification |
|------|------|---------------|
| `/` (home) | Marketing | Présente la vision — onboarde |
| `/get-started.html` | Marketing | Convainc et onboarde le visiteur |
| `/agents/` | Marketing | Explique le système agentique |
| `/foundations/*` | Produit | Documente les fondations |
| `/components/*` | Produit | Documente les composants |
| `/decisions/*` | Produit | Archive les décisions |

---

## Anti-patterns

> Distillés à l'origine de `Redesign/AI anti-patters.md` (dossier d'exploration supprimé le
> 2026-06-20) — contenu intégralement repris ci-dessous, cette section en est désormais la
> seule source.

Ces erreurs s'appliquent spécifiquement au Mode Marketing :

### Espacement

```
❌ Section spacing en dehors de l'échelle (96, 120px pour sections marketing)
❌ Valeurs en dur — toujours via semantic.marketing.space.*
✅ Section breathing = 96px via var(--agtc-semantic-marketing-space-section-breathing)
✅ Hero gap = 120px via var(--agtc-semantic-marketing-space-hero-gap)
```

### Typographie

```
❌ Plus de 3 tailles par section (headline, body, caption — max)
❌ Plus de 2 graisses sur la page entière
❌ Titre display > 60px (au-delà de marketing.typography.display)
❌ Italic en corps de texte
❌ All-caps sauf labels 11-12px
✅ Eyebrow 12px bold → titre 60px bold → corps 16-17px regular : hiérarchie claire
```

### Visuels

```
❌ Gradient sur plus d'un élément de la page
❌ Gradient sur les boutons
❌ Ombres decoratives (glassmorphism, backdrop-filter, shadows colorées > 4px)
❌ 3D orbs, spheres, blobs flottants dans le hero
❌ Particules, mesh gradients, images "cosmiques"
✅ Hero image = UI réelle ou artefact réel (ou texte seul si rien de réel n'existe)
```

### Motion

```
❌ Animations au scroll (scroll-triggered entrances)
❌ Parallax, stagger reveals, blur-to-focus
❌ Scale-on-hover, rotate-on-hover, elastic easing
✅ Hover : 150ms ease-out, opacity 0.7 ou translateY(-1px) uniquement
```

### Copywriting

```
❌ Buzzwords : "leverage", "unlock", "empower", "supercharge", "revolutionize", "seamless"
❌ Headlines-tease : "Ready to transform your tokens?"
✅ Headlines-statements : "Design tokens that work." — assertion, pas promesse
✅ Feature cards : titre = nom de chose concret, description = bénéfice concret avec au moins un nom
```

---

## Do / Don't

### DO — Asymétrie contrôlée (page home)

```
[eyebrow 12px bold]   "SYSTÈME DE DESIGN AGENTIQUE"
[H1 60px bold]        "Des tokens que les agents comprennent."
[corps 17px]          "Agentica encode les décisions d'interface pour les humains et les IA."
[CTA]                 → 96px de respiration avant la section suivante
```

### DON'T — Card SaaS générique sur page hero

```
[H2 24px]  "Pourquoi Agentica ?"
[4 cards avec icônes abstraites]
  ⚡ Fast    — "Performant."
  🔒 Secure  — "Sécurisé."
  🎨 Design  — "Beau."
  🤖 AI-ready — "Prêt pour l'IA."
```

→ Icônes abstraites sans contenu, titres adjectifs, descriptions sans substantif.

---

## Vérification avant publication

- [ ] Le mode est déclaré (`data-context="marketing"` ou absent)
- [ ] Typographie : max 3 tailles par section, max 2 graisses sur la page
- [ ] Espacement : valeurs issues de `semantic.marketing.space.*` ou `semantic.space.*`
- [ ] Aucun gradient sur plus d'un élément
- [ ] Hero image : contenu réel ou texte seul
- [ ] Headlines : assertions, aucun buzzword
