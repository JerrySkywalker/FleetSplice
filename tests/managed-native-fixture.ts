import { candidateCodexPaths, discoverCodex } from '../packages/local-operation/index.ts';

// The accepted managed driver still qualifies a historical artifact. Its
// integration tests may use an explicitly supplied official fixture instead of
// the Owner's independently updated TUI. The original managed gate still runs.
export function managedNativeFixture() {
  const fixture = process.env.FLEETSPLICE_MANAGED_TEST_CODEX;
  return discoverCodex(fixture ? [fixture] : candidateCodexPaths());
}
