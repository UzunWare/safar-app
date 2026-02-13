/**
 * Sound Separation Tests
 *
 * Story 7.3: Sound Settings - Task 5
 * Verifies architectural boundary: pronunciation audio (useAudio) operates
 * independently of soundEnabled setting, while quiz sounds respect it.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Sound Effects vs Pronunciation Separation (AC #2)', () => {
  it('useAudio hook has no dependency on soundEnabled or useSettingsStore', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../lib/hooks/useAudio.ts'),
      'utf8'
    );
    expect(source).not.toContain('useSettingsStore');
    expect(source).not.toContain('soundEnabled');
  });

  it('useQuizSounds hook depends on useSettingsStore.soundEnabled', () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../lib/hooks/useQuizSounds.ts'),
      'utf8'
    );
    expect(source).toContain('useSettingsStore');
    expect(source).toContain('soundEnabled');
  });
});
