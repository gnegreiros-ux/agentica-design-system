import '../dist/tokens/css/all.css';
import './global.css';
import '../components/agtc-icon.js';
import '../components/agtc-button.js';
import '../components/agtc-input.js';
import '../components/agtc-badge.js';
import '../components/agtc-card.js';
import '../components/agtc-checkbox.js';

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
      config: {
        rules: [
          // Faux positifs structurels de l'iframe Storybook — pas des violations de composants
          { id: 'landmark-one-main',   enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region',              enabled: false },
        ],
      },
    },
    backgrounds: {
      default: 'white',
      values: [
        { name: 'white', value: '#ffffff' },
        { name: 'surface', value: '#f8f7f4' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;