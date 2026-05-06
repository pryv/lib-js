/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */

/**
 * Catalogue of Pryv API error ids.
 *
 * Mirrors `open-pryv.io/components/errors/src/ErrorIds.js`. Use these
 * constants instead of hardcoding error-id strings:
 *
 *   if (err instanceof PryvError && err.id === pryv.ERRORS.UNKNOWN_USER) { … }
 *
 * Adding a new id here is safe; renaming or removing one is a breaking
 * change for consumers using the constant.
 */
const ERRORS = Object.freeze({
  API_UNAVAILABLE: 'api-unavailable',
  CORRUPTED_DATA: 'corrupted-data',
  FORBIDDEN: 'forbidden',
  INVALID_ACCESS_TOKEN: 'invalid-access-token',
  INVALID_CREDENTIALS: 'invalid-credentials',
  UNSUPPORTED_OPERATION: 'unsupported-operation',
  INVALID_EVENT_TYPE: 'invalid-event-type',
  INVALID_ITEM_ID: 'invalid-item-id',
  INVALID_METHOD: 'invalid-method',
  INVALID_OPERATION: 'invalid-operation',
  INVALID_PARAMETERS_FORMAT: 'invalid-parameters-format',
  INVALID_REQUEST_STRUCTURE: 'invalid-request-structure',
  ITEM_ALREADY_EXISTS: 'item-already-exists',
  MISSING_HEADER: 'missing-header',
  UNEXPECTED_ERROR: 'unexpected-error',
  UNKNOWN_REFERENCED_RESOURCE: 'unknown-referenced-resource',
  UNKNOWN_RESOURCE: 'unknown-resource',
  UNSUPPORTED_CONTENT_TYPE: 'unsupported-content-type',
  TOO_MANY_RESULTS: 'too-many-results',
  GONE: 'removed-method',
  UNAVAILABLE_METHOD: 'unavailable-method',

  // Registration / unique-field validation
  INVALID_INVITATION_TOKEN: 'invitationToken-invalid',
  INVALID_USERNAME: 'username-invalid',
  USERNAME_REQUIRED: 'username-required',
  INVALID_EMAIL: 'email-invalid',
  INVALID_LANGUAGE: 'language-invalid',
  INVALID_APP_ID: 'appid-invalid',
  INVALID_PASSWORD: 'password-invalid',
  INVALID_REFERER: 'referer-invalid',
  EMAIL_REQUIRED: 'email-required',
  PASSWORD_REQUIRED: 'password-required',
  MISSING_REQUIRED_FIELD: 'missing-required-field',
  NEW_PASSWORD_FIELD_IS_REQUIRED: 'newPassword-required',

  // Account-stream / system-stream protections
  DENIED_STREAM_ACCESS: 'denied-stream-access',
  TOO_HIGH_ACCESS_FOR_SYSTEM_STREAMS: 'too-high-access-for-account-stream',
  FORBIDDEN_MULTIPLE_ACCOUNT_STREAMS: 'forbidden-multiple-account-streams-events',
  FORBIDDEN_ACCOUNT_EVENT_MODIFICATION: 'forbidden-none-editable-account-streams',
  FORBIDDEN_TO_CHANGE_ACCOUNT_STREAM_ID: 'forbidden-change-account-streams-id',
  FORBIDDEN_TO_EDIT_NONEDITABLE_ACCOUNT_FIELDS: 'forbidden-to-edit-noneditable-account-fields',

  // Pre-auth lookups (returned by `/reg/:email/uid` and similar)
  UNKNOWN_USER: 'unknown-user',
  UNKNOWN_EMAIL: 'unknown-email'
});

module.exports = ERRORS;
