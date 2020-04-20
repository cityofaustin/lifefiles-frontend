import EthCrypto, {Encrypted} from 'eth-crypto';

const USE_ENCRYPTION = process.env.USE_ENCRYPTION;

class CryptoUtil {
  private static getPublicKeyByPrivateKey(privateEncryptionKey: string): string {
    return EthCrypto.publicKeyByPrivateKey(
      privateEncryptionKey
    );
  }

  private static async getEncrypted(publicEncryptionKey: string, input: string): Promise<Encrypted> {
    return await EthCrypto.encryptWithPublicKey(
      publicEncryptionKey,
      input
    );
  }

  static async getEncryptedPublicString(publicEncryptionKey: string, input: string): Promise<string> {
    if(USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const encrypted: Encrypted = await this.getEncrypted(publicEncryptionKey, input);
      return EthCrypto.cipher.stringify(encrypted);
    }
    else {
      return input;
    }
  }

  static async getEncryptedString(privateEncryptionKey: string, input: string): Promise<string> {
    if(USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const publicEncryptionKey = this.getPublicKeyByPrivateKey(privateEncryptionKey);
      const encrypted: Encrypted = await this.getEncrypted(publicEncryptionKey, input);
      return EthCrypto.cipher.stringify(encrypted);
    }
    else {
      return input;
    }
  }

  static async getDecryptedString(privateEncryptionKey: string, input: string): Promise<string> {
    if(USE_ENCRYPTION && USE_ENCRYPTION === 'true') {
      const ethCryptoEncryptedObject = EthCrypto.cipher.parse(input);
      return await EthCrypto.decryptWithPrivateKey(
        privateEncryptionKey,
        ethCryptoEncryptedObject
      );
    } else {
     return input;
    }
  }
}

export default CryptoUtil;
