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

  // HTTP only
  type AuditLog = {
    id: Identifier;
    type: string;
    time: Timestamp;
    forwardedFor: string;
    action: string;
    query: string;
    accessId: string;
    status: number;
    errorMessage?: string;
    errorId?: string;
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

  export type StreamsQuery = {
    any?: Identifier[];
    all?: Identifier[];
    not?: Identifier[];
  };

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
    accessInfo(): Promise<AccessInfo>;
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
    assets?: {
      definitions: string;
    };
    serial?: string;
    features?: {
      noHF?: boolean;
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
    isDnsLess(): Promise<boolean>;

    static buildAPIEndpoint(
      serviceInfo: ServiceInfo,
      username: string,
      token?: string,
    ): string;
  }

  export type AuthRequestedPermission = {
    streamId: Identifier;
    defaultName: string;
    level: PermissionLevel;
  };

  export type States =
    | 'ERROR'
    | 'LOADING'
    | 'INITIALIZED'
    | 'NEED_SIGNIN'
    | 'ACCEPTED'
    | 'SIGNOUT'
    | 'REFUSED';

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
      requestingAppId: string;
      returnUrl?: string | null;
      serviceInfo?: ServiceInfo;
    };
    ACCEPTED: {
      serviceInfo?: ServiceInfo;
      apiEndpoint: string;
      username: string;
      token?: string;
    };
    SIGNOUT: {};
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
    lang?: string;
    returnURL?: string;
    clientData?: KeyValue;
    serviceInfo?: ServiceInfo;
  };

  export type AuthSettings = {
    spanButtonID?: string;
    onStateChange?: (state: StateChange<States>) => void;
    returnURL?: string;
    authRequest: {
      requestingAppId: string;
      languageCode?: string;
      requestedPermissions: AuthRequestedPermission[];
      returnUrl?: string | boolean;
      referer?: string;
      clientData?: KeyValue;
      deviceName?: string;
      expireAfter?: number;
      serviceInfo?: Partial<ServiceInfo>;
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
  };

  type AuthStatePayload = {
    status: AuthStates[keyof AuthStates];
    message?: string;
    error?: Error | unknown;
  };

  export type StoredAuthorizationData = {
    apiEndpoint: string;
    username: string;
  } | null;

  export type CustomLoginButton = {
    init?: () => Promise<Service>;
    getAuthorizationData(): StoredAuthorizationData;
    onStateChange(state: AuthStatePayload): Promise<void>;
    onClick(): void;
    saveAuthorizationData?: (authData: StoredAuthorizationData) => void;
    deleteAuthorizationData?: () => Promise<void>;
    finishAuthProcessAfterRedirection?: (authController: AuthController) => Promise<void>;
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
    startAuthRequest(): Promise<AuthRequestResponse>;
    set state(newState: AuthStatePayload);
    get state(): AuthStatePayload;
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

  export const utils: {
    isBrowser(): boolean;
    extractTokenAndAPIEndpoint(apiEndpoint: string): TokenAndAPIEndpoint;
    buildAPIEndpoint(tokenAndAPI: TokenAndAPIEndpoint): string;
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
    utils: {
      isBrowser(): boolean;
      extractTokenAndAPIEndpoint(apiEndpoint: string): TokenAndAPIEndpoint;
      buildAPIEndpoint(tokenAndAPI: TokenAndAPIEndpoint): string;
      browserIsMobileOrTablet(navigator?: string | Navigator): boolean;
      cleanURLFromPrYvParams(url: string): string;
      getQueryParamsFromURL(url: string): KeyValue;
    };
    version: version;
  };

  export default pryv;
}
