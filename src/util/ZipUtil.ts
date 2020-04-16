import JSZip from 'jszip';
// tslint:disable-next-line:no-var-requires
const JSZipUtils = require('jszip-utils');

class ZipUtil {
  static async zip(input: string): Promise<Blob> {
    const zip = new JSZip();
    zip.file('encrypted.txt', input);
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    });
  }

  static async unzip(inputUrl: string): Promise<string> {
    const data: any = await new JSZip.external.Promise((resolve, reject) => {
      JSZipUtils.getBinaryContent(inputUrl, (err: any, data2: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data2);
        }
      });
    });

    const zip: JSZip = await JSZip.loadAsync(data);
    const unzippedFile: string = Object.keys(zip.files)[0];
    return await zip.files[unzippedFile].async('string');
  }
}

export default ZipUtil;
