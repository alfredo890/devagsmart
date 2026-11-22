import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyWebhookSignature } from '@/lib/meta';

describe('verifyWebhookSignature', () => {
  const secret = 'test-secret';
  const body = '{"hello":"world"}';
  const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

  it('accepts valid signature', () => {
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });

  it('rejects invalid signature', () => {
    expect(verifyWebhookSignature(body, 'sha256=deadbeef', secret)).toBe(false);
  });

  it('rejects missing signature', () => {
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
  });

  it('rejects missing secret', () => {
    expect(verifyWebhookSignature(body, sig, '')).toBe(false);
  });
});
