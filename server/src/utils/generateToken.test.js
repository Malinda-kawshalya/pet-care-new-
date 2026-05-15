import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import generateToken from './generateToken.js';

describe('generateToken util', () => {
  it('returns a JWT string and decodes to include id', () => {
    const token = generateToken('test-user-1');
    expect(typeof token).toBe('string');

    // verify using default secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    expect(decoded).toHaveProperty('id', 'test-user-1');
  });
});
