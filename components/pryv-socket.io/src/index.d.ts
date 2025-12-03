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
  /**
   * Socket.IO transport for a `Connection`.
   *
   * Use `connection.socket` to access the instance associated with a given
   * `Connection`.
   */
  export class SocketIO extends EventEmitter {
    constructor(connection: Connection);

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
     * - `eventsChanged`
     * - `streamsChanged`
     * - `accessesChanged`
     * - `disconnect`
     * - `error`
     */
    on(
      eventName:
        | 'eventsChanged'
        | 'streamsChanged'
        | 'accessesChanged'
        | 'disconnect'
        | 'error',
      listener: (...args: any[]) => void
    ): this;
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


