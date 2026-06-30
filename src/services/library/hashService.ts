import crypto from 'node:crypto';

export class HashService {
  public calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
