// Chromatic Story Modes — capture deux snapshots par story (light + dark).
// Référence : https://www.chromatic.com/docs/modes/
// Usage dans une story :
//   import { allModes } from '../.storybook/modes.js';
//   export const MyStory = { parameters: { chromatic: { modes: allModes } } };
// Ou globalement dans preview.js (paramètre chromatic.modes au niveau global).

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
