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

Each method interprets **key material** in its own way — a keyring simply stores
whatever material a method expects and hands it back untouched. The three
built-in methods are:

#### `aes-256-gcm` (symmetric, encrypt + decrypt)

AES-256 in GCM mode. `content.payload` is `base64(iv ‖ ciphertext ‖ gcm-tag)`
where the IV is 12 random bytes and the tag is the 16-byte GCM authentication
tag. **Key material** is the 32 raw key bytes, accepted as a `Uint8Array`, a
**base64 string of those 32 bytes**, or an AES-GCM `CryptoKey`.

#### `aes-text-base64` (legacy, **decrypt-only**)

Reads the historical ciphertext produced by
`CryptoJS.AES.encrypt(text, passphrase).toString()` — the OpenSSL "salted"
envelope `base64("Salted__" ‖ salt[8] ‖ AES-256-CBC(text, key, iv))`. The
32-byte key and 16-byte IV are derived from the passphrase and salt via
OpenSSL's `EVP_BytesToKey` (MD5, one iteration); the cipher is AES-256-CBC with
PKCS#7 padding.

**Key material for this method is the passphrase STRING itself** — *not* base64
of key bytes (unlike `aes-256-gcm`). Put the passphrase directly into the
keyring:

```js
const keyring = new Keyring({ 'legacy-2019': 'the original passphrase' });
```

This method has **no `encrypt`**: it exists only to read pre-existing legacy
events, so `encryptEvent` / `encryptEventContent` throw for it. New events should
use a modern method. (MD5 — required only to reproduce the legacy key
derivation — is vendored internally; it is broken and is used for nothing else.)

#### `ecies-aes-256-gcm` (asymmetric, encrypt + decrypt)

ECIES over NIST P-256 with AES-256-GCM. A sender encrypts to a recipient's
**public** key; only the holder of the matching **private** key can decrypt — so
an encrypted event can be shared without ever moving a shared secret.

`content.payload` is
`base64(ephemeralPublicKey[65] ‖ iv[12] ‖ ciphertext ‖ gcm-tag[16])`, where the
ephemeral public key is a fresh P-256 point in SEC1 uncompressed form
(`0x04 ‖ X ‖ Y`). The AES-256-GCM key is
`HKDF-SHA-256(ECDH(ephemeral, recipient), salt = <empty>, info = "encrypted/ecies-aes-256-gcm")`.

**Key material** (each operation picks the side it needs):

- to **encrypt** — the recipient PUBLIC key as a `CryptoKey`, a JWK (no `d`), a
  raw 65-byte `Uint8Array` (SEC1 uncompressed) or its base64;
- to **decrypt** — the recipient PRIVATE key as a `CryptoKey` (ECDH), a JWK
  (has `d`), or base64 / `Uint8Array` PKCS#8;
- either operation also accepts a `{ publicKey, privateKey }` pair object holding
  any of the shapes above.

Mint a key pair (exportable JWK objects) with the method's `generateKeyPair()`:

```js
const { methods } = require('@pryv/encryption');
const { publicKey, privateKey } = await methods['ecies-aes-256-gcm'].generateKeyPair();

// sender only needs the public key:
const senderRing = new Keyring({ 'alice': publicKey });
const enc = await senderCipher.encryptEvent(plain, { method: 'ecies-aes-256-gcm', keyRef: 'alice' });

// alice decrypts with her private key (in her own keyring):
const aliceRing = new Keyring({ 'alice': privateKey });
const dec = await aliceCipher.decryptEvent(enc);
```

### Custom methods

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
