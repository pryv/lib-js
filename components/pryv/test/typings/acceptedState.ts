/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: what an app's onStateChange
// listener may write about the ACCEPTED state.
import type { StateChange } from 'pryv';

// After a popup sign-in, the listener gets the narrowed state: no apiEndpoint, no username.
export const popup: StateChange<'ACCEPTED'> = { status: 'ACCEPTED', id: 'ACCEPTED', key: 'k1' };

// Restored or redirect path: apiEndpoint and username are there.
export const restored: StateChange<'ACCEPTED'> = {
  status: 'ACCEPTED',
  id: 'ACCEPTED',
  apiEndpoint: 'https://tok@alice.pryv.me/',
  username: 'alice'
};

export function endpointOf (state: StateChange<'ACCEPTED'>): string | null {
  // @ts-expect-error apiEndpoint may be absent (popup sign-in)
  const direct: string = state.apiEndpoint;
  // @ts-expect-error username may be absent (popup sign-in)
  const name: string = state.username;
  return state.apiEndpoint ?? (direct && name ? direct : null);
}
