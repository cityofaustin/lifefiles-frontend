import EthCrypto, { Encrypted } from 'eth-crypto';

const USE_ENCRYPTION = process.env.REACT_APP_USE_ENCRYPTION;

class CryptoUtil {
  static getPublicKeyByPrivateKey(
    privateEncryptionKey: string
  ): string {
    return EthCrypto.publicKeyByPrivateKey(privateEncryptionKey);
  }

  static getAddressByPublicKey(key: string): string {
    return EthCrypto.publicKey.toAddress(key);
  }

  private static async getEncrypted(
    publicEncryptionKey: string,
    input: string
  ): Promise<Encrypted> {
    return await EthCrypto.encryptWithPublicKey(publicEncryptionKey, input);
  }

  static async getEncryptedByPublicString(
    publicEncryptionKey: string,
    input: string
  ): Promise<string> {
    if (USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const encrypted: Encrypted = await this.getEncrypted(
        publicEncryptionKey,
        input
      );
      return EthCrypto.cipher.stringify(encrypted);
    } else {
      return input;
    }
  }

  static async getEncryptedString(
    privateEncryptionKey: string,
    input: string
  ): Promise<string> {
    if (USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const publicEncryptionKey = this.getPublicKeyByPrivateKey(
        privateEncryptionKey
      );
      const encrypted: Encrypted = await this.getEncrypted(
        publicEncryptionKey,
        input
      );
      return EthCrypto.cipher.stringify(encrypted);
    } else {
      return input;
    }
  }

  static async getDecryptedString(
    privateEncryptionKey: string,
    input: string
  ): Promise<string> {
    if (USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const ethCryptoEncryptedObject = EthCrypto.cipher.parse(input);
      return await EthCrypto.decryptWithPrivateKey(
        privateEncryptionKey,
        ethCryptoEncryptedObject
      );
    } else {
      return input;
    }
  }

  static generateKey(): string {
    const privateKey = [...Array(64)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
    console.log(privateKey);
    return privateKey;
  }

  static isValidKey(key: string): boolean {
    return /[0-9A-Fa-f]{64}/.test(key);
  }
}

export default CryptoUtil;
