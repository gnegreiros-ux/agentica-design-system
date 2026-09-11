#!/usr/bin/env node
/**
 * Gemini CLI AfterTool hook — port of .claude/settings.json's PostToolUse/Write|Edit
 * UX-pattern-review reminder to Gemini's hooks schema (.gemini/settings.json).
 *
 * Same caveat as adr-reminder.js: field/tool names below are the best-evidenced
 * guess from geminicli.com/docs/hooks/, not independently verified against a live
 * Gemini CLI session. If this never fires, log `tool_input`/`tool_name` to stderr
 * to find the real values and fix the constants below.
 */
const FILE_PATH_FIELD = 'file_path'; // unverified, see header comment

import fs from 'fs';

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf-8'));
} catch (e) {
  console.error(`ux-pattern-reminder hook: could not parse stdin JSON (${e.message})`);
  process.exit(0);
}

const filePath = input?.tool_input?.[FILE_PATH_FIELD];
if (!filePath) {
  console.error(`ux-pattern-reminder hook: no ${FILE_PATH_FIELD} found on tool_input — payload was: ${JSON.stringify(input.tool_input)}`);
  process.exit(0);
}

const isComponentFile = /(\/components\/agtc-[^/]*\.js$|\/guidelines\/components\/[^/]*\.md$)/.test(filePath);
const isStoryFile = /\.stories\./.test(filePath);

if (isComponentFile && !isStoryFile) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'AfterTool',
      additionalContext: `UX PATTERNS REMINDER: component created or modified (${filePath}). IF the change affects UX behavior (variant, state, validation, error/help display, interaction, new type): run the ux-pattern-review skill (.agents/skills/ux-pattern-review/SKILL.md), present the reference patterns WITH LINKS for approval, then document the decision across the 6 surfaces (guideline, code, story, site, ADR, GitHub Projects). Otherwise, ignore this reminder.`,
    },
  }));
}
