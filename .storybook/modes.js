// Chromatic Story Modes — captures two snapshots per story (light + dark).
// Reference: https://www.chromatic.com/docs/modes/
// Usage in a story:
//   import { allModes } from '../.storybook/modes.js';
//   export const MyStory = { parameters: { chromatic: { modes: allModes } } };
// Or globally in preview.js (chromatic.modes parameter at the global level).

export const allModes = {
  light: {
    theme: 'light',
    backgrounds: { value: '#fcfcfc' },
  },
  dark: {
    theme: 'dark',
    backgrounds: { value: '#0a0c11' },
  },
};
