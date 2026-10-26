/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: readOffer's capability state.
import { readOffer, acceptInvite, errorIds, CmcError } from '@pryv/cmc';
import type { CapabilityState } from '@pryv/cmc';

declare const conn: any;
const seen: unknown[] = [];

export async function consumerSide (url: string): Promise<void> {
  const offer = await readOffer(url);
  const state: CapabilityState | null = offer.capabilityState;
  if (state === 'consumed' || state === 'invalidated') {
    seen.push('already answered');
    return;
  }
  if (state === 'open' || state === null) seen.push(state);
  try {
    await acceptInvite(conn, url, { scopeStreamId: ':_cmc:apps:my-app' });
  } catch (err) {
    if (err instanceof CmcError && err.id === errorIds.CAPABILITY_CONSUMED) seen.push(err.id);
    if (err instanceof CmcError && err.id === errorIds.CAPABILITY_INVALIDATED) seen.push(err.id);
  }
}
