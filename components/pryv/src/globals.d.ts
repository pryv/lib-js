/**
 * Global type declarations for JSDoc references in JavaScript files.
 * These types are re-exported from the 'pryv' module for use in @param, @returns, etc.
 */

import type * as PryvModule from 'pryv';

declare global {
  // API types
  type APIEndpoint = string;
  type TokenAndEndpoint = PryvModule.TokenAndAPIEndpoint;

  // Core classes (for JSDoc @param {Connection} etc.)
  interface Connection extends PryvModule.Connection {
    socket?: any;
    _chunkedBatchCall?: any;
  }
  type Service = PryvModule.Service;
  type ServiceInfo = PryvModule.ServiceInfo;
  type ServiceAssets = PryvModule.ServiceAssets;

  // Auth types
  type AuthController = PryvModule.AuthController;
  type AuthSettings = PryvModule.AuthSettings;
  type AuthRequestResponse = PryvModule.AuthRequestResponse;
  type CustomLoginButton = PryvModule.CustomLoginButton;
  interface LoginButton extends PryvModule.LoginButton {
    loginButtonText?: HTMLElement;
  }

  // Data types
  type AccessInfo = PryvModule.AccessInfo & { error?: PryvModule.Error };
  type HFSeriesAddResult = PryvModule.HFSeriesAddResult;
  type APICall = PryvModule.APICall;
  type Event = PryvModule.Event;
  type Stream = PryvModule.Stream;

  // Method call type for socket.io
  type MethodCall = PryvModule.APICall;

  // Monitor types
  type Monitor = PryvModule.Monitor;
  type MonitorScope = PryvModule.MonitorScope;

  // SocketIO type
  type SocketIO = PryvModule.SocketIO;

  // Namespace for JSDoc like @type {pryv.Service}
  namespace pryv {
    export type Service = PryvModule.Service;
    export type Connection = PryvModule.Connection;
    export type Monitor = PryvModule.Monitor;
    export type ServiceInfo = PryvModule.ServiceInfo;
    export type ServiceAssets = PryvModule.ServiceAssets;
    export type AuthController = PryvModule.AuthController;
    export type Event = PryvModule.Event;
    export type Stream = PryvModule.Stream;
    export type ItemDeletion = PryvModule.ItemDeletion;
  }

  // Browser namespace for JSDoc
  namespace Browser {
    export type LoginButton = PryvModule.LoginButton;
  }

  // Extended Error type with innerObject property
  interface Error {
    innerObject?: any;
  }
}

export {};
