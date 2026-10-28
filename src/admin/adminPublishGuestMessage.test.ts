import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import { adminPublishGuestMessage } from './adminPublishGuestMessage';

describe('adminPublishGuestMessage', () => {
  it('uses live copy when catalog mirror is up', () => {
    expect(adminPublishGuestMessage('up')).toBe(ADMIN_UI.publishedLive);
  });

  it('uses after-deploy copy when mirror is down or unknown', () => {
    expect(adminPublishGuestMessage('down')).toBe(ADMIN_UI.publishedAfterDeploy);
    expect(adminPublishGuestMessage(undefined)).toBe(ADMIN_UI.publishedAfterDeploy);
  });
});
