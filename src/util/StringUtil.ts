import JSZip from 'jszip';

class StringUtil {
  static getFirstUppercase(input: string): string {
    let result = '';
    if (input.length > 0) {
      result = input.substr(0, 1).toUpperCase();
    }
    return result;
  }

  // https://stackoverflow.com/a/2117523
  static getUuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line:no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: number) =>
    //   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    // );
  }

  static async compressString(input: string): Promise<Blob> {
    // TODO
    const zip = new JSZip();
    zip.file('encrypted.txt', input);
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE'
    });
    return content;
  }
}

export default StringUtil;
