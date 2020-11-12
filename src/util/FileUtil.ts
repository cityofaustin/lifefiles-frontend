import CryptoUtil from './CryptoUtil';
import StringUtil from './StringUtil';
import ZipUtil from './ZipUtil';

export default class FileUtil {
  static async dataURLToEncryptedFiles(dataUrl, didPublicEncryptionKey) {
    const encryptionPublicKey = didPublicEncryptionKey;
    const file: File = StringUtil.dataURLtoFile(dataUrl, 'original');
    const base64Thumbnail = await StringUtil.fileContentsToThumbnail(file);
    const encryptedString = await CryptoUtil.getEncryptedByPublicString(
      encryptionPublicKey!,
      dataUrl
    );
    const encryptedThumbnail = await CryptoUtil.getEncryptedByPublicString(
      encryptionPublicKey!,
      base64Thumbnail
    );
    const zipped: Blob = await ZipUtil.zip(encryptedString);
    const zippedThumbnail: Blob = await ZipUtil.zip(encryptedThumbnail);
    const newZippedFile = new File([zipped], 'encrypted-image.zip', {
      type: 'application/zip',
      lastModified: Date.now(),
    });
    const newZippedThumbnailFile = new File(
      [zippedThumbnail],
      'encrypted-image-thumbnail.zip',
      {
        type: 'application/zip',
        lastModified: Date.now(),
      }
    );
    return {
      newZippedFile,
      newZippedThumbnailFile,
    };
  }
}
