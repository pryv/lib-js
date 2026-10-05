/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: the records listAcceptedRelationships returns.
import type { RelationshipRecord, RelationshipWithdrawal } from '@pryv/cmc';

// accept event with `content.from`
export const current: RelationshipRecord['counterparty'] = { username: 'alice', host: 'pryv.me' };
// accept event written before `from` existed: `content.acceptedBy`
export const legacy: RelationshipRecord['counterparty'] = { apiEndpoint: 'https://tok@alice.pryv.me/' };
export const none: RelationshipRecord['counterparty'] = null;

export const features: RelationshipRecord['features'] = { chat: true, systemMessaging: false };

export const known: RelationshipWithdrawal['by'] = 'peer-revoke';
// a value a newer core may write is still accepted
export const unknown: RelationshipWithdrawal['by'] = 'some-later-path';
