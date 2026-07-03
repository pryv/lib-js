import pryv, { Service, Connection, Auth, Browser, utils } from 'pryv';
import { EventEmitter } from 'events';

/**
 * Type for the pryv library parameter - accepts both default and namespace imports
 */
export type PryvLibrary = {
  Service: typeof Service;
  Connection: typeof Connection;
  Auth: typeof Auth;
  Browser: typeof Browser;
  utils: typeof utils;
  version?: string;
};

/**
 * Extends a `pryv` instance with Socket.IO capabilities.
 *
 * Typical usage:
 * ```ts
 * import pryv from 'pryv';
 * import extendPryvSocketIO from '@pryv/socket.io';
 *
 * extendPryvSocketIO(pryv);
 *
 * const connection = new pryv.Connection('https://token@user.pryv.me');
 * await connection.socket.open();
 * connection.socket.on('eventsChanged', (changes) => {
 *   // ...
 * });
 * ```
 */
export default function extendPryvSocketIO(pryvLib: PryvLibrary): void;

declare module 'pryv' {
  export type SocketIOEventName =
    | 'eventsChanged'
    | 'streamsChanged'
    | 'accessesChanged'
    | 'accessUpdated'
    | 'notificationsChanged'
    | 'disconnect'
    | 'error';

  /**
   * Socket.IO transport for a `Connection`.
   *
   * Use `connection.socket` to access the instance associated with a given
   * `Connection`.
   */
  export class SocketIO extends EventEmitter {
    constructor(connection: Connection);

    /** The connection this socket is bound to */
    readonly connection: Connection;

    /** True while the socket is in the process of connecting */
    readonly connecting: boolean;

    /**
     * Open the Socket.IO stream.
     * @throws Error on connection failures
     * @returns The same `SocketIO` instance once connected.
     */
    open(): Promise<SocketIO>;

    /**
     * Close the underlying socket connection.
     */
    close(): void;

    /**
     * Identical to `Connection.api()` but using the Socket.IO transport.
     */
    api<Calls extends APICall[] = APICall[]>(
      apiCalls: Calls,
      progress?: APICallProgressHandler
    ): Promise<Array<TypedAPICallResult>>;

    /**
     * Listen to Socket.IO events emitted by the Pryv.io backend.
     *
     * Supported events:
     * - `eventsChanged` - Events have been modified
     * - `streamsChanged` - Streams have been modified
     * - `accessesChanged` - Accesses have been created, modified or deleted
     * - `accessUpdated` - The connection's own access was updated
     * - `notificationsChanged` - Scoped subscription matched (see `subscribe()`)
     * - `disconnect` - Socket disconnected
     * - `error` - An error occurred
     */
    on(event: 'eventsChanged', listener: () => void): this;
    on(event: 'streamsChanged', listener: () => void): this;
    on(event: 'accessesChanged', listener: () => void): this;
    on(event: 'accessUpdated', listener: () => void): this;
    on(event: 'notificationsChanged', listener: (payload: { keys: string[] }) => void): this;
    on(event: 'disconnect', listener: (reason: string) => void): this;
    on(event: 'error', listener: (error: Error | unknown) => void): this;
    on(event: SocketIOEventName, listener: (...args: unknown[]) => void): this;

    /**
     * Register scoped notification subscriptions on this connection. Matched
     * changes are delivered as `notificationsChanged({ keys })`. Resolves the
     * server ack `{ ok, keys }`, or `{ ok: false }` when the server does not
     * support scoped notifications (so callers can fall back to coarse events).
     */
    subscribe(
      payload:
        | { key: string; kind: string; query?: Record<string, unknown> }
        | { scopes: Record<string, { kind: string; query?: Record<string, unknown> }> }
    ): Promise<{ ok: boolean; keys?: string[]; error?: unknown }>;

    /**
     * Remove scoped subscriptions: `{ key }`, `{ keys: [...] }`, or `{ all: true }`.
     */
    unsubscribe(
      payload: { key: string } | { keys: string[] } | { all: true }
    ): Promise<{ ok: boolean; error?: unknown }>;

    /**
     * List the scopes currently registered on this connection.
     */
    getSubscriptions(): Promise<{
      scopes: Record<string, { kind: string; query?: Record<string, unknown> }>;
    }>;
  }

  export class Connection {
    /**
     * Lazily created Socket.IO helper bound to this connection.
     *
     * Call `await connection.socket.open()` before using it.
     */
    get socket(): SocketIO;
  }
}


