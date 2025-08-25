declare module 'pryv' {
  type Timestamp = number;
  type Identifier = string;
  export type Level = 'read' | 'contribute' | 'manage' | 'create-only';
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
    children: Identifier[];
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
    level: Level;
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
    points: Array<number | string>;
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
    result: APICallResult<K>,
  ) => Promise<any>;
  export type StreamedEventsHandler = (event: Event) => void;

  export type StreamedEventsResult = {
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
      res?: APICallProgressHandler[],
    ): Promise<Array<TypedAPICallResult>>;
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

  export type ServiceInfo = {
    register: string;
    access: string;
    api: string;
    name: string;
    home: string;
    support: string;
    terms: string;
    eventTypes: string;
    version: string;
    assets: {
      definitions: string;
    };
    serial: string;
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

  export class Service {
    constructor (
      serviceInfoUrl: string,
      serviceCustomizations?: serviceCustomizations,
    );
    info(forceFetch?: boolean): Promise<ServiceInfo>;
    setServiceInfo(serviceInfo: Partial<ServiceInfo>): Promise<void>;
    assets(forceFetch?: boolean): Promise<AssetsConfig>;
    infoSync(): ServiceInfo | null;
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

  export type StateChangeTypes = {
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

  export type SetupAuth = (
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

  export type CustomLoginButton = {
    init?: () => Promise<void>;
    getAuthorizationData(): string;
    onStateChange(state: AuthStatePayload): Promise<void>;
    onClick(): void;
    saveAuthorizationData?: (authData: string) => void;
    deleteAuthorizationData?: () => Promise<void>;
  }

  export class AuthController {
    constructor (
      authSettings: AuthSettings,
      service: Service,
      loginButton: CustomLoginButton,
    );
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

  export const Auth: {
    setupAuth: SetupAuth;
    AuthStates: AuthStates;
    AuthController: AuthController;
  }

  export type getServiceInfoFromURL = (url: string) => string;

  export const Browser: {
    LoginButton: CustomLoginButton;
    CookieUtils: {
      set(cookieKey: string, value: any, expireInDays: number): void;
      get(cookieKey: string): any;
      del(cookieKey: string): void;
    };
    AuthStates: AuthStates;
    setupAuth: SetupAuth;
    serviceInfoFromUrl: getServiceInfoFromURL;
  }

  export type TokenAndAPIEndpoint = {
    endpoint: string;
    token: string;
  };

  export const utils: {
    isBrowser(): boolean;
    extractTokenAndAPIEndpoint(apiEndpoint: string): TokenAndAPIEndpoint;
    buildAPIEndpoint(tokenAndAPI: TokenAndAPIEndpoint): string;
    browserIsMobileOrTablet(navigator: string): boolean;
    cleanURLFromPrYvParams(url: string): string;
    getQueryParamsFromURL(url: string): KeyValue;
  }

  type version = string;

  let pryv: {
    version: version;
  };

  export default pryv;
}
