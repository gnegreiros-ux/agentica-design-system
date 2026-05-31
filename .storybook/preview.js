import '../dist/tokens/css/all.css';
import '../components/agtc-icon.js';
import '../components/agtc-button.js';
import '../components/agtc-input.js';

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
      // 'error' blocks CI on a11y violations (see ADR-007)
      test: 'error',
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