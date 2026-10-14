/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// Compiled (never run) by typings.test.js: the group membership helpers.
import {
  requestMembership, waitForMembership, requestMemberAccess, isMemberAccessRetryable,
  leaveMembership, acceptMembership, declineMembership, listMembers, revokeMembership,
  getSweepStatus, listSweeps, readOffer, createInvite, acceptInvite, errorIds, CmcError,
  ET_MEMBER_ACCESS, ET_MEMBER_REVOKE
} from '@pryv/cmc';
import type {
  MemberAccess, MemberRecord, MembershipRequest, SweepRecord, CmcErrorId, SweepStatus, SweepReason, MembershipApprovedBy,
  CmcRevocationRecord
} from '@pryv/cmc';

declare const conn: unknown;
const group = { username: 'practice', host: 'pryv.me' };
export const seen: unknown[] = [];

export async function memberSide (): Promise<void> {
  const req: MembershipRequest = await requestMembership(conn, {
    group, scopeStreamIds: [':_cmc:apps:practice:team-a'], appCode: 'practice', displayName: 'Dr. Who'
  });
  const link: string = req.capabilityUrl;
  const joined = await waitForMembership(conn, { group: req.group, appCode: 'practice', timeoutMs: 600000 });
  const endpoint: string | null = joined.membershipApiEndpoint;
  seen.push(link, endpoint);

  try {
    const access: MemberAccess = await requestMemberAccess(conn, {
      counterparty: { username: 'patient', host: 'other.example' },
      scopeStreamId: ':_cmc:apps:practice:team-a',
      permissions: [{ streamId: 'diary', level: 'read' }],
      expireAfter: 3600
    });
    const how: 'stamped' | 'name-only' = access.attribution;
    const expires: number = access.expires;
    seen.push(how, expires);
  } catch (err) {
    if (isMemberAccessRetryable(err)) return;
    if (err instanceof CmcError && err.id === errorIds.MEMBER_ACCESS_GRANT_NOT_DELEGABLE) return;
  }

  await leaveMembership(conn, { inviteEventId: req.inviteEventId });
  await leaveMembership(conn, { accessId: 'bc-1', scopeStreamId: ':_cmc:apps:practice' });
}

export async function adminSide (url: string): Promise<void> {
  const offer = await readOffer(url);
  const membership: boolean = offer.membership;
  const delegable: boolean = offer.accessType === 'app';
  const choice: boolean = offer.allowUserChoice;
  seen.push(membership, delegable, choice);

  const accepted = await acceptMembership(conn, url, {
    scopeStreamId: ':_cmc:apps:practice', grantedScopes: [':_cmc:apps:practice:team-a']
  });
  const id: string | null = accepted.membershipAccessId;
  seen.push(id);
  await declineMembership(conn, url, { scopeStreamId: ':_cmc:apps:practice' });

  const members: MemberRecord[] = await listMembers(conn);
  for (const m of members) {
    const { revokeEventId } = await revokeMembership(conn, { membershipAccessId: m.membershipAccessId, scopeStreamId: m.scopeStreamId ?? ':_cmc:apps:practice' });
    seen.push(revokeEventId);
  }
  const { items }: { items: SweepRecord[] } = await listSweeps(conn, { membershipAccessId: 'membership-1' });
  const one: SweepRecord = await getSweepStatus(conn, items[0].sweepEventId);
  const residual: 'deleted' | 'absent' | 'residual' | undefined = one.outcome[0]?.result;
  seen.push(residual);
}

export async function offers (): Promise<void> {
  await createInvite(conn, {
    appCode: 'practice',
    scopeStreamId: ':_cmc:apps:practice:team-a',
    displayName: 'Practice',
    requestedPermissions: [{ streamId: 'diary', level: 'read' }],
    accessType: 'app',
    allowUserChoice: true
  });
  await acceptInvite(conn, 'https://c@x/', { scopeStreamId: ':_cmc:apps:a', grantedPermissions: [{ streamId: 'diary', level: 'read' }] });
}

export const types: [typeof ET_MEMBER_ACCESS, typeof ET_MEMBER_REVOKE] = ['consent/member-access-cmc', 'consent/member-revoke-cmc'];
export const ids: CmcErrorId[] = ['cmc-member-access-in-flight', 'cmc-member-access-unsupported', 'cmc-member-access-token-missing', 'cmc-membership-offer-expected', 'cmc-offer-stream-not-offerable', 'cmc-invalidate-link-scope-mismatch'];
export const newIds: Array<typeof errorIds.OFFER_STREAM_NOT_OFFERABLE | typeof errorIds.INVALIDATE_LINK_SCOPE_MISMATCH> = [errorIds.OFFER_STREAM_NOT_OFFERABLE, errorIds.INVALIDATE_LINK_SCOPE_MISMATCH];
export const reasons: SweepReason[] = ['revoke', 'accesses.delete', 'expired', 'narrowed', 'detach', 'account-deleted', 'vanished'];

export const statuses: SweepStatus[] = ['pending', 'delivered', 'completed', 'failed'];
export function sweepDone (s: SweepRecord): boolean {
  const status: SweepStatus = s.status;
  return status === 'completed' || status === 'failed';
}
export function deletedTeams (s: SweepRecord): string[] {
  return s.reason === 'narrowed' ? s.uncovered : [];
}
export function issuedAt (r: CmcRevocationRecord): number | null {
  return r.revokedAt;
}

export const byDelegate: MembershipApprovedBy = { delegate: { username: 'admin', hostSlug: 'pryv-me' }, relId: 'rel-1' };
export const byDelegateNoHost: MembershipApprovedBy = { delegate: { username: 'admin' }, relId: 'rel-2' };
export function approver (m: MemberRecord): string | null {
  return m.approvedBy === null ? null : m.approvedBy.delegate.username + ' (' + m.approvedBy.relId + ')';
}
