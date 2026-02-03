import pryv from 'pryv';
import { EventEmitter } from 'events';

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
export default function extendPryvSocketIO(pryvLib: typeof pryv): void;

declare module 'pryv' {
  export type SocketIOEventName =
    | 'eventsChanged'
    | 'streamsChanged'
    | 'accessesChanged'
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
     * - `accessesChanged` - Accesses have been modified
     * - `disconnect` - Socket disconnected
     * - `error` - An error occurred
     */
    on(event: 'eventsChanged', listener: () => void): this;
    on(event: 'streamsChanged', listener: () => void): this;
    on(event: 'accessesChanged', listener: () => void): this;
    on(event: 'disconnect', listener: (reason: string) => void): this;
    on(event: 'error', listener: (error: Error | unknown) => void): this;
    on(event: SocketIOEventName, listener: (...args: unknown[]) => void): this;
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


