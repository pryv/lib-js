import pryv from 'pryv';
import { EventEmitter } from 'events';

/**
 * Extends a `pryv` instance with monitoring capabilities.
 *
 * Typical usage:
 * ```ts
 * import pryv from 'pryv';
 * import extendPryvMonitor from '@pryv/monitor';
 *
 * extendPryvMonitor(pryv);
 *
 * const mon = new pryv.Monitor('https://token@user.pryv.me', {
 *   streams: ['data'],
 * });
 *
 * mon.on(pryv.Monitor.Changes.EVENT, (event) => {
 *   // handle new or changed event
 * });
 *
 * await mon.start();
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

    /** The connection used by this monitor */
    readonly connection: Connection;

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
     * @param updateMethod - The update method to use (e.g., EventsTimer, Socket)
     */
    addUpdateMethod(updateMethod: MonitorUpdateMethod): Monitor;

    /**
     * Listen to monitor-level changes.
     *
     * Events:
     * - `event`        – new or updated event
     * - `eventDelete`  – deleted event (with id property)
     * - `streams`      – updated streams list
     * - `error`        – error object
     * - `ready`        – monitor is ready for next update
     * - `stop`         – monitor has been stopped
     */
    on(event: 'event', listener: (event: Event) => void): this;
    on(event: 'eventDelete', listener: (deletion: ItemDeletion) => void): this;
    on(event: 'streams', listener: (streams: Stream[]) => void): this;
    on(event: 'error', listener: (error: Error | unknown) => void): this;
    on(event: 'ready', listener: () => void): this;
    on(event: 'stop', listener: () => void): this;

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

    /** Reference to pryv library (set during extension) */
    static pryv: typeof pryv;
  }

  /**
   * Base class for update methods used by Monitor.
   * Subclass this to create custom update strategies.
   */
  export class MonitorUpdateMethod {
    /** The monitor this update method is attached to */
    protected monitor?: Monitor;

    /**
     * Assign a Monitor to this updater.
     * Usually called by the monitor itself on monitor.addUpdateMethod()
     * @param monitor - The monitor to attach to
     */
    setMonitor(monitor: Monitor): void;

    /**
     * Called when all update tasks are done and monitor is ready for next update.
     * Override in subclasses to implement custom behavior.
     */
    ready(): Promise<void>;

    /**
     * Called when monitor is stopped. Override to clean up resources.
     */
    stop(): Promise<void>;
  }

  /**
   * Update method that polls for event changes at a fixed interval.
   */
  export class EventsTimerUpdateMethod extends MonitorUpdateMethod {
    /**
     * @param updateRateMS - The refresh rate in milliseconds (must be > 1)
     */
    constructor(updateRateMS: number);

    /** The configured update rate in milliseconds */
    readonly updateRateMS: number;
  }

  /**
   * Update method that uses @pryv/socket.io events for real-time updates.
   * Requires @pryv/socket.io to be loaded.
   */
  export class SocketUpdateMethod extends MonitorUpdateMethod {
    /** The socket instance (set after ready() is called) */
    protected socket?: SocketIO;
  }
}


