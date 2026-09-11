#!/usr/bin/env node
/**
 * Gemini CLI AfterTool hook — port of .claude/settings.json's PostToolUse/Write
 * ADR reminder to Gemini's hooks schema (.gemini/settings.json).
 *
 * NOT independently verified against a live Gemini CLI session (no access to one
 * from this environment) — built from geminicli.com/docs/hooks/ and the GitHub
 * repo's docs/hooks/reference.md, which document `tool_input` as "the original
 * arguments" but don't give a verbatim AfterTool example for a file-write tool.
 * `file_path` is the field name that surfaced in the docs' own examples and
 * matches Claude Code's equivalent hook — the most defensible guess available,
 * not a confirmed one. If this never fires in practice, log `tool_input` to
 * stderr (see below) to find the real field/tool name and fix the two constants
 * at the top of this file.
 */
const FILE_PATH_FIELD = 'file_path';  // unverified, see header comment

import fs from 'fs';

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf-8'));
} catch (e) {
  console.error(`adr-reminder hook: could not parse stdin JSON (${e.message})`);
  process.exit(0); // never block the tool call over a hook-parsing failure
}

const filePath = input?.tool_input?.[FILE_PATH_FIELD];
if (!filePath) {
  console.error(`adr-reminder hook: no ${FILE_PATH_FIELD} found on tool_input — payload was: ${JSON.stringify(input.tool_input)}`);
  process.exit(0);
}

if (/\/(tokens|guidelines|components)\//.test(filePath)) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'AfterTool',
      additionalContext: `ADR REMINDER: The modified file is in a critical area of the design system (${filePath}). Ask the user: would you like to create an ADR to document this change? (Yes/No)`,
    },
  }));
}
