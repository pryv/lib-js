/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: the requested-permissions check
// of the sign-in from stored credentials, as an app reads it.
import pryv, { Auth } from 'pryv';
import type { StateChange, AuthRequestedPermission, AccessInfo } from 'pryv';

export function onInitialized (state: StateChange<'INITIALIZED'>): AuthRequestedPermission[] {
  if (state.reasonId === 'MISSING_PERMISSIONS') return state.missingPermissions ?? [];
  // @ts-expect-error not a reason the controller gives
  const other: StateChange<'INITIALIZED'>['reasonId'] = 'SOMETHING_ELSE';
  return other == null ? [] : [];
}

export function onAccepted (state: StateChange<'ACCEPTED'>): number {
  return state.missingPermissions?.length ?? 0;
}

export function check (requested: AuthRequestedPermission[], info: AccessInfo): boolean {
  return Auth.missingPermissions(requested, info).length === 0 &&
    pryv.Auth.missingPermissions(requested, null).length === 0;
}
