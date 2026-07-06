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
    | 'cmc-chat-no-remote-chat-stream';

  export const errorIds: {
    readonly CAPABILITY_INVALID: 'cmc-capability-invalid';
    readonly CAPABILITY_CONSUMED: 'cmc-capability-consumed';
    readonly CAPABILITY_INVALIDATED: 'cmc-capability-invalidated';
    readonly CAPABILITY_ALREADY_ACCEPTED_BY_YOU: 'cmc-capability-already-accepted-by-you';
    readonly CAPABILITY_TIMEOUT: 'cmc-capability-timeout';
    readonly CAPABILITY_EMPTY: 'cmc-capability-empty';
    readonly CAPABILITY_MULTIPLE_OFFERS: 'cmc-capability-multiple-offers';
    readonly HANDLER_MISSING_CAPABILITY_URL: 'cmc-handler-missing-capability-url';
    readonly HANDLER_OFFER_MISSING_CAPABILITY_ID: 'cmc-handler-offer-missing-capability-id';
    readonly OFFER_EMPTY_PERMISSIONS: 'cmc-offer-empty-permissions';
    readonly HANDLER_WRONG_TYPE: 'cmc-handler-wrong-type';
    readonly HANDLER_THREW: 'cmc-handler-threw';
    readonly HANDLER_OFFER_READ_FAILED: 'cmc-handler-offer-read-failed';
    readonly HANDLER_COUNTERPARTY_UNKNOWN: 'cmc-handler-counterparty-unknown';
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
  };

  /** Typed CMC failure surfaced by Level-1 functions. */
  export class CmcError extends Error {
    constructor(message: string, id: CmcErrorId | string, cause?: any);
    readonly name: 'CmcError';
    readonly id: CmcErrorId | string;
    readonly cause?: any;
  }

  // --- Level-1: protocol records ---

  export type InviteStatus = 'pending' | 'delivered' | 'accepted' | 'completed' | 'refused' | 'revoked' | 'invalidated' | 'expired' | 'failed';
  export type CapabilityMode = 'single-use' | 'open-link';
  export type PermissionLevel = 'read' | 'contribute' | 'manage' | 'create-only';
  export type Permission = { streamId: string; level: PermissionLevel };

  export type InviteRecord = {
    inviteEventId: string;
    capabilityUrl: string | null;
    mode: CapabilityMode;
    status: InviteStatus;
    expiresAt: number | null;
    counterparty?: { username: string; host: string; displayName?: string } | null;
    acceptedAt?: number | null;
    scopeStreamId: string;
  };

  export type RelationshipRecord = {
    acceptEventId: string;
    counterparty: { username: string; host: string; displayName?: string } | null;
    dataGrantAccessId: string | null;
    backChannelAccessId?: string | null;
    appCode: string | null;
    scopeStreamId: string;
    acceptedAt: number | null;
    features: { chat: boolean; system: boolean };
  };

  // --- Level-1: provider side ---

  export function createInvite(conn: any, params: {
    appCode: string;
    scopeStreamId: string;
    displayName: string;
    requestedPermissions: Permission[];
    mode?: CapabilityMode;
    title?: Record<string, string>;
    description?: Record<string, string>;
    consent?: Record<string, string>;
    features?: { chat?: boolean; systemMessaging?: boolean };
    expiresAt?: number;
    to?: string | null;
    requesterMeta?: { displayName?: string; appId?: string; appUrl?: string };
  }): Promise<{ inviteEventId: string; capabilityUrl: string; mode: CapabilityMode; expiresAt: number }>;

  export function listInvites(conn: any, params?: {
    scopeStreamId?: string;
    limit?: number;
  }): Promise<{ items: InviteRecord[]; truncated: boolean }>;

  export function getInviteStatus(conn: any, inviteEventId: string): Promise<InviteRecord>;

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
    newPermissions: Permission[];
    message?: Record<string, string>;
    expires?: number;
  }): Promise<{ scopeRequestEventId: string }>;

  // --- Level-1: consumer side ---

  export function readOffer(capabilityUrl: string, opts?: { pryv?: any }): Promise<{
    requester: { username: string | null; host: string; displayName?: string };
    consent?: Record<string, string>;
    requestedPermissions: Permission[];
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
    waitForCompletion?: boolean;
    completionTimeoutMs?: number;
    completionPollIntervalMs?: number;
  }): Promise<
    | { acceptEventId: string; dataGrantAccessId: string | null; status: 'pending' }
    | { acceptEventId: string; dataGrantAccessId: string | null; dataGrantApiEndpoint: string | null; counterparty: any; features: any }
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
    limit?: number;
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

  export function acceptScopeUpdate(conn: any, scopeRequestEventId: string, opts?: {
    scopeStreamId?: string;
  }): Promise<{ updateAcceptEventId: string; newDataGrantAccessId: string | null }>;

  export function refuseScopeUpdate(conn: any, scopeRequestEventId: string, opts?: {
    scopeStreamId?: string;
    reason?: Record<string, string>;
  }): Promise<{ updateRefuseEventId: string }>;

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
    dataGrantApiEndpoint?: string;
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
    }
  ): Promise<CmcRequestAcceptResult>;

  // --- Scope-update accept hand-off ---

  export type CmcRequestScopeUpdateOptions = {
    authUrl: string;
    pryvApi: string;
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
  };

  export function requestScopeUpdateUrl(opts: CmcRequestScopeUpdateOptions): string;

  export function requestScopeUpdate(
    opts: CmcRequestScopeUpdateOptions & {
      mode?: 'popup' | 'redirect';
      popupFeatures?: string;
      timeoutMs?: number;
    }
  ): Promise<CmcRequestScopeUpdateResult>;

  // --- Observation scopes (for use with `new pryv.Monitor(conn, scope)`) ---

  export const scopes: {
    inbox(params?: { appCode?: string }): { streams: string[] };
    chats(params: { appCode?: string; peerSlug?: string; scopeStreamId?: string }): { streams: string[] };
    collectors(params: { appCode?: string; peerSlug?: string; scopeStreamId?: string }): { streams: string[] };
  };
}
