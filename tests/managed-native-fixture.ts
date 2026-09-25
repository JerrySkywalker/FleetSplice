import type { TestContext } from 'node:test';
import { discoverCodex } from '../packages/local-operation/index.ts';

// The accepted managed driver still qualifies a historical artifact. Its
// integration tests may use an explicitly supplied official fixture instead of
// the Owner's independently updated TUI. The original managed gate still runs.
export function managedNativeFixture(context: Pick<TestContext, 'skip'>, env: NodeJS.ProcessEnv = process.env) {
  const fixture = env.FLEETSPLICE_MANAGED_TEST_CODEX;
  if (fixture === undefined) {
    context.skip('Historical managed integration requires explicit FLEETSPLICE_MANAGED_TEST_CODEX; ordinary native adoption is qualified separately.');
    return null;
  }
  // An explicitly requested missing/wrong artifact is a failure, never a skip.
  return discoverCodex([fixture]);
}
