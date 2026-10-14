declare module '@pryv/cmc' {
  // --- Namespace constants ---
  export const NS: ':_cmc:';
  export const NS_INBOX: ':_cmc:inbox';
  export const NS_APPS: ':_cmc:apps';
  export const NS_INTERNAL: ':_cmc:_internal';
  export const NS_INTERNAL_RETRIES: ':_cmc:_internal:retries';

  // --- Event types ---
  export const ET_REQUEST: 'consent/request-cmc';
  export const ET_ACCEPT: 'consent/accept-cmc';
  export const ET_REFUSE: 'consent/refuse-cmc';
  export const ET_REVOKE: 'consent/revoke-cmc';
  export const ET_INVALIDATE_LINK: 'consent/invalidate-link-cmc';
  export const ET_SCOPE_REQUEST: 'consent/scope-request-cmc';
  export const ET_SCOPE_UPDATE: 'consent/scope-update-cmc';
  export const ET_CHAT: 'message/chat-cmc';
  export const ET_SYSTEM_ALERT: 'notification/alert-cmc';
  export const ET_SYSTEM_ACK: 'notification/ack-cmc';
  export const ET_SYSTEM_SCOPE_REQUEST: 'consent/scope-request-cmc';
  export const ET_SYSTEM_SCOPE_UPDATE: 'consent/scope-update-cmc';
  /** Written by a member on the group's account: ask for an access on a patient's account. */
  export const ET_MEMBER_ACCESS: 'consent/member-access-cmc';
  /** Written by the server only: the record of an offboarding sweep. */
  export const ET_MEMBER_REVOKE: 'consent/member-revoke-cmc';
  export const EVENT_TYPES_LIFECYCLE: readonly string[];
  export const EVENT_TYPES_CHAT: readonly string[];
  export const EVENT_TYPES_SYSTEM: readonly string[];

  // --- Slug helpers ---
  export const SEPARATOR: '--';

  export type CmcActor = {
    username: string;
    host: string;
  };

  export type CmcCounterpartySlugInput = {
    username: string;
    host: string;
  };

  export type CmcParsedCounterpartySlug = {
    username: string;
    /** Host with `.` replaced by `-`. Lossy — store the canonical host alongside if needed. */
    hostSlug: string;
  };

  export type CmcParsedStreamId = {
    appCode: string | null;
    /** The :_cmc:apps:<app-code>[:...] prefix above the chats/collectors segment. */
    scopeStreamId: string;
    counterpartySlug: string;
    counterparty: CmcParsedCounterpartySlug;
  };

  export function slugifyHost(host: string): string;
  export function counterpartySlug(params: CmcCounterpartySlugInput): string;
  export function parseCounterpartySlug(slug: string): CmcParsedCounterpartySlug;

  // --- Stream-id builders ---
  export function appScope(appCode: string): string;
  export function chatsParentUnder(scopeStreamId: string): string;
  export function chatStreamUnder(scopeStreamId: string, slug: string): string;
  export function collectorsParentUnder(scopeStreamId: string): string;
  export function collectorStreamUnder(scopeStreamId: string, slug: string): string;

  // --- Classification + parsing ---
  export function isCmcStreamId(streamId: string): boolean;
  export function isAppNestedPluginStream(streamId: string): boolean;
  export function getAppCode(streamId: string): string | null;
  export function parseChatStreamId(streamId: string): CmcParsedStreamId | null;
  export function parseCollectorStreamId(streamId: string): CmcParsedStreamId | null;

  // --- Error catalogue ---
  export type CmcErrorId =
    | 'cmc-capability-invalid'
    | 'cmc-capability-consumed'
    | 'cmc-capability-invalidated'
    | 'cmc-capability-already-accepted-by-you'
    | 'cmc-capability-timeout'
    | 'cmc-capability-empty'
    | 'cmc-capability-multiple-offers'
    | 'cmc-capability-ttl-out-of-range'
    | 'cmc-capability-no-expiry-not-allowed'
    | 'cmc-handler-missing-capability-url'
    | 'cmc-handler-offer-missing-capability-id'
    | 'cmc-offer-empty-permissions'
    | 'cmc-handler-wrong-type'
    | 'cmc-handler-threw'
    | 'cmc-handler-offer-read-failed'
    | 'cmc-handler-counterparty-unknown'
    | 'cmc-handler-data-grant-create-failed'
    | 'cmc-handler-data-grant-no-apiendpoint'
    | 'cmc-handler-build-data-grant-failed'
    | 'cmc-back-channel-create-failed'
    | 'cmc-handler-delivery-threw'
    | 'cmc-handler-delivery-rejected'
    | 'cmc-handler-delivery-failed'
    | 'cmc-chat-stream-not-chat'
    | 'cmc-chat-counterparty-access-not-found'
    | 'cmc-chat-no-remote-apiendpoint'
    | 'cmc-chat-no-remote-chat-stream'
    | 'cmc-member-access-not-member'
    | 'cmc-member-access-relationship-not-found'
    | 'cmc-member-access-scope-outside-membership'
    | 'cmc-member-access-permissions-not-subset'
    | 'cmc-member-access-expiry-out-of-range'
    | 'cmc-member-access-rate-limited'
    | 'cmc-member-access-in-flight'
    | 'cmc-membership-permissions-invalid'
    | 'cmc-member-stamp-invalid'
    | 'cmc-member-access-grant-not-delegable'
    | 'cmc-member-access-peer-rejected'
    | 'cmc-member-access-peer-unreachable'
    | 'cmc-member-access-membership-gone'
    | 'cmc-member-access-not-retryable'
    | 'cmc-member-revoke-residual'
    | 'cmc-member-channel-not-supported'
    | 'cmc-member-access-unsupported'
    | 'cmc-member-access-token-missing'
    | 'cmc-membership-offer-expected'
    | 'cmc-offer-stream-not-offerable'
    | 'cmc-invalidate-link-scope-mismatch';

  export const errorIds: {
    readonly CAPABILITY_INVALID: 'cmc-capability-invalid';
    readonly CAPABILITY_CONSUMED: 'cmc-capability-consumed';
    readonly CAPABILITY_INVALIDATED: 'cmc-capability-invalidated';
    readonly CAPABILITY_ALREADY_ACCEPTED_BY_YOU: 'cmc-capability-already-accepted-by-you';
    readonly CAPABILITY_TIMEOUT: 'cmc-capability-timeout';
    readonly CAPABILITY_EMPTY: 'cmc-capability-empty';
    readonly CAPABILITY_MULTIPLE_OFFERS: 'cmc-capability-multiple-offers';
    readonly CAPABILITY_TTL_OUT_OF_RANGE: 'cmc-capability-ttl-out-of-range';
    readonly CAPABILITY_NO_EXPIRY_NOT_ALLOWED: 'cmc-capability-no-expiry-not-allowed';
    readonly HANDLER_MISSING_CAPABILITY_URL: 'cmc-handler-missing-capability-url';
    readonly HANDLER_OFFER_MISSING_CAPABILITY_ID: 'cmc-handler-offer-missing-capability-id';
    readonly OFFER_EMPTY_PERMISSIONS: 'cmc-offer-empty-permissions';
    readonly HANDLER_WRONG_TYPE: 'cmc-handler-wrong-type';
    readonly HANDLER_THREW: 'cmc-handler-threw';
    readonly HANDLER_OFFER_READ_FAILED: 'cmc-handler-offer-read-failed';
    readonly HANDLER_COUNTERPARTY_UNKNOWN: 'cmc-handler-counterparty-unknown';
    readonly SELF_ACCEPT_FORBIDDEN: 'cmc-self-accept-forbidden';
    readonly HANDLER_DATA_GRANT_CREATE_FAILED: 'cmc-handler-data-grant-create-failed';
    readonly HANDLER_DATA_GRANT_NO_APIENDPOINT: 'cmc-handler-data-grant-no-apiendpoint';
    readonly HANDLER_BUILD_DATA_GRANT_FAILED: 'cmc-handler-build-data-grant-failed';
    readonly BACK_CHANNEL_CREATE_FAILED: 'cmc-back-channel-create-failed';
    readonly HANDLER_DELIVERY_THREW: 'cmc-handler-delivery-threw';
    readonly HANDLER_DELIVERY_REJECTED: 'cmc-handler-delivery-rejected';
    readonly HANDLER_DELIVERY_FAILED: 'cmc-handler-delivery-failed';
    readonly CHAT_STREAM_NOT_CHAT: 'cmc-chat-stream-not-chat';
    readonly CHAT_COUNTERPARTY_ACCESS_NOT_FOUND: 'cmc-chat-counterparty-access-not-found';
    readonly CHAT_NO_REMOTE_APIENDPOINT: 'cmc-chat-no-remote-apiendpoint';
    readonly CHAT_NO_REMOTE_CHAT_STREAM: 'cmc-chat-no-remote-chat-stream';
    readonly SCOPE_REQUEST_NOT_FOUND: 'cmc-scope-request-not-found';
    readonly SCOPE_REQUEST_NOT_FROM_PEER: 'cmc-scope-request-not-from-peer';
    readonly SCOPE_REQUEST_STREAM_MISMATCH: 'cmc-scope-request-stream-mismatch';
    readonly SCOPE_REQUEST_EXPIRED: 'cmc-scope-request-expired';
    readonly SCOPE_REQUEST_ALREADY_ANSWERED: 'cmc-scope-request-already-answered';
    readonly SCOPE_REQUEST_INVALID: 'cmc-scope-request-invalid';
    readonly SCOPE_UPDATE_TARGET_NOT_COUNTERPARTY: 'cmc-scope-update-target-not-counterparty';
    readonly SCOPE_UPDATE_NOTHING_TO_APPLY: 'cmc-scope-update-nothing-to-apply';
    readonly SCOPE_UPDATE_LOCAL_APPLY_FAILED: 'cmc-scope-update-local-apply-failed';
    readonly SCOPE_UPDATE_NOT_APPLIED: 'cmc-scope-update-not-applied';
    readonly SCOPE_UPDATE_OUTCOME_UNKNOWN: 'cmc-scope-update-outcome-unknown';
    readonly SCOPE_REQUEST_DELIVERY_PENDING: 'cmc-scope-request-delivery-pending';
    readonly HANDLER_MISSING_CAPABILITY_ID: 'cmc-handler-missing-capability-id';
    readonly CHAT_DISABLED: 'cmc-chat-disabled';
    readonly SYSTEM_MESSAGING_DISABLED: 'cmc-system-messaging-disabled';
    readonly CLIENTDATA_CMC_FORBIDDEN: 'cmc-clientdata-cmc-forbidden';
    readonly RESERVED_STREAM_UNDELETABLE: 'cmc-reserved-stream-undeletable';
    readonly COUNTERPARTY_IDENTITY_MISSING: 'cmc-counterparty-identity-missing';
    readonly ACCEPT_REQUIRES_PERSONAL_TOKEN: 'cmc-accept-requires-personal-token';
    readonly CAPABILITY_OFFER_TOO_LARGE: 'cmc-capability-offer-too-large';
    readonly GRANTED_PERMISSIONS_NOT_SUBSET: 'cmc-granted-permissions-not-subset';
    readonly HANDLER_DATA_GRANT_NAME_CONFLICT: 'cmc-handler-data-grant-name-conflict';
    readonly HANDLER_DELEGATION_ENDED: 'cmc-handler-delegation-ended';
    readonly INSUFFICIENT_PERMISSIONS: 'cmc-insufficient-permissions';
    readonly MANDATORY_PERMISSION_REFUSED: 'cmc-mandatory-permission-refused';
    readonly OFFER_INVALID_ACCESS_TYPE: 'cmc-offer-invalid-access-type';
    readonly OFFER_INVALID_PERMISSIONS: 'cmc-offer-invalid-permissions';
    /** An offer asks a stream the server manages on the accepter's account (inbox, internal subtree, chats / collectors leaf, `:_cmc:apps` root); reported on the accept trigger. */
    readonly OFFER_STREAM_NOT_OFFERABLE: 'cmc-offer-stream-not-offerable';
    /** `consent/invalidate-link-cmc` written on a stream that does not hold the invite it names. */
    readonly INVALIDATE_LINK_SCOPE_MISMATCH: 'cmc-invalidate-link-scope-mismatch';
    readonly PROTECTED_EVENT_WRITE: 'cmc-protected-event-write';
    readonly REVOKE_DELETE_FAILED: 'cmc-revoke-delete-failed';
    readonly REVOKE_DELIVERY_FAILED: 'cmc-revoke-delivery-failed';
    readonly REVOKE_FORBIDDEN: 'cmc-revoke-forbidden';
    readonly REVOKE_NO_PEER_ENDPOINT: 'cmc-revoke-no-peer-endpoint';
    readonly SCOPE_UPDATE_TARGET_STREAM_MISMATCH: 'cmc-scope-update-target-stream-mismatch';
    readonly USER_CHOICE_NOT_ALLOWED: 'cmc-consent-user-choice-not-allowed';
    // Group membership: refused at write (`error.data.id`)
    readonly MEMBER_ACCESS_NOT_MEMBER: 'cmc-member-access-not-member';
    readonly MEMBER_ACCESS_RELATIONSHIP_NOT_FOUND: 'cmc-member-access-relationship-not-found';
    readonly MEMBER_ACCESS_SCOPE_OUTSIDE_MEMBERSHIP: 'cmc-member-access-scope-outside-membership';
    readonly MEMBER_ACCESS_PERMISSIONS_NOT_SUBSET: 'cmc-member-access-permissions-not-subset';
    readonly MEMBER_ACCESS_EXPIRY_OUT_OF_RANGE: 'cmc-member-access-expiry-out-of-range';
    readonly MEMBER_ACCESS_RATE_LIMITED: 'cmc-member-access-rate-limited';
    readonly MEMBER_ACCESS_IN_FLIGHT: 'cmc-member-access-in-flight';
    readonly MEMBERSHIP_PERMISSIONS_INVALID: 'cmc-membership-permissions-invalid';
    readonly MEMBER_STAMP_INVALID: 'cmc-member-stamp-invalid';
    // Group membership: recorded on the trigger (`content.failure.reason`)
    readonly MEMBER_ACCESS_GRANT_NOT_DELEGABLE: 'cmc-member-access-grant-not-delegable';
    readonly MEMBER_ACCESS_PEER_REJECTED: 'cmc-member-access-peer-rejected';
    readonly MEMBER_ACCESS_PEER_UNREACHABLE: 'cmc-member-access-peer-unreachable';
    readonly MEMBER_ACCESS_MEMBERSHIP_GONE: 'cmc-member-access-membership-gone';
    readonly MEMBER_ACCESS_NOT_RETRYABLE: 'cmc-member-access-not-retryable';
    readonly MEMBER_REVOKE_RESIDUAL: 'cmc-member-revoke-residual';
    readonly MEMBER_CHANNEL_NOT_SUPPORTED: 'cmc-member-channel-not-supported';
    /** Client-side: the group's core answered without a member access and without a failure. */
    readonly MEMBER_ACCESS_UNSUPPORTED: 'cmc-member-access-unsupported';
    /** Client-side: the core created the access but the answer arrived without the token; ask again. */
    readonly MEMBER_ACCESS_TOKEN_MISSING: 'cmc-member-access-token-missing';
    /** Client-side: `acceptMembership` was given an ordinary offer. */
    readonly MEMBERSHIP_OFFER_EXPECTED: 'cmc-membership-offer-expected';
  };

  /** Typed CMC failure surfaced by Level-1 functions. */
  export class CmcError extends Error {
    constructor(message: string, id: CmcErrorId | string, cause?: any);
    readonly name: 'CmcError';
    readonly id: CmcErrorId | string;
    readonly cause?: any;
  }

  // --- Level-1: protocol records ---

  /**
   * What a core reports on the request event. `pending` / `delivered`: still
   * open. Single-use: `accepted`, `refused` (the link is not consumed, it may
   * still be accepted), `revoked`. Open-link: `invalidated`; an open-link invite
   * stays `pending` / `delivered` while it accepts joiners. `expired` is
   * derived client-side. `completed` / `failed` are not produced for invites by
   * current cores.
   */
  export type InviteStatus = 'pending' | 'delivered' | 'accepted' | 'completed' | 'refused' | 'revoked' | 'invalidated' | 'expired' | 'failed';
  export type CapabilityMode = 'single-use' | 'open-link';
  export type PermissionLevel = 'read' | 'contribute' | 'manage' | 'create-only';
  export type Permission = { streamId: string; level: PermissionLevel };

  /**
   * A permission as it appears in an OFFER, with the consent-layer
   * annotations the server has enforced since 2026-07:
   *
   *   mandatory  `mandatory: true` : the accepter must grant it
   *   opt-out    neither flag      : optional, consent UI pre-selects it
   *   opt-in     `optIn: true`     : optional, consent UI does NOT
   *
   * Both are display/offer-layer only: they are stripped before the
   * data-grant access is minted, so they never appear on a granted
   * permission. Setting both on one entry is rejected.
   */
  export type OfferedPermission = Permission & {
    mandatory?: boolean;
    optIn?: boolean;
  };

  export type InviteRecord = {
    inviteEventId: string;
    capabilityUrl: string | null;
    mode: CapabilityMode;
    status: InviteStatus;
    expiresAt: number | null;
    /** Single-use: who accepted (or refused). Null for open-link: see listInviteAccepters. */
    counterparty?: { username: string; host: string; displayName?: string } | null;
    acceptedAt?: number | null;
    /** Single-use, once accepted: the back-channel access of the relationship. */
    backChannelAccessId?: string | null;
    scopeStreamId: string;
  };

  export type InviteAccepter = {
    username: string;
    host: string;
    acceptedAt: number | null;
    backChannelAccessId: string;
    scopeStreamId: string | null;
  };

  export type RelationshipRecord = {
    acceptEventId: string;
    /**
     * The other side (`content.from`). An accept event written before `from`
     * existed gives `{ apiEndpoint }` (`content.acceptedBy`) instead; null
     * when neither is there.
     */
    counterparty: { username: string; host: string; displayName?: string } | { apiEndpoint: string } | null;
    dataGrantAccessId: string | null;
    backChannelAccessId?: string | null;
    appCode: string | null;
    scopeStreamId: string;
    acceptedAt: number | null;
    features: { chat: boolean; systemMessaging: boolean };
    /**
     * Set by the server when the relationship has ended; null while it is
     * active. Listed only with `includeWithdrawn: true`.
     */
    withdrawal: RelationshipWithdrawal | null;
  };

  /**
   * How a relationship ended, as the server records it on the accept event
   * (`content.withdrawal`). Written by the server only, never overwritten.
   */
  export type RelationshipWithdrawal = {
    /** Seconds since the epoch. */
    at: number;
    /**
     * What ended it: `'accesses.delete'` (the data grant was deleted),
     * `'revoke-cmc'` (a revoke written on this account), `'peer-revoke'`
     * (the counterparty revoked), `'delegation-detach'` (a delegation detach).
     */
    by: 'accesses.delete' | 'revoke-cmc' | 'peer-revoke' | 'delegation-detach' | (string & {});
    /** The data grant that was deleted. */
    accessId?: string;
    /** The revoke event, for `'revoke-cmc'` and `'peer-revoke'`. */
    revokeEventId?: string;
    /** The delegation relationship, for `'delegation-detach'`. */
    relId?: string;
  };

  // --- Level-1: provider side ---

  export function createInvite(conn: any, params: {
    appCode: string;
    scopeStreamId: string;
    displayName: string;
    requestedPermissions: OfferedPermission[];
    /**
     * Default false: the accepter may only grant the whole set or refuse.
     * true lets them grant a subset, except `mandatory` entries.
     */
    allowUserChoice?: boolean;
    mode?: CapabilityMode;
    title?: Record<string, string>;
    description?: Record<string, string>;
    consent?: Record<string, string>;
    features?: { chat?: boolean; systemMessaging?: boolean };
    /**
     * Unix seconds; omit for the 7-day default. Server bounds: single-use
     * [60s, 30d], open-link at least 60s with no upper bound. `null` (open-link
     * only) requests no expiry; an older core mints the 7-day default instead.
     */
    expiresAt?: number | null;
    /**
     * Access type of the grant minted on accept. Default `'shared'`; `'app'` makes it
     * delegable (the requester may create sub-accesses from it, as group member
     * accesses require).
     */
    accessType?: 'shared' | 'app';
    to?: string | null;
    requesterMeta?: { displayName?: string; appId?: string; appUrl?: string };
  }): Promise<{ inviteEventId: string; capabilityUrl: string; mode: CapabilityMode; expiresAt: number | null }>;

  export function listInvites(conn: any, params?: {
    scopeStreamId?: string;
    limit?: number;
  }): Promise<{ items: InviteRecord[]; truncated: boolean }>;

  export function getInviteStatus(conn: any, inviteEventId: string): Promise<InviteRecord>;

  /** Who has joined an invite and is still joined (needs a token that can list accesses). */
  export function listInviteAccepters(conn: any, params: { inviteEventId: string }): Promise<{ items: InviteAccepter[] }>;

  /**
   * Revoke a relationship (provider side). Two ways to identify the
   * relationship:
   *   1. `{ accessId, scopeStreamId, reason? }` — power-user path.
   *   2. `{ inviteEventId, scopeStreamId?, reason? }` — convenience path;
   *      derives `accessId` from the matching inbox accept event.
   */
  export function revokeRelationship(conn: any, params:
    | { accessId: string; scopeStreamId: string; reason?: Record<string, string> }
    | { inviteEventId: string; scopeStreamId?: string; reason?: Record<string, string> }
  ): Promise<void>;

  export function invalidateCapability(conn: any, params: {
    inviteEventId: string;
    scopeStreamId?: string;
    reason?: Record<string, string>;
  }): Promise<void>;

  export function proposeScopeUpdate(conn: any, params: {
    collectorStreamId: string;
    newPermissions: OfferedPermission[];
    message?: Record<string, string>;
    expires?: number;
    waitForDelivery?: boolean;
    deliveryTimeoutMs?: number;
    deliveryPollIntervalMs?: number;
  }): Promise<{
    /** Collector-side trigger id. Not answerable by the user. */
    scopeRequestEventId: string;
    /** The request's id on the user's account: what the user side answers. Null when not waiting. */
    remoteScopeRequestEventId: string | null;
    status: string;
  }>;

  // --- Level-1: consumer side ---

  export function readOffer(capabilityUrl: string, opts?: { pryv?: any }): Promise<{
    requester: { username: string | null; host: string; displayName?: string };
    consent?: Record<string, string>;
    requestedPermissions: OfferedPermission[];
    /** Whether the accepter may grant a subset (default false; always true for a membership). */
    allowUserChoice: boolean;
    /** `'app'`: the grant would be delegable (the requester may create sub-accesses from it). */
    accessType: 'shared' | 'app';
    /** True when the requester asks to join the accepter's group (see `acceptMembership`). */
    membership: boolean;
    mode: CapabilityMode;
    features: { chat?: boolean; systemMessaging?: boolean };
  }>;

  /**
   * Accept an offer. `opts.scopeStreamId` is REQUIRED — must be an
   * `:_cmc:apps:<app>[:...]` stream on the accepter's account. Do not
   * pass `:_cmc:inbox` (which routes through the peer-delivered path).
   */
  /**
   * Requester-side dual of `acceptInvite`'s Phase 2 wait — poll for the
   * accepter's `consent/accept-cmc` arrival on `:_cmc:inbox`. Returns
   * the data the requester needs to actually USE the access (the
   * accepter's data-grant apiEndpoint, the accepter's identity, etc).
   */
  export function waitForAccept(conn: any, opts: {
    fromUsername?: string;
    fromHost?: string;
    appCode?: string;
    sinceTime?: number;
    timeoutMs?: number;
    intervalMs?: number;
  }): Promise<{
    acceptInboxEventId: string;
    grantedAccessApiEndpoint: string | null;
    counterparty: { username: string; host: string } | null;
    features: { chat?: boolean; systemMessaging?: boolean };
  }>;

  export function acceptInvite(conn: any, capabilityUrl: string, opts: {
    scopeStreamId: string;
    extra?: { chat?: boolean; systemMessaging?: boolean };
    accessName?: string;
    /**
     * Grant only this subset of the offer (the offer must allow user choice;
     * `mandatory` entries cannot be left out). Omit to grant the whole offer.
     */
    grantedPermissions?: Permission[];
    waitForCompletion?: boolean;
    completionTimeoutMs?: number;
    completionPollIntervalMs?: number;
  }): Promise<
    | { acceptEventId: string; dataGrantAccessId: string | null; counterparty: any; features: any; status: string }
    | { acceptEventId: string; dataGrantAccessId: string | null; counterparty: any; features: any }
  >;

  /**
   * Refuse an offer. `opts.scopeStreamId` is REQUIRED — same constraints
   * as `acceptInvite`.
   */
  export function refuseInvite(conn: any, capabilityUrl: string, opts: {
    scopeStreamId: string;
    reason?: Record<string, string>;
  }): Promise<{ refuseEventId: string }>;

  export function revokeAcceptance(conn: any, params: {
    scopeStreamId: string;
    accessId: string;
    reason?: Record<string, string>;
  }): Promise<void>;

  export function listAcceptedRelationships(conn: any, params?: {
    scopeStreamId?: string;
    /** Most accept events read, withdrawn ones included (default 1000). */
    limit?: number;
    /**
     * Default false: relationships that have ended (`withdrawal` set) are
     * left out. Needs a core that records withdrawals; on an older one,
     * ended relationships still look active.
     */
    includeWithdrawn?: boolean;
  }): Promise<RelationshipRecord[]>;

  // --- Level-1: cross-direction ---

  export function sendChat(conn: any, params: {
    scopeStreamId: string;
    peerSlug: string;
    content: string;
  }): Promise<{ chatEventId: string }>;

  export function sendSystemAlert(conn: any, params: {
    scopeStreamId: string;
    peerSlug: string;
    level?: 'info' | 'warning' | 'critical';
    title: Record<string, string>;
    body: Record<string, string>;
    ackRequired?: boolean;
    ackId?: string;
  }): Promise<{ alertEventId: string }>;

  export function sendSystemAck(conn: any, params: {
    scopeStreamId: string;
    peerSlug: string;
    alertEventId: string;
    ackId: string;
  }): Promise<{ ackEventId: string }>;

  export type CmcScopeUpdateWaitOptions = {
    waitForCompletion?: boolean;
    completionTimeoutMs?: number;
    completionPollIntervalMs?: number;
  };

  export type CmcScopeUpdateAcceptResult = {
    updateAcceptEventId: string;
    /** 'pending' when waitForCompletion is false; the fields below are then absent. */
    status: string;
    dataGrantAccessId?: string | null;
    /** @deprecated same value as dataGrantAccessId. */
    newDataGrantAccessId?: string | null;
    /** The user-facing permission set now in force on the grant. */
    newPermissions?: Permission[];
    /** False when the grant changed but the collector could not be told yet. */
    peerNotified?: boolean;
    deliveryFailure?: { reason: string; detail?: any };
  };

  /** `scopeRequestEventId` is the request's id on this (the user's) account. Throws CmcError when nothing was applied. */
  export function acceptScopeUpdate(conn: any, scopeRequestEventId: string, opts?: {
    scopeStreamId?: string;
  } & CmcScopeUpdateWaitOptions): Promise<CmcScopeUpdateAcceptResult>;

  export function refuseScopeUpdate(conn: any, scopeRequestEventId: string, opts?: {
    scopeStreamId?: string;
    reason?: Record<string, string>;
  } & CmcScopeUpdateWaitOptions): Promise<{
    updateRefuseEventId: string;
    status: string;
    /** False when the refusal is recorded but the collector has not been told yet. */
    peerNotified?: boolean;
    deliveryFailure?: { reason: string; detail?: any };
  }>;

  // --- Group membership ---

  /** Member side: a membership request ready to hand to a group administrator. */
  export type MembershipRequest = {
    inviteEventId: string;
    /** Show as a QR code or link to an administrator, who opens it with `acceptMembership`. */
    capabilityUrl: string;
    mode: CapabilityMode;
    expiresAt: number | null;
    group: CmcActor;
  };

  export function requestMembership(conn: any, params: {
    group: CmcActor;
    /** Team streams on the GROUP's account (`:_cmc:apps:<app>[:<path>]`, not chats/collectors). */
    scopeStreamIds: string[];
    appCode: string;
    /** How the member is shown to the administrator. */
    displayName: string;
    /** Stream on the member's own account where the request is written (default `:_cmc:apps:<appCode>`). */
    scopeStreamId?: string;
    title?: Record<string, string>;
    description?: Record<string, string>;
    consent?: Record<string, string>;
    /**
     * Default `{ chat: false, systemMessaging: true }`. A membership never has chat:
     * the server treats `chat` as false whatever is sent.
     */
    features?: { chat?: boolean; systemMessaging?: boolean };
    expiresAt?: number;
    requesterMeta?: { displayName?: string; appId?: string; appUrl?: string };
  }): Promise<MembershipRequest>;

  export function waitForMembership(conn: any, opts: {
    group: CmcActor;
    appCode?: string;
    sinceTime?: number;
    timeoutMs?: number;
    intervalMs?: number;
  }): Promise<{
    acceptInboxEventId: string;
    /** The member's access on the group's account. Carries a token. */
    membershipApiEndpoint: string | null;
    group: CmcActor | null;
    features: { chat?: boolean; systemMessaging?: boolean };
  }>;

  /** An access on a patient's account, returned once by the group's core. */
  export type MemberAccess = {
    /** The `consent/member-access-cmc` trigger on the group's account. */
    triggerEventId: string | null;
    /** Carries a token: never stored by the server; do not log it. */
    apiEndpoint: string;
    accessId: string;
    name: string;
    /** Seconds since the epoch. */
    expires: number;
    /** `'name-only'`: the patient's core predates the member stamp; only the access name names the member. */
    attribution: 'stamped' | 'name-only';
  };

  export function requestMemberAccess(conn: any, params: {
    /** The patient. */
    counterparty: CmcActor;
    /** Team stream the trigger is written on (default `scopeStreamId`). */
    streamId?: string;
    /** The patient relationship's scope: `streamId` or a stream under it (default `streamId`). */
    scopeStreamId?: string;
    /** Stream permissions only; default: the offer's streams at `read`. */
    permissions?: Permission[];
    /** Seconds; bounded by the core (60 s to 7 days by default, 24 h when omitted). */
    expireAfter?: number;
  }): Promise<MemberAccess>;

  /** True for `cmc-member-access-in-flight` and `cmc-member-access-peer-unreachable`: ask again shortly. */
  export function isMemberAccessRetryable(err: unknown): boolean;

  export function leaveMembership(conn: any, params:
    | { inviteEventId: string; scopeStreamId?: string; reason?: Record<string, string> }
    | { accessId: string; scopeStreamId: string; reason?: Record<string, string> }
  ): Promise<void>;

  export function acceptMembership(conn: any, capabilityUrl: string, opts: {
    /** Group's `:_cmc:apps:<app>[:...]` stream where the accept lands. */
    scopeStreamId: string;
    /** Team stream ids to grant, a subset of those requested (default: all). */
    grantedScopes?: string[];
    accessName?: string;
    waitForCompletion?: boolean;
    completionTimeoutMs?: number;
    completionPollIntervalMs?: number;
    pryv?: any;
  }): Promise<{
    acceptEventId: string;
    membershipAccessId: string | null;
    member: { username: string | null; host: string | null; displayName?: string };
    /** Present when `waitForCompletion` is false. */
    status?: string;
  }>;

  export function declineMembership(conn: any, capabilityUrl: string, opts: {
    scopeStreamId: string;
    reason?: Record<string, string>;
  }): Promise<{ refuseEventId: string }>;

  /** Recorded on a membership a delegate of the group account accepted. */
  export type MembershipApprovedBy = {
    delegate: { username: string; hostSlug?: string };
    /** The delegation relationship. */
    relId: string;
  };

  export type MemberRecord = {
    membershipAccessId: string;
    member: { username: string | null; host: string | null };
    appCode: string | null;
    /** Group's stream of the membership relationship (where `revokeMembership` writes). */
    scopeStreamId: string | null;
    /** Team streams the membership holds. */
    scopes: Permission[];
    /** Team streams the member asked for. */
    requestedScopes: string[];
    /** The delegate that approved it; null when the owner did. */
    approvedBy: MembershipApprovedBy | null;
    acceptEventId: string | null;
    created: number | null;
    expires: number | null;
  };

  export function listMembers(conn: any): Promise<MemberRecord[]>;

  export function revokeMembership(conn: any, params: {
    membershipAccessId: string;
    scopeStreamId: string;
    reason?: Record<string, string>;
  }): Promise<{ revokeEventId: string }>;

  /** `'vanished'`: the membership access was found gone by the server's periodic check while accesses minted for the member remained. */
  export type SweepReason = 'revoke' | 'accesses.delete' | 'expired' | 'narrowed' | 'detach' | 'account-deleted' | 'vanished';

  /** `'pending'` when the record does not say. */
  export type SweepStatus = 'pending' | 'delivered' | 'completed' | 'failed';

  /** An offboarding sweep (`consent/member-revoke-cmc`), written by the server. */
  export type SweepRecord = {
    sweepEventId: string;
    member: CmcActor | null;
    membershipAccessId: string | null;
    reason: SweepReason | (string & {}) | null;
    status: SweepStatus;
    failure: { reason: string; detail?: any } | null;
    records: Array<{ relationshipAccessId: string; counterparty: CmcActor; childAccessId: string; expires: number }>;
    outcome: Array<{ childAccessId: string; result: 'deleted' | 'absent' | 'residual'; reason?: string }>;
    residuals: Array<{ counterparty: CmcActor; childAccessId: string; expires: number; reason: string }>;
    /** On a `'narrowed'` sweep caused by the deletion of a team stream: the stream(s) deleted (empty otherwise). */
    uncovered: string[];
    scopeStreamId: string | null;
    time: number | null;
  };

  export function getSweepStatus(conn: any, sweepEventId: string): Promise<SweepRecord>;

  export function listSweeps(conn: any, params?: {
    scopeStreamId?: string;
    membershipAccessId?: string;
    limit?: number;
  }): Promise<{ items: SweepRecord[]; truncated: boolean }>;

  // --- Accept hand-off (app-web-user-account) ---

  /**
   * Common shape for both requestAcceptUrl + requestAccept. authUrl is
   * the full `/cmc-accept` URL on the deployed app-web-user-account.
   */
  export type CmcRequestAcceptOptions = {
    authUrl: string;
    pryvApi: string;
    capabilityUrl: string;
    scopeStreamId: string;
    accessName?: string;
    returnUrl?: string;
  };

  export type CmcRequestAcceptResult = {
    ok: boolean;
    acceptEventId?: string;
    reason?: string;
    redirected?: boolean;
  };

  export function requestAcceptUrl(opts: CmcRequestAcceptOptions): string;

  export function requestAccept(
    opts: CmcRequestAcceptOptions & {
      mode?: 'popup' | 'redirect';
      popupFeatures?: string;
      timeoutMs?: number;
      /**
       * Popup mode: also require the result message to come from this origin. Any absolute
       * URL, reduced to its origin (case, trailing slash and default port do not matter);
       * an unparsable value rejects with `cmc-invalid-expected-origin`. Recommended whenever
       * the account app's origin is known.
       */
      expectedOrigin?: string;
    }
  ): Promise<CmcRequestAcceptResult>;

  // --- Scope-update accept hand-off ---

  export type CmcRequestScopeUpdateOptions = {
    authUrl: string;
    pryvApi: string;
    /** The request's id on the user's account (`remoteScopeRequestEventId`). */
    scopeRequestEventId: string;
    scopeStreamId?: string;
    returnUrl?: string;
  };

  export type CmcRequestScopeUpdateResult = {
    ok: boolean;
    updateEventId?: string;
    action?: 'accept' | 'refuse';
    reason?: string;
    redirected?: boolean;
    /** Set by pages that report it: false when the change was applied but the collector not yet told. */
    peerNotified?: boolean;
  };

  export function requestScopeUpdateUrl(opts: CmcRequestScopeUpdateOptions): string;

  export function requestScopeUpdate(
    opts: CmcRequestScopeUpdateOptions & {
      mode?: 'popup' | 'redirect';
      popupFeatures?: string;
      timeoutMs?: number;
      /**
       * Popup mode: also require the result message to come from this origin. Any absolute
       * URL, reduced to its origin (case, trailing slash and default port do not matter);
       * an unparsable value rejects with `cmc-invalid-expected-origin`. Recommended whenever
       * the account app's origin is known.
       */
      expectedOrigin?: string;
    }
  ): Promise<CmcRequestScopeUpdateResult>;

  // --- Revocation arrivals ---

  /**
   * A `consent/revoke-cmc` arrival, keyed on identifiers the RECEIVING account
   * holds. `peerAccessId` is the withdrawing side's own access id and matches
   * nothing locally. `side` and `localAccessId` are null against a server that
   * predates the receiver-side enrichment, or for a relationship too old to
   * carry either stamp; `scopeStreamId` is then what to match on.
   */
  export type CmcRevocationRecord = {
    eventId: string | null;
    from: { username?: string; host?: string } | null;
    reason: Record<string, string> | null;
    side: 'requester' | 'accepter' | null;
    /** The access on THIS account that served the relationship. */
    localAccessId: string | null;
    /** Local accesses the teardown already deleted; their tokens are dead. */
    revokedAccessIds: string[];
    scopeStreamId: string | null;
    inviteEventId: string | null;
    offerEventId: string | null;
    acceptEventId: string | null;
    /** The withdrawing side's access id on THEIR account. Not a local handle. */
    peerAccessId: string | null;
    /** When the withdrawing side issued the revoke (seconds); null against an older peer. */
    revokedAt: number | null;
    /**
     * Set (`'relationship-re-established'`) when the receiving server dropped
     * this late notice because the relationship was re-established since:
     * nothing was torn down. Ignore the arrival and keep your endpoints;
     * `revocationMatches` returns false for it. Null when the notice was acted
     * upon, and against an older server.
     */
    superseded: 'relationship-re-established' | (string & {}) | null;
    time: number | null;
  };

  export function revocationFromEvent(event: any): CmcRevocationRecord;

  /**
   * True when `relationship` is the one the revocation refers to.
   *
   * The most specific identifier the two sides share decides, and nothing falls
   * through past it: `accessId` (vs `localAccessId` or a member of
   * `revokedAccessIds`), then `acceptEventId`, `offerEventId`, `inviteEventId`,
   * `scopeStreamId`. On an OPEN (multi-use) invite link, `inviteEventId` and
   * `scopeStreamId` name the link rather than the subject, so every accepter's
   * relationship shares them: pass the per-relationship `accessId`, or add the
   * `from` filter, when one link serves several subjects.
   *
   * `from` is a filter, not a match: a mismatch returns false before any tier,
   * and agreement alone never proves a match.
   *
   * A superseded record (`record.superseded` set) returns false for every
   * relationship: the notice ended nothing.
   */
  export function revocationMatches(
    record: CmcRevocationRecord,
    relationship: {
      accessId?: string;
      inviteEventId?: string;
      offerEventId?: string;
      acceptEventId?: string;
      scopeStreamId?: string;
      from?: { username?: string; host?: string };
    }
  ): boolean;

  // --- Observation scopes (for use with `new pryv.Monitor(conn, scope)`) ---

  export const scopes: {
    inbox(params?: { appCode?: string }): { streams: string[] };
    chats(params: { appCode?: string; peerSlug?: string; scopeStreamId?: string }): { streams: string[] };
    collectors(params: { appCode?: string; peerSlug?: string; scopeStreamId?: string }): { streams: string[] };
  };
}
