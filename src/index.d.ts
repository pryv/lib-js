declare module 'pryv' {
  type Timestamp = number;
  type Identifier = string;
  type Level = 'read' | 'contribute' | 'manage' | 'create-only';
  type KeyValue = { [key: string]: string | number };

  type Attachment = {
    id: Identifier;
    fileName: string;
    type: string;
    size: number;
    readToken: string;
  };

  type Stream = {
    id: Identifier;
    name: string;
    parentId?: Identifier;
    clientData?: KeyValue;
    children: Identifier[];
    trashed?: boolean;
    created: Timestamp;
    createdBy: Identifier;
    modified: Timestamp;
    modifiedBy: Identifier;
  };

  type Event = {
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

  type Permission = {
    streamId: Identifier;
    level: Level;
    feature?: 'selfRevoke';
    setting?: 'forbidden';
  };

  type Access = {
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
  };

  type FollowedSlice = {
    id: Identifier;
    name: string;
    url: string;
    accessToken: string;
  };

  type AccountInformation = {
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

  type HFSeries = {
    format: 'flatJSON';
    fields: string[];
    points: Array<number | string>;
  };

  type Run = {
    status: number;
    timestamp: Timestamp;
  };

  type WebHook = {
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

  type ItemDeletion = {
    id: Identifier;
    deleted?: Timestamp;
  };

  type Error = {
    id: string;
    message: string;
    data?: any;
    subErrors?: Error[];
  };

  type StreamsQuery = {
    any?: Identifier[];
    all?: Identifier[];
    not?: Identifier[];
  };

  type EventQueryParams = {
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

  type EventQueryParamsStreamQuery = Omit<EventQueryParams, 'streams'> & {
    streams: string[] | StreamsQuery;
  };

  type EditMetadata = 'created' | 'createdBy' | 'modified' | 'modifiedBy';

  export type ApiCallMethods = {
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
  type ApiCallResultUnion = ApiCallMethods[keyof ApiCallMethods]['res'];
  type ApiCallResultTypes = UnionToIntersection<
    NonNullable<ApiCallResultUnion>
  >;

  type PossibleError = {
    error?: Error;
  };

  type ApiCallResult<K extends keyof ApiCallMethods> =
    ApiCallMethods[K]['res'] & PossibleError;

  export type ApiCallResultHandler<K extends keyof ApiCallMethods> = (
    result: ApiCallResult<K>,
  ) => Promise<any>;
  export type StreamedEventsHandler = (event: Event) => void;

  type StreamedEventsResult = {
    eventsCount?: number;
    eventsDeletionsCount?: number;
    meta: {
      apiVersion: string;
      serverTime: number;
      serial: string;
    };
  };

  export type EventFileCreationParams = Partial<
    Omit<Event, 'attachments' | EditMetadata>
  >;
  export type ApiCall<K extends keyof ApiCallMethods = keyof ApiCallMethods> =
    K extends keyof ApiCallMethods
      ? {
          method: K;
          params: ApiCallMethods[K]['params'];
          handleResult?: ApiCallResultHandler<K>;
        }
      : never;

  export type TypedApiCallResult = ApiCallResultTypes & PossibleError;

  export type ApiCallProgressHandler = (percentage: number) => void;

  interface AccessInfo extends Access {
    calls: KeyValue;
    user: KeyValue;
  }

  type EventApiCallRes = {
    event?: Event;
  } & PossibleError;

  export interface Connection {
    new (pryvApiEndpoint: string, service?: Service): Connection;
    get service(): Service;
    username(): Promise<string>;
    api<Calls extends ApiCall[] = ApiCall[]>(
      apiCalls: Calls,
      res?: ApiCallProgressHandler[],
    ): Promise<Array<TypedApiCallResult>>;
    getEventsStreamed(
      queryParams: Partial<EventQueryParamsStreamQuery>,
      forEachEvent: StreamedEventsHandler,
    ): Promise<StreamedEventsResult>;
    createEventWithFile(
      params: EventFileCreationParams,
      filePath: string | Buffer | Blob,
    ): Promise<EventApiCallRes>;
    createEventWithFormData(
      params: EventFileCreationParams,
      formData: FormData,
    ): Promise<EventApiCallRes>;
    createEventWithFileFromBuffer(
      params: EventFileCreationParams,
      bufferData: string | Buffer,
      filename: string,
    ): Promise<EventApiCallRes>;
    addPointsToHFEvent(
      id: Identifier,
      fields: string[],
      values: Array<string | number>,
    ): Promise<void>;
    accessInfo(): Promise<AccessInfo>;

    post(
      path: string,
      data: Object | any[],
      queryParams: Object,
    ): Promise<Object | Object[]>;
    get(path: string, queryParams: Object): Promise<Object | Object[]>;
  }

  export type serviceCustomizations = {
    name?: string;
    assets?: {
      definitions?: string;
    };
  };

  export type PryvServiceInfo = {
    register: string;
    access: string;
    api: string;
    name: string;
    home: string;
    support: string;
    terms: string;
    eventTypes: string;
    version: string;
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

  export interface Service {
    new (
      serviceInfoUrl: string,
      serviceCustomizations?: serviceCustomizations,
    ): Service;
    info(forceFetch?: boolean): Promise<PryvServiceInfo>;
    setServiceInfo(serviceInfo: Partial<PryvServiceInfo>): Promise<void>;
    assets(forceFetch?: boolean): Promise<AssetsConfig>;
    infoSync(): PryvServiceInfo | null;
    apiEndpointFor(username: string, token: string): Promise<string>;
    login(
      username: string,
      password: string,
      appId: string,
      originHeader?: string,
    ): Promise<Connection>;
  }

  export type AuthRequestedPermission = {
    streamId: Identifier;
    defaultName: string;
    level: Level;
  };

  export type States =
    | 'LOADING'
    | 'INITIALIZED'
    | 'NEED_SIGNIN'
    | 'ACCEPTED'
    | 'SIGNOUT';

  type ServiceInfo = {
    access: string;
    api: string;
    assets: {
      definitions: string;
    };
    eventTypes: string;
    home: string;
    name: string;
    register: string;
    serial: string;
    support: string;
    terms: string;
    version: string;
  };

  type StateChangeTypes = {
    LOADING: {};
    INITIALIZED: {
      serviceInfo: ServiceInfo;
    };
    NEED_SIGNIN: {
      authUrl: string;
      clientData: any;
      code: number;
      key: string;
      lang: string;
      oauthState: any;
      poll: string;
      poll_rate_ms: number;
      requestedPermissions: Array<{
        streamId: string;
        level: Level;
        defaultName: string;
      }>;
      requestingAppId: string;
      returnUrl: any;
      serviceInfo: ServiceInfo;
    };
    ACCEPTED: {
      serviceInfo: ServiceInfo;
      apiEndpoint: string;
      username: string;
      token: string;
    };
    SIGNOUT: {};
  };

  export type StateChange<K extends States> = StateChangeTypes[K] & {
    id: K;
    status: K;
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
      clientData?: Object;
    };
  };

  type SetupAuth = (
    settings: AuthSettings,
    serviceInfoUrl: string,
    serviceCustomizations?: serviceCustomizations,
    humanInteraction?: any,
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
  };

  export interface CustomLoginButton {
    init?: () => Promise<void>;
    getAuthorizationData(): string;
    onStateChange(state: AuthStatePayload): Promise<void>;
    onClick(): void;
    saveAuthorizationData?: (authData: string) => void;
    deleteAuthorizationData?: () => Promise<void>;
  }

  export interface AuthController {
    new (
      authSettings: AuthSettings,
      service: Service,
      loginButton: CustomLoginButton,
    ): AuthController;
    init(): Promise<void>;
    stopAuthRequest(msg: string): void;
    handleClick(): Promise<void>;
    getReturnURL(
      returnURL: string,
      windowLocationForTest: string,
      navigatorForTests: string,
    ): string | boolean;
    startAuthRequest(): Promise<any>;
    doPolling(): Promise<void>;
    set state(newState: AuthStatePayload);
    get state(): AuthStatePayload;
  }

  export interface Auth {
    setupAuth: SetupAuth;
    AuthStates: AuthStates;
    AuthController: AuthController;
  }

  export interface CookieUtils {
    set(cookieKey: string, value: any, expireInDays: number): void;
    get(cookieKey: string): any;
    del(cookieKey: string): void;
  }

  type getServiceInfoFromURL = (url: string) => string;

  export interface Browser {
    LoginButton: CustomLoginButton;
    CookieUtils: CookieUtils;
    AuthStates: AuthStates;
    setupAuth: SetupAuth;
    serviceInfoFromUrl: getServiceInfoFromURL;
  }

  type TokenAndApiEndpoint = {
    endpoint: string;
    token: string;
  };

  export interface utils {
    isBrowser(): boolean;
    extractTokenAndApiEndpoint(pryvApiEndpoint: string): TokenAndApiEndpoint;
    buildPryvApiEndpoint(tokenAndApi: TokenAndApiEndpoint): string;
    browserIsMobileOrTablet(navigator: string): boolean;
    cleanURLFromPrYvParams(url: string): string;
    getQueryParamsFromURL(url: string): KeyValue;
  }

  type version = string;

  let Pryv: {
    Service: Service;
    Connection: Connection;
    Auth: Auth;
    Browser: Browser;
    utils: utils;
    version: version;
  };

  export default Pryv;
}
