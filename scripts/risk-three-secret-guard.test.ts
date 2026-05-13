import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const legacySecretPayloadKey = `webhook${'Secret'}`;

describe('tour request secret guard', () => {
  it('keeps legacy client secret names out of the browser contract and public GAS integration', () => {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(currentDir, '..');
    const checkedFiles = [
      path.join(repoRoot, '.env.example'),
      path.join(repoRoot, 'src', 'services', 'sendTourRequestLead.ts'),
      path.join(repoRoot, 'integrations', 'telegram-leads-gas', 'Code.gs'),
    ];
    const forbiddenPatterns = [
      `VITE_TOUR_REQUEST_WEBHOOK_${'SECRET'}`,
      `VITE_TOUR_REQUEST_WEBHOOK_${'URL'}`,
      `WEBHOOK_${'SECRET'}`,
      legacySecretPayloadKey,
    ];

    for (const filePath of checkedFiles) {
      const contents = fs.readFileSync(filePath, 'utf8');
      for (const forbiddenPattern of forbiddenPatterns) {
        expect(contents, `${filePath} should not contain ${forbiddenPattern}`).not.toContain(forbiddenPattern);
      }
    }
  });
});
