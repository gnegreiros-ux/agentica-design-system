import '../dist/tokens/css/all.css';
import '../dist/tokens/css/dark.css';
import './global.css';
import '../components/agtc-icon.js';
import '../components/agtc-button.js';
import '../components/agtc-input.js';
import '../components/agtc-badge.js';
import '../components/agtc-card.js';
import '../components/agtc-checkbox.js';
import '../components/agtc-radio.js';
import '../components/agtc-radio-group.js';
import '../components/agtc-toggle.js';
import '../components/agtc-table.js';
import '../components/agtc-code-block.js';
import '../components/agtc-banner.js';
import '../components/agtc-link.js';
import '../components/agtc-segmented.js';

import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { allModes } from './modes.js';

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark:  'dark',
      },
      defaultTheme: 'dark',
      attributeName: 'data-theme',
    }),
  ],
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
          { id: 'landmark-one-main',    enabled: false },
          { id: 'page-has-heading-one', enabled: false },
          { id: 'region',               enabled: false },
        ],
      },
    },
    chromatic: {
      // Capture light + dark en parallèle pour chaque story.
      // Référence : https://www.chromatic.com/docs/modes/
      modes: allModes,
    },
  },
};

export default preview;
