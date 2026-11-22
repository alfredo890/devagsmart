import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, maskSecret } from '@/lib/crypto';

describe('crypto', () => {
  it('roundtrips plaintext', () => {
    const plain = 'secret-token-123';
    const enc = encrypt(plain);
    expect(enc).not.toBe(plain);
    expect(decrypt(enc)).toBe(plain);
  });

  it('masks secrets', () => {
    expect(maskSecret('abcd1234efgh')).toBe('abcd••••efgh');
  });
});
