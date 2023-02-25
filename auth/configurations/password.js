/**
 * Class to encrypt and verify password
 */
import * as crypto from 'crypto';

import constant from './constant.js';

const hackathonKey = Buffer.from(constant.hackathon.key, 'base64url');
const hackathonIV = Buffer.from(constant.hackathon.iv, 'base64url');

class PasswordManager {
  constructor() {
    this.pwdAlgs = [
      {
        iteration: 999992,
        salt_length: 32,
        key_length: 64,
        digest: 'sha512',
      },
    ];
  }

  /**
   * This function will check if the password matches or not
   * NOTE: Replace the Buffer.compare with a crypto.timingSafeEqual
   * @param {string} user
   * @param {Buffer} salt
   * @param {Buffer} password
   * @param {number} alg_idx Algorithm used to decrypt the password, default to 0
   * @returns {Promise<boolean>} Boolean value, true if matched, false otherwise
   */
  verify(user, salt, password, alg_idx = 0) {
    return new Promise((resolve, reject) => {
      if (!this.pwdAlgs[alg_idx]) {
        return reject(new Error('Algorithm not found'));
      }
      crypto.pbkdf2(user, salt, this.pwdAlgs[alg_idx].iteration, this.pwdAlgs[alg_idx].key_length, this.pwdAlgs[alg_idx].digest, (pbkdfErr, derivedPassword) => {
        if (pbkdfErr) {
          return reject(pbkdfErr);
        }
        return resolve((crypto.timingSafeEqual(derivedPassword, password) === true));
      });
    });
  }

  /**
   * @typedef Password
   * @type {object}
   * @property {Buffer} salt - salt used to encrypt
   * @property {Buffer} password - plain text password
   */
  /**
   * Take a password as entry parameters and return the encrypted object with it.
   * @param {string} user
   * @param {number} alg_idx Algorithm used to encrypt the password, default to 0
   * @returns {Promise<Password>} Password object type
   */
  encrypt(user, alg_idx = 0) {
    return new Promise((resolve, reject) => {
      if (!this.pwdAlgs[alg_idx]) {
        return reject(new Error('Algorithm not found'));
      }
      crypto.randomBytes(this.pwdAlgs[alg_idx].salt_length, (errSalt, generatedSalt) => {
        if (errSalt) {
          return reject(errSalt);
        }
        return crypto.pbkdf2(user, generatedSalt, this.pwdAlgs[alg_idx].iteration, this.pwdAlgs[alg_idx].key_length, this.pwdAlgs[alg_idx].digest, (pbkdfErr, derivedPassword) => {
          if (pbkdfErr) {
            return reject(pbkdfErr);
          }
          return resolve({
            salt: generatedSalt,
            password: derivedPassword,
          });
        });
      });
    });
  }

  /**
   * Convert the object to a json stringify and encrypt it
   * @param {Object} object 
   */
  encryptHackathon(object) {
    return new Promise((resolve, reject) => {
      try {
        const cipher = crypto.createCipheriv("aes-256-cbc",hackathonKey,hackathonIV);
        let encrypted = cipher.update(JSON.stringify(object));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        resolve(encrypted);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Take the string object decrypt and parse it
   * @param {string} object 
   */
  decryptHackathon(object) {
    return new Promise((resolve, reject) => {
      try {
        const decipher = crypto.createDecipheriv("aes-256-cbc",hackathonKey,hackathonIV);
        let decrypted = decipher.update(object);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        resolve(JSON.parse(decrypted));
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const passwordManager = new PasswordManager();
