// Created from freshmint package until the PR https://github.com/dapperlabs/freshmint/pull/178 is accepted
import elliptic from 'elliptic';
import { createHash } from 'crypto';
import { SHA3 } from 'sha3';
import { withPrefix, sansPrefix } from '@onflow/util-address';

const toHex = (buffer) => buffer.toString('hex');
const fromHex = (hex) => Buffer.from(hex, 'hex');

const ECDSA_P256 = new elliptic.ec('p256');
const ECDSA_secp256k1 = new elliptic.ec('secp256k1');

const bufferEndianness = 'be';

export const SignatureAlgorithm = {
  ECDSA_P256: 'ECDSA_P256',
  ECDSA_secp256k1: 'ECDSA_secp256k1',
}

function getEC(sigAlgo) {
  switch (sigAlgo) {
    case SignatureAlgorithm.ECDSA_P256:
      return ECDSA_P256;
    case SignatureAlgorithm.ECDSA_secp256k1:
      return ECDSA_secp256k1;
  }
}

class InvalidECSignatureError extends Error {}

export const HashAlgorithm = {
  SHA2_256: 'SHA2_256',
  SHA3_256: 'SHA3_256',
}

export class SHA2_256Hasher {
  static shaType = 'sha256';

  hash(message) {
    const hash = createHash(SHA2_256Hasher.shaType);
    hash.update(message);
    return hash.digest();
  }
}

export class SHA3_256Hasher {
  static size = 256;

  hash(message) {
    const hash = new SHA3(SHA3_256Hasher.size);
    hash.update(message);
    return hash.digest();
  }
}

export function getHasher(hashAlgo) {
  switch (hashAlgo) {
    case HashAlgorithm.SHA2_256:
      return new SHA2_256Hasher();
    case HashAlgorithm.SHA3_256:
      return new SHA3_256Hasher();
  }
}

class ECSignature {
  static n = 32;
  r;
  s;

  constructor(r, s) {
    this.r = r;
    this.s = s;
  }

  static fromECSignature(ecSignature) {
    return new ECSignature(
      ecSignature.r.toBuffer(bufferEndianness, ECSignature.n),
      ecSignature.s.toBuffer(bufferEndianness, ECSignature.n),
    );
  }

  static fromHex(hex) {
    const buffer = Buffer.from(hex, 'hex');
    return ECSignature.fromBuffer(buffer);
  }

  static fromBuffer(buffer) {
    if (buffer.length !== ECSignature.n * 2) {
      throw new InvalidECSignatureError(`signature must have length ${ECSignature.n * 2}`);
    }

    return new ECSignature(buffer.slice(0, ECSignature.n), buffer.slice(ECSignature.n));
  }

  toObject() {
    return {
      r: this.r.toString('hex'),
      s: this.s.toString('hex'),
    };
  }

  toBuffer() {
    return Buffer.concat([this.r, this.s]);
  }

  toHex() {
    return this.toBuffer().toString('hex');
  }
}

export class ECPublicKey {
  static size = 32;
  ecKeyPair;
  sigAlgo;

  constructor(ecKeyPair, sigAlgo) {
    this.ecKeyPair = ecKeyPair;
    this.sigAlgo = sigAlgo;
  }

  static fromBuffer(buffer, sigAlgo) {
    const hex = buffer.toString('hex');
    return ECPublicKey.fromHex(hex, sigAlgo);
  }

  static fromHex(hex, sigAlgo) {
    const ec = getEC(sigAlgo);

    // Public Key MUST be either:
    // 1) '04' + hex string of x + hex string of y; or
    // 2) object with two hex string properties (x and y); or
    // 3) object with two buffer properties (x and y)
    const publicKey = '04' + hex;

    const ecKeyPair = ec.keyFromPublic(publicKey, 'hex');

    return new ECPublicKey(ecKeyPair, sigAlgo);
  }

