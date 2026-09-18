declare module 'pryv' {
  type Timestamp = number;
  type Identifier = string;

  /**
   * Common metadata returned by all API responses
   * @see https://api.pryv.com/reference/#in-method-results
   */
  export type ApiMeta = {
    /** API version in format {major}.{minor}.{revision} */
    apiVersion: string;
    /** Current server time as Unix timestamp in seconds */
    serverTime: Timestamp;
    /** Serial that changes when core or register is updated */
    serial: string;
  };
  export type PermissionLevel = 'read' | 'contribute' | 'manage' | 'create-only';
  export type KeyValue = { [key: string]: string | number };

  export type Attachment = {
    id: Identifier;
    fileName: string;
    type: string;
    size: number;
    readToken: string;
  };

  export type Stream = {
    id: Identifier;
    name: string;
    parentId?: Identifier;
    clientData?: KeyValue;
    children: Stream[];
    trashed?: boolean;
    created: Timestamp;
    createdBy: Identifier;
    modified: Timestamp;
    modifiedBy: Identifier;
  };

  export type Event = {
    id: Identifier;
    streamIds: Identifier[];
    streamId: Identifier;
    time: Timestamp;
    duration?: Timestamp;
    type: string;
    content?: any;
    tags?: string[];
    description?: string;
    attachments?: Attachment[];
    clientData?: KeyValue;
    trashed?: boolean;
    created: Timestamp;
    createdBy: Identifier;
    modified: Timestamp;
    modifiedBy: Identifier;
  };

  export type Permission = {
    streamId: Identifier;
    level: PermissionLevel;
    feature?: 'selfRevoke';
    setting?: 'forbidden';
  };

  export type Access = {
    id: Identifier;
    token: string;
    type?: 'personal' | 'app' | 'shared';
    name: string;
    deviceName?: string;
    permissions: Permission[];
    lastUsed?: Timestamp;
    expireAfter?: number;
    expires?: Timestamp;
    deleted?: Timestamp;
    clientData?: KeyValue;
    created: Timestamp;
    createdBy: Identifier;
    modified: Timestamp;
    modifiedBy: Identifier;
    apiEndpoint: string;
  };

  type FollowedSlice = {
    id: Identifier;
    name: string;
    url: string;
    accessToken: string;
  };

  export type AccountInformation = {
    username: string;
    email: string;
    language: string;
    storageUsed: {
      dbDocuments: number;
      attachedFiles: number;
    };
  };

  export type HFSeries = {
    format: 'flatJSON';
    fields: string[];
    points: Array<Array<number | string>>;
  };

  /**
   * Response from adding data points to an HF series event
   * @see https://api.pryv.com/reference/#add-hf-series-data-points
   */
  export type HFSeriesAddResult = {
    status: 'ok';
    meta: ApiMeta;
  };

  type Run = {
    status: number;
    timestamp: Timestamp;
  };

  export type WebHook = {
    id: Identifier;
    accessId: Identifier;
    url: string;
    minIntervalMs: number;
    maxRetries: number;
    currentRetries: number;
    state: 'active' | 'inactive';
    runCount: number;
    failCount: number;
    lastRun: Run;
    runs: Run[];
    created: Timestamp;
    createdBy: Identifier;
    modified: Timestamp;
    modifiedBy: Identifier;
  };

  export type ItemDeletion = {
    id: Identifier;
    deleted?: Timestamp;
  };

  export type Error = {
    id: string;
    message: string;
    data?: any;
    subErrors?: Error[];
  };

  /**
   * Custom error class for Pryv library errors.
   *
   * - `innerObject`: legacy field, set by the 2-arg constructor.
   * - `id` / `status` / `response`: structured fields populated by
   *   `PryvError.fromApiResponse(response, body)` for errors that came
   *   from a Pryv API call. All three are `undefined` for legacy errors.
   */
  export class PryvError extends globalThis.Error {
    constructor(message: string, innerObject?: globalThis.Error | object);
    name: 'PryvError';
    innerObject?: globalThis.Error | object;
    id?: string;
    status?: number;
    response?: { body: any; status: number };
    static fromApiResponse(response: Response, body?: any): PryvError;
  }

  /**
   * Thrown by `Service.login` when the platform returned `{ mfaToken }`
   * instead of `{ token }`. Carries the `mfaToken` so the consumer can
   * call `Service.mfaVerify(userId, err.mfaToken, code)` after prompting
   * the user for their code. `method` (when present) says which factor to
   * prompt for: `'totp'` (authenticator app) or `'sms'`.
   */
  export class MfaRequiredError extends PryvError {
    constructor(mfaToken: string, response: Response, body?: any);
    name: 'MfaRequiredError';
    mfaToken: string;
    method?: 'totp' | 'sms' | string;
  }

  /** Catalogue of Pryv API error ids (mirrors open-pryv.io ErrorIds.js). */
  export const ERRORS: {
    readonly API_UNAVAILABLE: 'api-unavailable';
    readonly CORRUPTED_DATA: 'corrupted-data';
    readonly FORBIDDEN: 'forbidden';
    readonly INVALID_ACCESS_TOKEN: 'invalid-access-token';
    readonly INVALID_CREDENTIALS: 'invalid-credentials';
    readonly UNSUPPORTED_OPERATION: 'unsupported-operation';
    readonly INVALID_EVENT_TYPE: 'invalid-event-type';
    readonly INVALID_ITEM_ID: 'invalid-item-id';
    readonly INVALID_METHOD: 'invalid-method';
    readonly INVALID_OPERATION: 'invalid-operation';
    readonly INVALID_PARAMETERS_FORMAT: 'invalid-parameters-format';
    readonly INVALID_REQUEST_STRUCTURE: 'invalid-request-structure';
    readonly ITEM_ALREADY_EXISTS: 'item-already-exists';
    readonly MISSING_HEADER: 'missing-header';
    readonly UNEXPECTED_ERROR: 'unexpected-error';
    readonly UNKNOWN_REFERENCED_RESOURCE: 'unknown-referenced-resource';
    readonly UNKNOWN_RESOURCE: 'unknown-resource';
    readonly UNSUPPORTED_CONTENT_TYPE: 'unsupported-content-type';
    readonly TOO_MANY_RESULTS: 'too-many-results';
    readonly GONE: 'removed-method';
    readonly UNAVAILABLE_METHOD: 'unavailable-method';
    readonly INVALID_INVITATION_TOKEN: 'invitationToken-invalid';
    readonly INVALID_USERNAME: 'username-invalid';
    readonly USERNAME_REQUIRED: 'username-required';
    readonly INVALID_EMAIL: 'email-invalid';
    readonly INVALID_LANGUAGE: 'language-invalid';
    readonly INVALID_APP_ID: 'appid-invalid';
    readonly INVALID_PASSWORD: 'password-invalid';
    readonly INVALID_REFERER: 'referer-invalid';
    readonly EMAIL_REQUIRED: 'email-required';
    readonly PASSWORD_REQUIRED: 'password-required';
    readonly MISSING_REQUIRED_FIELD: 'missing-required-field';
    readonly NEW_PASSWORD_FIELD_IS_REQUIRED: 'newPassword-required';
    readonly DENIED_STREAM_ACCESS: 'denied-stream-access';
    readonly TOO_HIGH_ACCESS_FOR_SYSTEM_STREAMS: 'too-high-access-for-account-stream';
    readonly FORBIDDEN_MULTIPLE_ACCOUNT_STREAMS: 'forbidden-multiple-account-streams-events';
    readonly FORBIDDEN_ACCOUNT_EVENT_MODIFICATION: 'forbidden-none-editable-account-streams';
    readonly FORBIDDEN_TO_CHANGE_ACCOUNT_STREAM_ID: 'forbidden-change-account-streams-id';
    readonly FORBIDDEN_TO_EDIT_NONEDITABLE_ACCOUNT_FIELDS: 'forbidden-to-edit-noneditable-account-fields';
    readonly UNKNOWN_USER: 'unknown-user';
    readonly UNKNOWN_EMAIL: 'unknown-email';
  };

  export type CreateUserOptions = {
    username: string;
    password: string;
    email: string;
    /** Hosting key (from `flatHostings()`) or the literal `'auto'` */
    hosting: string;
    appId: string;
    language?: string;
    invitationToken?: string;
    referer?: string;
  };

  export type HostingItem = {
    key: string;
    name: string;
    description: string;
    region: string;
    zone: string;
    availableCore: string;
    available: boolean;
  };

  export type StreamsQuery = {
    any?: Identifier[];
    all?: Identifier[];
    not?: Identifier[];
  };

  /**
   * Condition on a JSON path of events' `content` or `clientData`.
   * `path` is a dot-path (segments: [a-zA-Z0-9_:-]) or `$` for the root
   * value; exactly one operator per condition. Conditions AND together.
   * Server support is advertised by `features.contentQueries` (see
   * `Service.supportsContentQueries()`).
   */
  export type ContentQueryCondition = { path: string } & (
    | { eq: string | number | boolean }
    | { neq: string | number | boolean }
    | { in: Array<string | number | boolean> }
    | { exists: boolean }
    | { gt: number } | { gte: number } | { lt: number } | { lte: number }
    | { prefix: string }
  );

  export type EventQueryParams = {
    fromTime: Timestamp;
    toTime: Timestamp;
    streams: string[];
    tags: string[];
    types: string[];
    running: boolean;
    sortAscending: boolean;
    skip: number;
    limit: number;
    state: 'default' | 'trashed' | 'all';
    modifiedSince: Timestamp;
    includeDeletion: boolean;
    content: ContentQueryCondition[];
    clientData: ContentQueryCondition[];
  };

  export type EventQueryParamsStreamQuery = Omit<EventQueryParams, 'streams'> & {
    streams: string[] | StreamsQuery;
  };

  export type EditMetadata = 'created' | 'createdBy' | 'modified' | 'modifiedBy';

  export type APICallMethods = {
    // mfa
    'mfa.challenge': {
      params: null;
      res: {
        message: string;
      };
    };
    'mfa.recover': {
      params: {
        recoveryCode: string;
        username: string;
        password: string;
        appId: string;
      };
      res: {
        message: string;
      };
    };

    // events
    'events.get': {
      params: Partial<EventQueryParamsStreamQuery>;
      res: {
        eventDeletions?: ItemDeletion[];
        events: Event[];
      };
    };
    'events.getOne': {
      params: {
        id: Identifier;
        includeHistory?: boolean;
      };
      res: {
        event: Event;
        history?: Event[];
      };
    };
    'events.create': {
      params: Partial<Omit<Event, 'attachments' | EditMetadata>>;
      res: {
        event: Event;
      };
    };
    'events.update': {
      params: {
        id: Identifier;
        update: Partial<Omit<Event, 'id' | 'attachments' | EditMetadata>>;
      };
      res: {
        event: Event;
      };
    };
    'events.deleteAttachment': {
      params: {
        id: Identifier;
        fileId: Identifier;
      };
      res: {
        event: Event;
      };
    };
    'events.delete': {
      params: {
        id: Identifier;
      };
      res: {
        event: Event;
      };
    };

    // HFS
    'hfs.create': {
      params: Partial<Omit<Event, 'attachments' | EditMetadata>>;
      res: {
        event: Event;
      };
    };
    'hfs.update': {
      params: {
        id: Identifier;
        update: Partial<Omit<Event, 'id' | 'attachments' | EditMetadata>>;
      };
      res: {
        event: Event;
      };
    };
    'hfs.delete': {
      params: {
        id: Identifier;
      };
      res: {
        event: Event;
      };
    };

    // Streams
    'streams.get': {
      params: {
        parentId?: Identifier;
        state?: 'default' | 'all';
        includeDeletionsSince?: Timestamp;
      };
      res: {
        streams: Stream[];
        streamDeletions?: ItemDeletion[];
      };
    };
    'streams.create': {
      params: Partial<Omit<Stream, 'children' | EditMetadata>>;
      res: {
        stream: Stream;
      };
    };
    'streams.update': {
      params: {
        id: Identifier;
        update: Partial<Stream>;
      };
      res: {
        stream: Stream;
      };
    };
    'streams.delete': {
      params: {
        id: Identifier;
        mergeEventsWithParents: 'true' | 'false';
      };
      res: {
        stream: Stream;
      };
    };

    // Accesses
    'accesses.get': {
      params: {
        includeExpired?: boolean;
        includeDeletions?: boolean;
      };
      res: {
        accesses: Access[];
        accessDeletions?: Access[];
      };
    };
    'accesses.create': {
      params: Partial<
        Omit<Access, 'id' | 'lastUsed' | 'expires' | 'deleted' | EditMetadata>
      >;
      res: {
        access: Access;
      };
    };
    'accesses.delete': {
      params: {
        id: Identifier;
      };
      res: {
        accessDeletion: ItemDeletion;
        relatedDeletions?: ItemDeletion[];
      };
    };
    'accesses.checkApp': {
      params: {
        requestingAppId: string;
        deviceName?: string;
        requestedPermissions: Array<Permission & { defaultName: string }>;
      };
      res: {
        checkedPermissions?: Permission[];
        mismatchingAccess?: Access;
        matchingAccess?: Access;
      };
    };
    getAccessInfo: {
      params: null;
      res: {
        calls: KeyValue;
        user: KeyValue;
      };
    };

    // Webhooks
    'webhooks.get': {
      params: null;
      res: {
        webhooks: WebHook[];
      };
    };
    'webhooks.getOne': {
      params: {
        id: Identifier;
      };
      res: {
        webhook: WebHook;
      };
    };
    'webhooks.create': {
      params: {
        webhook: Partial<Pick<WebHook, 'url' | 'state'>>;
      };
      res: {
        webhook: WebHook;
      };
    };
    'webhooks.update': {
      params: {
        id: Identifier;
        update: Partial<Pick<WebHook, 'state'>>;
      };
      res: {
        webhook: WebHook;
      };
    };
    'webhooks.delete': {
      params: {
        id: Identifier;
      };
      res: {
        webhookDeletion: ItemDeletion;
      };
    };
    'webhooks.test': {
      params: {
        id: Identifier;
      };
      res: {
        webhook: WebHook;
      };
    };

    // Followed Slices
    'followedSlices.get': {
      params: null;
      res: {
        followedSlices: FollowedSlice[];
      };
    };
    'followedSlices.create': {
      params: Partial<Pick<FollowedSlice, 'name' | 'url' | 'accessToken'>>;
      res: {
        followedSlice: FollowedSlice;
      };
    };
    'followedSlices.update': {
      params: {
        id: Identifier;
        update: Partial<Pick<FollowedSlice, 'name' | 'url' | 'accessToken'>>;
      };
      res: {
        followedSlice: FollowedSlice;
      };
    };
    'followedSlices.delete': {
      params: {
        id: Identifier;
      };
      res: {
        followedSliceDeletion: ItemDeletion;
      };
    };

    // Profile sets
    'profile.getApp': {
      params: null;
      res: {
        profile: KeyValue;
      };
    };
    'profile.updateApp': {
      params: {
        update: KeyValue;
      };
      res: {
        profile: KeyValue;
      };
    };
    'profile.getPublic': {
      params: null;
      res: {
        profile: KeyValue;
      };
    };
    'profile.updatePublic': {
      params: {
        update: KeyValue;
      };
      res: {
        profile: KeyValue;
      };
    };
    'profile.getPrivate': {
      params: null;
      res: {
        profile: KeyValue;
      };
    };
    'profile.updatePrivate': {
      params: {
        update: KeyValue;
      };
      res: {
        profile: KeyValue;
      };
    };

    // Account management
    'account.get': {
      params: null;
      res: {
        account: AccountInformation;
      };
    };
    'account.update': {
      params: {
        update: Partial<Omit<AccountInformation, 'username'>>;
      };
      res: {
        account: AccountInformation;
      };
    };
    'account.changePassword': {
      params: {
        oldPassword: string;
        newPassword: string;
      };
      res: null;
    };
    'account.requestPasswordReset': {
      params: {
        appId: string;
      };
      res: null;
    };
    'account.resetPassword': {
      params: {
        resetToken: string;
        newPassword: string;
        appId: string;
      };
      res: null;
    };
  };

  type UnionToIntersection<U> = (
    U extends any ? (k: U) => any : never
  ) extends (k: infer I) => any
    ? I
    : never;
  type APICallResultUnion = APICallMethods[keyof APICallMethods]['res'];
  type APICallResultTypes = UnionToIntersection<
    NonNullable<APICallResultUnion>
  >;

  type PossibleError = {
    error?: Error;
  };

  type APICallResult<K extends keyof APICallMethods> =
    APICallMethods[K]['res'] & PossibleError;

  export type APICallResultHandler<K extends keyof APICallMethods> = (
    result: APICallResult<K>, apicall: APICall<K>
  ) => Promise<any>;
  export type StreamedEventsHandler = (event: Event) => void;

  export type StreamedEventsResult = {
    eventsCount?: number;
    eventsDeletionsCount?: number;
    meta: ApiMeta;
  };

  export type EventFileCreationParams = Partial<
    Omit<Event, 'attachments' | EditMetadata>
  >;
  export type APICall<K extends keyof APICallMethods = keyof APICallMethods> =
    K extends keyof APICallMethods
      ? {
          method: K;
          params: APICallMethods[K]['params'];
          handleResult?: APICallResultHandler<K>;
        }
      : never;

  export type TypedAPICallResult = APICallResultTypes & PossibleError;

  export type APICallProgressHandler = (percentage: number) => void;

  export type AccessInfo =  Access & {
    calls: KeyValue;
    user: KeyValue;
    /**
     * Present when the access works through account delegation: a delegate
     * token or an access granted through it (`isDelegatedAccess`, with
     * `grantedVia: 'app'` for an app access granted by the delegate), or the
     * control access of a delegation (`kind: 'control'`).
     */
    delegation?: {
      isDelegatedAccess?: true;
      kind?: 'control';
      controlledUsername: string;
      delegate: { username: string; hostSlug?: string };
      grantedVia?: 'app';
    };
  }

  export type EventAPICallRes = {
    event?: Event;
  } & PossibleError;

  export class Connection {
    constructor (apiEndpoint: string, service?: Service);
    get service(): Service;
    username(): Promise<string>;
    api<Calls extends APICall[] = APICall[]>(
      apiCalls: Calls,
      progress?: APICallProgressHandler,
    ): Promise<Array<TypedAPICallResult>>;
    apiOne<T extends keyof APICallMethods>(
      method: T, 
      params: APICallMethods[T]['params'], 
    ): Promise<APICallMethods[T]['res']>;
    apiOne<T extends keyof APICallMethods, U extends keyof APICallMethods[T]['res']>(
      method: T, 
      params: APICallMethods[T]['params'], 
      expectedKey: U
    ): Promise<APICallMethods[T]['res'][U]>;
    getEventsStreamed(
      queryParams: Partial<EventQueryParamsStreamQuery>,
      forEachEvent: StreamedEventsHandler,
    ): Promise<StreamedEventsResult>;
    /**
     * Latest event per value for a content path (form-prefill lookup).
     * Pages internally; requires server content-query support.
     */
    getLatestByContent(
      path: string,
      values: Array<string | number | boolean>,
      baseQuery?: Partial<EventQueryParamsStreamQuery>,
    ): Promise<Map<string | number | boolean, Event>>;
    createEventWithFile(
      params: EventFileCreationParams,
      filePath: string | Buffer | Blob,
    ): Promise<EventAPICallRes>;
    createEventWithFormData(
      params: EventFileCreationParams,
      formData: FormData,
    ): Promise<EventAPICallRes>;
    createEventWithFileFromBuffer(
      params: EventFileCreationParams,
      bufferData: string | Buffer | Blob,
      filename: string,
    ): Promise<EventAPICallRes>;
    addPointsToHFEvent(
      eventId: Identifier,
      fields: string[],
      points: Array<Array<number | string>>,
    ): Promise<HFSeriesAddResult>;
    /** Memoized; pass `forceRefresh: true` to bypass + refresh the cache. */
    accessInfo(forceRefresh?: boolean): Promise<AccessInfo>;
    /** Update an access by composite id. */
    updateAccess(id: string, changes: object): Promise<object>;
    /** Fetch an access including its full version history. */
    getAccessWithHistory(id: string): Promise<{ access: object, current?: string, history?: object[] }>;
    revoke(throwOnFail?: boolean, usingConnection?: Connection): Promise<any>;
    readonly deltaTime: number;
    readonly apiEndpoint: string;
    readonly token: string | null;
    readonly endpoint: string;
    options: { chunkSize: number };

    post(
      path: string,
      data: Object | any[],
    ): Promise<Object | Object[]>;
    get(path: string, queryParams?: Object): Promise<Object | Object[]>;

    /** @internal */
    _chunkedBatchCall(
      apiCalls: APICall[],
      progress?: APICallProgressHandler,
      httpHandler?: (batch: any[]) => Promise<any>
    ): Promise<any[]>;
  }

  /**
   * A {@link Connection} whose access token is DPoP-sender-constrained
   * (RFC 9449): every request carries a fresh proof signed with `keyPair`
   * and presents the token under the `DPoP` scheme. Built by
   * {@link OAuth2Client} with `dpop: true`, or directly from an apiEndpoint
   * whose token was bound to `keyPair`.
   */
  export class SignedConnection extends Connection {
    constructor (apiEndpoint: string, keyPair: CryptoKeyPair, service?: Service);
  }

  export type serviceCustomizations = {
    name?: string;
    assets?: {
      definitions?: string;
    };
  };

  export type ServiceInfo = {
    register: string;
    access: string;
    api: string;
    name: string;
    home: string;
    support: string;
    terms: string;
    eventTypes: string;
    version?: string;
    /** Root URL of the platform's account app, when the platform names one. */
    account?: string;
    assets?: {
      definitions: string;
    };
    serial?: string;
    features?: {
      noHF?: boolean;
      /** Account delegation is available on this platform. */
      delegation?: boolean;
      [key: string]: any;
    };
  };

  export type AssetsConfig = {
    baseUrl: string;
    href: string;
    favicon: {
      [key: string]: string;
      default: string;
    };
    css: {
      [key: string]: string;
      default: string;
    };
    'lib-js': {
      [key: string]: KeyValue | any;
    };

    [key: string]: any;
  };

  export class ServiceAssets {
    static setup(pryvServiceAssetsSourceUrl: string): Promise<ServiceAssets>;
    get(keyPath?: string): any;
    getUrl(keyPath?: string): string;
    relativeURL(url: string): string;
    setAllDefaults(): Promise<void>;
    setFavicon(): void;
    loadCSS(): Promise<void>;
    loginButtonLoadCSS(): Promise<void>;
    loginButtonGetHTML(): Promise<string>;
    loginButtonGetMessages(): Promise<KeyValue>;
  }

  export class Service {
    constructor (
      serviceInfoUrl: string,
      serviceCustomizations?: serviceCustomizations,
    );
    info(forceFetch?: boolean): Promise<ServiceInfo>;
    setServiceInfo(serviceInfo: Partial<ServiceInfo>): void;
    assets(forceFetch?: boolean): Promise<ServiceAssets | null>;
    infoSync(): ServiceInfo | null;
    apiEndpointFor(username: string, token?: string): Promise<string>;
    login(
      username: string,
      password: string,
      appId: string,
      originHeader?: string,
    ): Promise<Connection>;

    supportsHF(): Promise<boolean>;
    /** Whether the platform supports events.get content/clientData query conditions. */
    supportsContentQueries(): Promise<boolean>;
    isDnsLess(): Promise<boolean>;

    userExists(userId: string): Promise<boolean>;
    userIdForEmail(email: string): Promise<string | null>;
    availableHostings(): Promise<any>;
    flatHostings(): Promise<HostingItem[]>;
    createUser(opts: CreateUserOptions): Promise<{ username: string; apiEndpoint: string }>;
    requestPasswordReset(userId: string, appId: string): Promise<void>;
    resetPassword(userId: string, newPassword: string, resetToken: string, appId: string): Promise<void>;
    mfaChallenge(userId: string, mfaToken: string): Promise<void>;
    mfaVerify(userId: string, mfaToken: string, code: string): Promise<Connection>;

    startAccessRequest(authRequest: AuthSettings['authRequest']): Promise<{
      key: string;
      authUrl: string;
      poll: string;
      pollRateMs: number;
      /** Echoed only by a core that understood `authRequest.consent`. */
      consent?: AuthRequestConsentForm;
    }>;
    pollAccessRequest(keyOrPollUrl: string): Promise<any>;
    /**
     * Resolve an auth-flow polling `key` (from {@link Service.startAccessRequest})
     * into a working {@link Connection}. Polls the access request once; throws a
     * {@link PryvError} unless the access is `ACCEPTED`.
     */
    connectFromKey(key: string): Promise<Connection>;

    static buildAPIEndpoint(
      serviceInfo: ServiceInfo,
      username: string,
      token?: string,
    ): string;
  }

  /**
   * Module-level convenience over {@link Service#connectFromKey}: builds a
   * transient {@link Service} for `serviceInfoUrl`, fetches its info, and
   * resolves the auth-flow polling `key` into a working {@link Connection}.
   * Mirrors the `pryv.connectFromKey(key, serviceInfoUrl)` shape the headless
   * polling pattern documents.
   */
  export function connectFromKey(
    key: string,
    serviceInfoUrl: string,
    serviceCustomizations?: serviceCustomizations,
  ): Promise<Connection>;

  export type AuthRequestedPermission = {
    streamId: Identifier;
    defaultName: string;
    level: PermissionLevel;
  };

  /**
   * How the consent screen should present each requested permission.
   *
   * The lists name permission ids: a stream permission's `streamId`, a
   * feature permission's `feature`. Together they give three words for
   * what an entry means to the user:
   *
   *   mandatory  listed in `mandatory` : required; cannot be unticked
   *   opt-out    in neither list       : optional, shown pre-selected
   *   opt-in     listed in `optIn`     : optional, shown NOT pre-selected
   *
   * An id may not appear in both lists, and every id must match exactly
   * one requested permission. A core that predates this ignores the whole
   * object, so the consent falls back to all-or-nothing instead of
   * failing; `AuthRequestConsentForm` echoed back is how you tell.
   */
  export type AuthRequestConsent = {
    /** Default false: the user may only accept the whole set or deny. */
    allowUserChoice?: boolean;
    mandatory?: string[];
    optIn?: string[];
  };

  /**
   * The resolved consent form: the requested permissions with their
   * annotations attached, as the auth page renders them. Returned by the
   * auth-request POST and carried on the NEED_SIGNIN poll, in both cases
   * ONLY when the request carried a `consent` object the core understood.
   */
  export type AuthRequestConsentForm = {
    allowUserChoice: boolean;
    permissions: Array<
      (
        | {
            streamId: Identifier;
            level: PermissionLevel;
            /** Echoed only when the request carried it. */
            defaultName?: string;
            /** Present when the core resolved the stream's real name. */
            name?: string;
          }
        | { feature: string; setting: string }
      ) & {
        mandatory?: true;
        optIn?: true;
      }
    >;
  };

  export type States =
    | 'ERROR'
    | 'LOADING'
    | 'INITIALIZED'
    | 'NEED_SIGNIN'
    | 'ACCEPTED'
    | 'SIGNOUT'
    | 'REFUSED'
    | 'SWITCHING';

  /**
   * An account remembered by the sign-in button. `actingAs` marks an account
   * used through account delegation (`delegate`: the person acting).
   */
  export type AuthProfile = {
    username: string;
    actingAs?: { username: string; delegate: string };
  };

  export type StateChangeTypes = {
    ERROR: {
      message?: string;
      error?: Error | unknown;
    };
    LOADING: {};
    INITIALIZED: {
      serviceInfo: ServiceInfo;
    };
    NEED_SIGNIN: {
      authUrl: string;
      clientData?: KeyValue;
      code?: number;
      key: string;
      lang: string;
      oauthState?: string;
      poll: string;
      poll_rate_ms: number;
      requestedPermissions: Array<{
        streamId: string;
        level: PermissionLevel;
        defaultName: string;
      }>;
      consent?: AuthRequestConsentForm;
      requestingAppId: string;
      returnUrl?: string | null;
      serviceInfo?: ServiceInfo;
    };
    ACCEPTED: {
      serviceInfo?: ServiceInfo;
      apiEndpoint: string;
      username: string;
      /** Present on inline delivery; absent when a one-time `handoff` key is used. */
      token?: string;
      /**
       * Key of the auth request that just completed (use it with
       * `connectFromKey`). Absent when the account comes from stored
       * credentials: page load, an account switch without sign-in, or the
       * return to the previous account after a switch that did not complete.
       */
      key?: string;
      /** Display hint posted by the auth page for a grant on a controlled account; `accessInfo().delegation` is authoritative. */
      delegation?: {
        isDelegatedAccess: true;
        controlledUsername: string;
        delegate: { username: string; hostSlug?: string };
      };
      profile?: AuthProfile;
      /** One-time credential hand-off key (shared-secret delivery), in place of `token`. */
      handoff?: { type: 'shared-secret'; key: string };
    };
    SIGNOUT: {};
    SWITCHING: {
      from: string | null;
      /** null: the account is chosen in the sign-in popup */
      to: string | null;
    };
    REFUSED: {
      reasonID?: string;
      message?: string;
      serviceInfo?: ServiceInfo;
    };
  };

  export type StateChange<K extends States> = StateChangeTypes[K] & {
    id: K;
    status: K;
  };

  /**
   * Response from auth-request POST endpoint
   * @see https://pryv.github.io/reference/#auth-request
   */
  export type AuthRequestResponse = {
    status: 'NEED_SIGNIN';
    authUrl: string;
    /** @deprecated Use authUrl instead */
    url?: string;
    key: string;
    poll: string;
    poll_rate_ms: number;
    requestingAppId: string;
    requestedPermissions: AuthRequestedPermission[];
    consent?: AuthRequestConsentForm;
    lang?: string;
    returnURL?: string;
    clientData?: KeyValue;
    serviceInfo?: ServiceInfo;
  };

  /**
   * Account menu entries of the sign-in button. `false` on an entry, or its
   * name in `hide`, hides it.
   */
  export type LoginButtonMenuSettings = {
    logout?: boolean;
    account?: boolean;
    info?: boolean;
    /** Account switcher (remembered accounts, "Another account...", "Switch back"). */
    switch?: boolean;
    hide?: Array<'logout' | 'account' | 'info' | 'switch'>;
  };

  export type AuthSettings = {
    spanButtonID?: string;
    onStateChange?: (state: StateChange<States>) => void;
    returnURL?: string;
    /**
     * Account menu shown when the signed-in button is clicked (default: on).
     * `false` restores the plain logout confirmation.
     */
    menu?: LoginButtonMenuSettings | false;
    /** Root URL of the account app; overrides the service's `account`. */
    accountUrl?: string;
    /** Most accounts remembered for this app (default 5); the least recently used is forgotten first. */
    maxProfiles?: number;
    authRequest: {
      requestingAppId: string;
      languageCode?: string;
      requestedPermissions: AuthRequestedPermission[];
      consent?: AuthRequestConsent;
      returnUrl?: string | boolean;
      referer?: string;
      clientData?: KeyValue;
      deviceName?: string;
      expireAfter?: number;
      /**
       * Credential delivery mode. Defaults to `'shared-secret'`: the token is
       * delivered through a one-time secret instead of the ACCEPTED poll, and
       * `connectFromKey` redeems it. `'inline'` opts out (no field sent, legacy
       * inline delivery). An older core ignores the field and delivers inline.
       */
      credentialHandoff?: 'shared-secret' | 'inline';
      serviceInfo?: Partial<ServiceInfo>;
      /**
       * Whether the sign-in may grant the access for an account the user
       * controls through account delegation: 'allow' (server default),
       * 'deny', or the username to preselect.
       */
      actAs?: 'allow' | 'deny' | string;
    };
  };

  export type LoginButtonConstructor = new (
    authSettings: AuthSettings,
    service: Service,
  ) => CustomLoginButton;

  export type SetupAuth = (
    settings: AuthSettings,
    serviceInfoUrl: string,
    serviceCustomizations?: serviceCustomizations,
    humanInteraction?: LoginButtonConstructor,
  ) => Promise<Service>;

  export type AuthStates = {
    ERROR: 'ERROR';
    LOADING: 'LOADING';
    INITIALIZED: 'INITIALIZED';
    NEED_SIGNIN: 'NEED_SIGNIN';
    AUTHORIZED: 'ACCEPTED';
    SIGNOUT: 'SIGNOUT';
    REFUSED: 'REFUSED';
    SWITCHING: 'SWITCHING';
  };

  type AuthStatePayload = {
    status: AuthStates[keyof AuthStates];
    message?: string;
    error?: Error | unknown;
  };

  /** A remembered account as stored (credentials included). */
  export type StoredAuthProfile = AuthProfile & {
    apiEndpoint: string;
    unavailable?: true;
  };

  /**
   * Stored sign-in data. The top-level `apiEndpoint` / `username` are the
   * active account (absent after logging out of one of several accounts);
   * `profiles` lists every remembered account, most recently used first.
   */
  export type StoredAuthorizationData = {
    apiEndpoint?: string;
    username?: string;
    actingAs?: AuthProfile['actingAs'];
    /** Auth page of the sign-in (without query), kept to locate the account app. */
    authUrl?: string;
    profiles?: StoredAuthProfile[];
  } | null;

  export type CustomLoginButton = {
    init?: () => Promise<Service>;
    getAuthorizationData(): StoredAuthorizationData;
    onStateChange(state: AuthStatePayload): Promise<void>;
    onClick(): void;
    saveAuthorizationData?: (authData: StoredAuthorizationData) => void;
    deleteAuthorizationData?: () => Promise<void>;
    finishAuthProcessAfterRedirection?: (authController: AuthController) => Promise<void>;
    /**
     * Called when the signed-in button is clicked. Return `false` to fall
     * back to the SIGNOUT state (logout confirmation); log out from the menu
     * with `AuthController.signOut()`.
     */
    showMenu?: () => boolean | void;
  };

  export class LoginButton implements CustomLoginButton {
    constructor(authSettings: AuthSettings, service: Service);
    auth: AuthController;
    authSettings: AuthSettings;
    service: Service;
    serviceInfo: ServiceInfo;
    languageCode: string;
    messages: KeyValue;
    text: string;
    popup?: Window | null;
    loginButtonSpan?: HTMLElement;
    loginButtonText?: HTMLElement;

    init(): Promise<Service>;
    onClick(): void;
    onStateChange(state: AuthStatePayload): Promise<void>;
    getAuthorizationData(): StoredAuthorizationData;
    saveAuthorizationData(authData: StoredAuthorizationData): void;
    deleteAuthorizationData(): Promise<void>;
    finishAuthProcessAfterRedirection(authController: AuthController): Promise<void>;
    showMenu(): boolean;
    /** Resolves when the re-initialization it may start (a dismissed "Log out?") is done. */
    closeMenu(): Promise<void>;
    /** The re-initialization started by the last menu action, if any. */
    pending?: Promise<void>;
  }

  export class AuthController {
    constructor (
      authSettings: AuthSettings,
      service: Service,
      loginButton: CustomLoginButton,
    );
    settings: AuthSettings;
    service: Service;
    serviceInfo: ServiceInfo | null;
    assets: ServiceAssets | null;
    loginButton: CustomLoginButton;
    languageCode: string;
    messages: KeyValue;
    stateChangeListeners: Array<(state: AuthStatePayload) => void>;

    init(): Promise<Service>;
    stopAuthRequest(msg: string): void;
    handleClick(): Promise<void>;
    getReturnURL(
      returnURL?: string,
      windowLocationForTest?: string,
      navigatorForTests?: string,
    ): string | boolean;
    /** `overrides`: auth request fields for this request only; `previous`: state to return to if an account switch does not complete. */
    startAuthRequest(overrides?: Partial<AuthSettings['authRequest']>, previous?: AuthStatePayload): Promise<AuthRequestResponse>;
    /**
     * Log out: emits SIGNOUT once, forgets the active account (every
     * remembered account with `all`), re-initializes.
     */
    signOut(options?: { all?: boolean }): Promise<void>;
    /** The remembered accounts, most recently used first. */
    profiles(): Array<AuthProfile & { active: boolean; available: boolean }>;
    /** The signed-in account, or null. */
    currentProfile(): AuthProfile | null;
    /**
     * Switch account (`null`: the signed-in person's own account). A
     * remembered account with a valid access needs no sign-in; otherwise the
     * auth request runs again with `actAs`. Emits SWITCHING, ends in ACCEPTED,
     * or back on the previous account when the sign-in is refused.
     */
    switchTo(username: string | null): Promise<void>;
    /** Sign in to one more account (`actAs: 'allow'`), keeping the remembered ones. */
    addAccount(): Promise<void>;
    /** Account app profile URL, or null when it cannot be determined. */
    accountUrl(): string | null;
    /** Opens the account app in a new tab; returns the URL, or null. */
    openAccountApp(): string | null;
    set state(newState: AuthStatePayload);
    get state(): AuthStatePayload;
  }

  /**
   * Web-Storage-like store used by OAuth2Client to hold the per-flow PKCE verifier.
   */
  export type OAuth2ClientStorage = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };

  export type OAuth2ClientOptions = {
    /** Issuer / Pryv API base URL; discovery doc read from `<url>/.well-known/oauth-authorization-server`. */
    authorizationServer: string;
    /** App-account client id. */
    clientId: string;
    /** Registered redirect URI. */
    redirectUri: string;
    /** Consent-offer reference registered on the client, e.g. `'cmc:study-A'`. */
    scope?: string;
    /** Defaults to `globalThis.sessionStorage` (browser) or an in-memory store. */
    storage?: OAuth2ClientStorage;
    /** Seed a previously-persisted refresh token so `refresh()` works after a reload. */
    refreshToken?: string;
    /** Called with the NEW refresh token every time it rotates, to persist the minimal secret. */
    onTokenRotated?: (refreshToken: string) => void;
    /** Opt into RFC 9449 DPoP: token bound to a per-client ES256 key; `handleCallback()` / `refresh()` return a {@link SignedConnection}. */
    dpop?: boolean;
  };

  /**
   * Browser-side consumer of the Pryv OAuth2 authorization-code (PKCE) flow.
   */
  export class OAuth2Client {
    constructor(options: OAuth2ClientOptions);
    issuer: URL;
    clientId: string;
    redirectUri: string;
    scope?: string;
    /** Last raw token-endpoint response (access_token, scope, apiEndpoint, …). */
    lastTokenResponse: { [key: string]: unknown } | null;
    /** Build + navigate to the `/oauth2/authorize` URL; returns the URL. */
    redirectToAuthorize(options?: { state?: string; redirect?: (url: string) => void }): Promise<string>;
    /** Validate the callback, exchange the code (PKCE), return a Connection. */
    handleCallback(queryString: string): Promise<Connection>;
    /** Exchange the stored refresh token for a fresh Connection. */
    refresh(): Promise<Connection>;
  }

  export const Auth: {
    setupAuth: SetupAuth;
    AuthStates: AuthStates;
    AuthController: typeof AuthController;
  }

  export type getServiceInfoFromURL = (url: string) => string;

  export const Browser: {
    LoginButton: typeof LoginButton;
    CookieUtils: {
      set<T = unknown>(cookieKey: string, value: T, expireInDays?: number): void;
      get<T = unknown>(cookieKey: string): T | undefined;
      del(cookieKey: string): void;
    };
    AuthStates: AuthStates;
    setupAuth: SetupAuth;
    serviceInfoFromUrl: getServiceInfoFromURL;
  }

  export type TokenAndAPIEndpoint = {
    endpoint: string;
    token: string | null;
  };

  /**
   * Decomposed form of an APIEndpoint, returned by
   * `pryv.utils.decomposeAPIEndpoint`. `host` is the canonical platform
   * host (no `<username>.` subdomain prefix in subdomain-style
   * deployments) — the same identity cross-account features (CMC
   * counterparty slugs, etc.) key on.
   */
  export type DecomposedAPIEndpoint = {
    token: string | null;
    username: string | null;
    host: string;
  };

  export const utils: {
    isBrowser(): boolean;
    extractTokenAndAPIEndpoint(apiEndpoint: string): TokenAndAPIEndpoint;
    buildAPIEndpoint(tokenAndAPI: TokenAndAPIEndpoint): string;
    decomposeAPIEndpoint(apiEndpoint: string, serviceInfoApi: string): DecomposedAPIEndpoint;
    browserIsMobileOrTablet(navigator?: string | Navigator): boolean;
    cleanURLFromPrYvParams(url: string): string;
    getQueryParamsFromURL(url: string): KeyValue;
    /** @deprecated Use extractTokenAndAPIEndpoint instead */
    extractTokenAndApiEndpoint(apiEndpoint: string): TokenAndAPIEndpoint;
    /** @deprecated Use buildAPIEndpoint instead */
    buildPryvApiEndpoint(tokenAndAPI: TokenAndAPIEndpoint): string;
  }

  type version = string;

  let pryv: {
    Service: typeof Service;
    Connection: typeof Connection;
    OAuth2Client: typeof OAuth2Client;
    Auth: {
      setupAuth: SetupAuth;
      AuthStates: AuthStates;
      AuthController: typeof AuthController;
    };
    Browser: {
      LoginButton: typeof LoginButton;
      CookieUtils: {
        set<T = unknown>(cookieKey: string, value: T, expireInDays?: number): void;
        get<T = unknown>(cookieKey: string): T | undefined;
        del(cookieKey: string): void;
      };
      AuthStates: AuthStates;
      setupAuth: SetupAuth;
      serviceInfoFromUrl: getServiceInfoFromURL;
    };
    // Reference the named export's type — a duplicated inline shape here
    // drifted from it once already (the deprecated aliases were missing),
    // which broke structural typing for add-ons taking the default export
    // (e.g. @pryv/socket.io's PryvLibrary).
    utils: typeof utils;
    PryvError: typeof PryvError;
    MfaRequiredError: typeof MfaRequiredError;
    ERRORS: typeof ERRORS;
    version: version;
    connectFromKey: typeof connectFromKey;
  };

  export default pryv;
}
