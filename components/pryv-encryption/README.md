# @pryv/encryption

Client-side encryption and decryption of [Pryv.io](https://pryv.com) events.

Events are encrypted **on the client** before they are sent to a Pryv.io core,
and decrypted **on the client** after they are read back. The core stores and
serves the encrypted form and never sees the key or the plaintext.

An encrypted event keeps its envelope in plaintext and moves the sensitive
`type` / `content` into an opaque payload:

```jsonc
{
  "id": "ck…",
  "streamIds": ["journal"],
  "time": 1700000000,
  "type": "encrypted/aes-256-gcm",
  "content": { "payload": "…base64…", "keyRef": "journal-2026" }
}
```

## Install

```bash
npm install @pryv/encryption
```

Requires Node.js >= 20 or a modern browser — it uses the standard WebCrypto API
(`globalThis.crypto.subtle`) and has no runtime dependencies.

## Usage

```js
const { EventsCipher, Keyring } = require('@pryv/encryption');

// A Keyring holds key material and can defer to async resolvers.
// Key material may be raw bytes (Uint8Array), a base64 string, or a CryptoKey.
const keyring = new Keyring({ 'journal-2026': keyMaterial });

// Optional: resolvers are tried, in registration order, when the store misses.
keyring.use(async (method, keyRef, hint) => fetchKeySomehow(keyRef) /* or null */);

const cipher = new EventsCipher(keyring, {
  // optional; default is silent
  onDecryptError: (event, error) => console.warn('could not decrypt', event.id, error)
});

// Encrypt before writing to a Pryv.io connection:
const encrypted = await cipher.encryptEvent(
  { streamIds: ['journal'], type: 'note/txt', content: 'a private note' },
  { method: 'aes-256-gcm', keyRef: 'journal-2026' }
);

// Decrypt after reading:
const decrypted = await cipher.decryptEvent(encrypted);
// decrypted.type === 'note/txt', decrypted.content === 'a private note'
// decrypted.decryptedFrom === encrypted (the original, untouched)

// Batch, and streaming (forEachEvent) helpers:
const all = await cipher.decryptEvents(events);
const onEvent = cipher.wrapForEachEvent((event) => { /* receives decrypted events */ });

// Recover the stored (encrypted) form of a decrypted event, e.g. before an update:
const stored = cipher.stripDecrypted(decrypted); // === encrypted
```

### Keyring

- `new Keyring({ keyRef: material, … })` — seed the key/value store.
- `keyring.set(keyRef, material)` — add/replace a key.
- `keyring.use(resolver)` — append an async resolver
  `(method, keyRef, hint) => material | null`.
- `keyring.getKeyFor(method, keyRef, hint)` — resolve material: the store is
  consulted first (by `keyRef`), then resolvers in registration order; the first
  non-null result wins, otherwise `null`.

### Decryption is non-destructive

`decryptEvent` never throws and never drops an event:

- If the event `type` is not `encrypted/<registered-method>`, the **same event
  reference** is returned untouched.
- On **any** failure — no key, a resolver throwing, a wrong key / tampered tag,
  a malformed payload, or plaintext that is not JSON with `type` and `content` —
  the **same event reference** is returned, and `onDecryptError(event, error)`
  is called when provided.
- On success a **new** object is returned: the envelope fields are preserved,
  `type` / `content` are the decrypted values, and `decryptedFrom` points back
  at the original encrypted event.

`encryptEvent`, in contrast, **throws** on an unknown method or a missing key.

### Methods

The built-in method is **`aes-256-gcm`** (AES-256 in GCM mode). Its
`content.payload` is `base64(iv ‖ ciphertext ‖ gcm-tag)` where the IV is 12
random bytes and the tag is the 16-byte GCM authentication tag. Keys are 32
bytes, accepted as a `Uint8Array`, a base64 string, or a `CryptoKey`.

Register or override a method with:

```js
cipher.registerMethod('my-method', {
  encrypt: async (material, key) => ({ payload: /* … */ }),
  decrypt: async (content, key) => material
});
```

## Limitations

- **Updates are full re-encryptions.** There is no partial/streaming update of
  an encrypted `content`; changing it means encrypting the new value and
  replacing the event's `content`.
- **The server cannot query encrypted content.** Because `type` and `content`
  are opaque to the core, server-side filtering, type queries, aggregation and
  full-text search do not apply to encrypted fields. Envelope fields
  (`streamIds`, `time`, …) stay in plaintext and remain queryable.
- **Key management is the application's responsibility.** This library never
  transmits, persists or derives keys; losing a key means losing access to the
  data it protected.

## License

[BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
