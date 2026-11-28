/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: the emails of `account.get` /
// `account.update`, with the resend cooldown of newer cores.
import type { AccountInformation as Account, AccountEmail as Email } from 'pryv';

export const pending: Email = {
  value: 'alice@example.com',
  primary: false,
  status: 'pending',
  verifiedAt: null,
  verificationMethod: null,
  verificationCooldownUntil: 1764320000
};

// a core that does not return the cooldown
export const older: Email = {
  value: 'alice@example.org',
  primary: true,
  status: 'verified',
  verifiedAt: null,
  verificationMethod: 'registration'
};

// a core without multiple emails
export const account: Account = {
  username: 'alice',
  email: 'alice@example.org',
  language: 'en',
  storageUsed: { dbDocuments: 0, attachedFiles: 0 }
};

export function cooldownOf (a: Account, value: string): number | null {
  const entry = a.emails?.find((e) => e.value === value);
  return entry?.verificationCooldownUntil ?? null;
}

export const bad: Email = {
  value: 'alice@example.net',
  primary: false,
  // @ts-expect-error not a status
  status: 'unknown',
  verifiedAt: null,
  verificationMethod: null
};
