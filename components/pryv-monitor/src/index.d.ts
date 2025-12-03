import pryv from 'pryv';
import { EventEmitter } from 'events';

/**
 * Extends a `pryv` instance with monitoring capabilities.
 *
 * Typical usage:
 * ```ts
 * import pryv from 'pryv';
 * import monitor from '@pryv/monitor';
 *
 * extendPryvMonitor(pryv);
 *
 * const monitor = new pryv.Monitor('https://token@user.pryv.me', {
 *   streams: ['data'],
 * });
 *
 * monitor.on(pryv.Monitor.Changes.EVENT, (event) => {
 *   // handle new or changed event
 * });
 *
 * await monitor.start();
 * ```
 */
export default function extendPryvMonitor(pryvLib: typeof pryv): typeof pryv.Monitor;

declare module 'pryv' {

  /**
   * Event scope used by Monitor, based on events.get parameters.
   */
  export type MonitorScope = {
    fromTime?: number;
    toTime?: number;
    streams?: string[];
    tags?: string[];
    types?: string[];
    running?: boolean;
    sortAscending?: boolean;
    state?: 'default' | 'trashed' | 'all';
    includeDeletions?: boolean;
    modifiedSince?: number;
  };

  /**
   * Enum of change types emitted by Monitor.
   */
  export const MonitorChanges: {
    EVENT: 'event';
    EVENT_DELETE: 'eventDelete';
    STREAMS: 'streams';
    ERROR: 'error';
    READY: 'ready';
    STOP: 'stop';
  };

  /**
   * Monitor changes on a Pryv.io account.
   */
  export class Monitor extends EventEmitter {
    constructor(apiEndpointOrConnection: APIEndpoint | Connection, eventsGetScope?: MonitorScope);

    /**
     * Start the monitor and perform initial sync.
     * Resolves with the same monitor instance.
     */
    start(): Promise<Monitor>;

    /**
     * Request an events update according to the current scope.
     */
    updateEvents(): Promise<Monitor>;

    /**
     * Request a streams update.
     */
    updateStreams(): Promise<Monitor>;

    /**
     * Stop monitoring. No further events will be emitted.
     */
    stop(): Monitor;

    /**
     * True when the monitor has been started and not yet stopped.
     */
    readonly started: boolean;

    /**
     * Current events.get scope used by the monitor.
     */
    eventsGetScope: MonitorScope;

    /**
     * Attach an auto-update method implementation.
     */
    addUpdateMethod(updateMethod: MonitorUpdateMethod): Monitor;

    /**
     * Listen to monitor-level changes.
     *
     * Events:
     * - `event`        – new or updated event
     * - `eventDelete`  – deleted event
     * - `streams`      – updated streams list
     * - `error`        – error object
     * - `ready`        – monitor is ready for next update
     * - `stop`         – monitor has been stopped
     */
    on(event: 'event', listener: (event: Event) => void): this;
    on(event: 'eventDelete', listener: (event: Event) => void): this;
    on(event: 'streams', listener: (streams: Stream[]) => void): this;
    on(event: 'error', listener: (error: any) => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'stop', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

    /**
     * Static access to available update methods.
     */
    static UpdateMethod: {
      Null: typeof MonitorUpdateMethod;
      Socket: typeof SocketUpdateMethod;
      EventsTimer: typeof EventsTimerUpdateMethod;
    };

    /**
     * Static enum of change names.
     */
    static Changes: typeof MonitorChanges;
  }

  /**
   * Base interface for update methods used by Monitor.
   */
  export class MonitorUpdateMethod {
    protected monitor?: Monitor;
    setMonitor(monitor: Monitor): void;
    ready(): Promise<void>;
    stop(): Promise<void>;
  }

  /**
   * Update method that polls for event changes at a fixed interval.
   */
  export class EventsTimerUpdateMethod extends MonitorUpdateMethod {
    constructor(updateRateMS: number);
  }

  /**
   * Update method that uses @pryv/socket.io events.
   */
  export class SocketUpdateMethod extends MonitorUpdateMethod {}
}


