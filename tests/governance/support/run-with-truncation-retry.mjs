// Bounded retry helper working around a known Node.js / audit-tokens.js bug
// (https://github.com/gnegreiros-ux/agentica-design-system/issues/118):
// process.exit(1) right after a burst of console.log can truncate stdout
// on POSIX pipes before the buffer is fully flushed, under I/O
// backpressure. The exit CODE itself is unaffected — confirmed empirically
// (40 runs of a synthetic repro: exit code correct in all 40 runs, 4 of
// which had truncated stdout) — only the printed diagnostic text can be
// incomplete.
//
// This retries ONLY when the captured output looks genuinely truncated:
// neither the caller's expected pattern nor the script's own terminal
// "CI: failed" line is present. It never retries unconditionally — a run
// that completes (either line present) but is missing the expected
// pattern is a real mismatch and fails immediately on the first attempt,
// rather than being retried away.

export function runWithTruncationRetry(runOnce, expectedPattern, maxAttempts = 3) {
  let last = { threw: false, output: '' };
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    last = runOnce();
    const looksComplete = last.output.includes(expectedPattern) || last.output.includes('CI: failed');
    if (looksComplete) {
      return last;
    }
  }
  return last;
}
