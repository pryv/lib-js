/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: a custom button stores the platform
// of its controller with the sign-in.
import type pryv from 'pryv';

type Controller = pryv.Auth.AuthController;
type Stored = pryv.Auth.StoredAuthorizationData;

export function toStore (auth: Controller, apiEndpoint: string, username: string): Stored {
  return { apiEndpoint, username, platform: auth.platform };
}

// stored by an earlier version
export const unbound: Stored = { apiEndpoint: 'https://tok@alice.pryv.me/', username: 'alice' };

export function change (auth: Controller): void {
  // @ts-expect-error read-only
  auth.platform = 'other';
}