  verify(message, signature) {
    try {
      const ecSignature = ECSignature.fromBuffer(signature);
      return this.ecKeyPair.verify(message, ecSignature.toObject());
    } catch (e) {
      return false;
    }
  }

  toBuffer() {
    const publicKey = this.ecKeyPair.getPublic();

    const x = publicKey.getX().toArrayLike(Buffer, bufferEndianness, ECPublicKey.size);
    const y = publicKey.getY().toArrayLike(Buffer, bufferEndianness, ECPublicKey.size);

    return Buffer.concat([x, y]);
  }

  toHex() {
    return this.toBuffer().toString('hex');
  }

  signatureAlgorithm() {
    return this.sigAlgo;
  }
}

export class InMemoryECPrivateKey {
  ecKeyPair;
  sigAlgo;

  constructor(ecKeyPair, sigAlgo) {
    this.ecKeyPair = ecKeyPair;
    this.sigAlgo = sigAlgo;
  }

  static fromElliptic(ecKeyPair, sigAlgo) {
    return new InMemoryECPrivateKey(ecKeyPair, sigAlgo);
  }

  static fromBuffer(buffer, sigAlgo) {
    const ec = getEC(sigAlgo);
    const ecKeyPair = ec.keyFromPrivate(buffer);
    return new InMemoryECPrivateKey(ecKeyPair, sigAlgo);
  }

  static fromHex(hex, sigAlgo) {
    const buffer = Buffer.from(hex, 'hex');
    return InMemoryECPrivateKey.fromBuffer(buffer, sigAlgo);
  }

  sign(digest) {
    const ecSignature = this.ecKeyPair.sign(digest);
    return ECSignature.fromECSignature(ecSignature).toBuffer();
  }

  getPublicKey() {
    const pubPoint = this.ecKeyPair.getPublic();

    const ec = getEC(this.sigAlgo);

    const x = pubPoint.getX();
    const y = pubPoint.getY();

    const publicKey = {
      x: x.toString('hex'),
      y: y.toString('hex'),
    };

    const ecKeyPair = ec.keyFromPublic(publicKey);

    return new ECPublicKey(ecKeyPair, this.sigAlgo);
  }

  getSignatureAlgorithm() {
    return this.sigAlgo;
  }

  toBuffer() {
    return this.ecKeyPair.getPrivate().toArrayLike(Buffer, bufferEndianness);
  }

  toHex() {
    return this.toBuffer().toString('hex');
  }
}

export class InMemoryECSigner {
  privateKey;
  hasher;

  constructor(privateKey, hashAlgo) {
    this.privateKey = privateKey;
    this.hasher = getHasher(hashAlgo);
  }

  sign(message) {
    const digest = this.hasher.hash(message);
    return this.privateKey.sign(digest);
  }
}

export class TransactionAuthorizer {
  address;
  keyIndex;
  signer;

  constructor({ address, keyIndex, signer }) {
    this.address = address;
    this.keyIndex = keyIndex;
    this.signer = signer;
  }

  // Convert this authorizer to an authorization function that can be passed to FCL-JS.
  //
  // FCL will invoke the authorization function when resolving signatures for a transaction.
  //
  // Ref: https://github.com/onflow/fcl-js/blob/3355cb148f2e6a447d8076b3ae62c40747c338ce/packages/fcl/src/wallet-provider-spec/authorization-function.md#how-to-create-an-authorization-function
  //
  toFCLAuthorizationFunction() {
    return async (account = {}) => {
      const keyIndex = Number(this.keyIndex);

      return {
        ...account,
        tempId: `${withPrefix(this.address)}-${keyIndex}`,
        addr: sansPrefix(this.address),
        keyId: keyIndex,
        signingFunction: async (data) => {
          const message = fromHex(data.message);

          const signature = await this.signer.sign(message);

          return {
            addr: withPrefix(this.address),
            keyId: keyIndex,
            signature: toHex(signature),
          };
        },
      };
    };
  }
}
