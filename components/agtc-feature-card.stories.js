import './agtc-feature-card.js';

export default {
  title: 'Components/Feature Card',
  component: 'agtc-feature-card',
  parameters: {
    docs: {
      description: {
        component: `
**Carte éditoriale V2** — icône fonctionnelle + titre + corps de texte avec affordance d'interactivité (border-bottom animé).

Conçue pour les sections marketing narratives ("Valeur par rôle", blocs éditoriaux). Deux variantes :
- \`default\` — border-bottom couleur principale (pages SaaS)
- \`marketing\` — border-bottom gradient primary→accent (pages \`data-context="marketing"\`)

**Patterns UX appliqués** (approuvés ADR-063, 2026-06-25) :
- [NN/g — Icône + titre en duo](https://www.nngroup.com/articles/design-pattern-guidelines/) : icône fonctionnelle, pas décorative
- [IxDF — Affordance contrôlée](https://ixdf.org/literature/topics/ui-design-patterns) : animation seulement au hover/focus
- [IxDF — prefers-reduced-motion](https://ixdf.org/literature/topics/ui-design-patterns) : border visible en permanence si mouvement réduit
- [Dashboard — Variante contextuelle](https://dashboarddesignpatterns.github.io/patterns.html) : default vs marketing

**Attributs :** \`heading\` · \`heading-level\` (1-6, défaut 3) · \`variant\` (default | marketing)

**Slots :** \`icon\` (SVG 20×20) · *(défaut)* corps de texte
        `,
      },
    },
  },
  argTypes: {
    heading:      { control: 'text', description: 'Titre de la carte' },
    headingLevel: { control: { type: 'number', min: 1, max: 6 }, description: 'Niveau HTML du heading (1-6)' },
    variant:      { control: { type: 'select', options: ['default', 'marketing'] } },
  },
};

const iconSvg = `<svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
</svg>`;

export const Default = {
  render: (args) => `
    <agtc-feature-card heading="${args.heading}" heading-level="${args.headingLevel}" variant="${args.variant}">
      ${iconSvg}
      Tokens sémantiques, contrats de composants et décisions documentées — lisibles par les humains et les agents IA.
    </agtc-feature-card>
  `,
  args: { heading: 'Designers', headingLevel: 3, variant: 'default' },
};

export const Marketing = {
  render: (args) => `
    <div style="background:#0c0f19;padding:2rem;">
      <agtc-feature-card heading="${args.heading}" heading-level="${args.headingLevel}" variant="${args.variant}">
        ${iconSvg}
        Tokens sémantiques, contrats de composants et décisions documentées — lisibles par les humains et les agents IA.
      </agtc-feature-card>
    </div>
  `,
  args: { heading: 'Designers', headingLevel: 3, variant: 'marketing' },
};

export const Grid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#1e2433;max-width:900px;">
      ${['Organisation', 'Managers', 'Designers', 'Développeurs', 'IA'].map(name => `
        <agtc-feature-card heading="${name}" heading-level="3" variant="marketing">
          ${iconSvg}
          Valeur spécifique pour ce rôle dans le système de design agentique.
        </agtc-feature-card>
      `).join('')}
    </div>
  `,
  parameters: { docs: { description: { story: 'Grille de 5 cartes — usage type dans la section "Valeur par rôle".' } } },
};

export const ReducedMotion = {
  render: () => `
    <p style="font-size:.85rem;margin-bottom:1rem;color:#94a3b8;">
      Simuler avec : OS → Accessibilité → Réduire les animations.
      La border-bottom est visible à pleine largeur dès le départ.
    </p>
    <agtc-feature-card heading="Accessibilité" heading-level="3">
      ${iconSvg}
      Le border-bottom reste visible même sans animation — prefers-reduced-motion respecté.
    </agtc-feature-card>
  `,
};
