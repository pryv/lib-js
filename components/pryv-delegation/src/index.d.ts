declare module '@pryv/delegation' {
  // --- Relationship status ---
  export type RelationshipStatus = 'invite' | 'active' | 'stale';

  export const STATUS: {
    readonly INVITE: 'invite';
    readonly ACTIVE: 'active';
    readonly STALE: 'stale';
  };

  // --- Error catalogue ---
  export type DelegationErrorId =
    | 'delegation-clientdata-forbidden'
    | 'delegation-managed-resource'
    | 'delegation-reserved-stream'
    | 'delegation-unknown-username'
    | 'delegation-self-not-allowed'
    | 'delegation-delegate-mismatch'
    | 'delegation-already-exists'
    | 'delegation-delivery-failed'
    | 'delegation-genuine-login-required'
    | 'delegation-not-found'
    | 'delegation-invite-expired'
    | 'delegation-not-active'
    | 'delegation-username-taken'
    | 'delegation-unknown-core'
    | 'delegation-creation-failed'
    | 'delegation-personal-token-required'
    | 'delegation-mirror-not-stale';

  export const errorIds: {
    readonly CLIENTDATA_FORBIDDEN: 'delegation-clientdata-forbidden';
    readonly MANAGED_RESOURCE: 'delegation-managed-resource';
    readonly RESERVED_STREAM: 'delegation-reserved-stream';
    readonly UNKNOWN_USERNAME: 'delegation-unknown-username';
    readonly SELF_NOT_ALLOWED: 'delegation-self-not-allowed';
    readonly DELEGATE_MISMATCH: 'delegation-delegate-mismatch';
    readonly ALREADY_EXISTS: 'delegation-already-exists';
    readonly DELIVERY_FAILED: 'delegation-delivery-failed';
    readonly GENUINE_LOGIN_REQUIRED: 'delegation-genuine-login-required';
    readonly NOT_FOUND: 'delegation-not-found';
    readonly INVITE_EXPIRED: 'delegation-invite-expired';
    readonly NOT_ACTIVE: 'delegation-not-active';
    readonly USERNAME_TAKEN: 'delegation-username-taken';
    readonly UNKNOWN_CORE: 'delegation-unknown-core';
    readonly CREATION_FAILED: 'delegation-creation-failed';
    readonly PERSONAL_TOKEN_REQUIRED: 'delegation-personal-token-required';
    readonly MIRROR_NOT_STALE: 'delegation-mirror-not-stale';
  };

  /** Typed delegation failure surfaced by {@link Delegation} methods. */
  export class DelegationError extends Error {
    constructor(message: string, id: DelegationErrorId | string, cause?: any, data?: any);
    readonly name: 'DelegationError';
    readonly id: DelegationErrorId | string;
    readonly cause?: any;
    readonly data?: any;
  }

  // --- Records ---

  export type DelegateIdentity = {
    username: string;
    /** Host with `.` replaced by `-`. */
    hostSlug: string;
  };

  /** An entry of `listDelegates()` (B side). */
  export type DelegateRecord = {
    relId: string;
    delegate: DelegateIdentity;
    status: RelationshipStatus;
    requestedAt: number;
    activatedAt?: number | null;
    lastTokenIssuedAt?: number | null;
  };

  /** An entry of `listControlled()` (A side). */
  export type ControlledRecord = {
    relId: string;
    controlled: DelegateIdentity;
    status: RelationshipStatus;
    requestedAt: number;
    activatedAt?: number | null;
  };

  /**
   * The `delegation` record returned by `requestAttach` / `acceptAttach` /
   * `createAccount`. Shape varies by call: an invite carries `delegate` +
   * `expiresAt`; an activation carries `controlled` + `activatedAt`.
   */
  export type DelegationRecord = {
    relId: string;
    status: RelationshipStatus;
    delegate?: { username: string; hostSlug?: string };
    controlled?: { username: string; hostSlug?: string };
    requestedAt?: number;
    expiresAt?: number;
    activatedAt?: number;
  };

  export type TokenResult = {
    token: string;
    apiEndpoint: string;
  };

  export type CreateAccountParams = {
    username: string;
    email?: string;
    password?: string;
    core?: string;
    language?: string;
  };

  export type CreateAccountResult = {
    delegation: DelegationRecord;
    apiEndpoint?: string;
  };

  export type DelegationOptions = {
    /** Explicit `pryv` module (needed by `openControlled` in browser bundles). */
    pryv?: any;
  };

  /**
   * Client for the `delegations.*` API family, bound to one personal
   * `pryv.Connection`.
   */
  export class Delegation {
    constructor(connection: any, opts?: DelegationOptions);
    static fromConnection(connection: any, opts?: DelegationOptions): Delegation;
    readonly connection: any;

    // B side (the controlled account)
    requestAttach(delegateUsername: string): Promise<DelegationRecord>;
    cancelInvite(delegateUsername: string): Promise<void>;
    listDelegates(): Promise<DelegateRecord[]>;
    detachDelegate(delegateUsername: string): Promise<void>;

    // A side (the delegate)
    acceptAttach(controlledUsername: string): Promise<DelegationRecord>;
    refuseAttach(controlledUsername: string): Promise<void>;
    listControlled(): Promise<ControlledRecord[]>;
    dismissControlled(controlledUsername: string): Promise<void>;
    getToken(controlledUsername: string): Promise<TokenResult>;
    openControlled(controlledUsername: string): Promise<any>;
    createAccount(params: CreateAccountParams): Promise<CreateAccountResult>;
  }
}
