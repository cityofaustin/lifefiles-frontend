import Resizer from 'react-image-file-resizer';

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
      const r = (Math.random() * 16) | 0;
      // tslint:disable-next-line:no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c: number) =>
    //   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    // );
  }

  static fileContentsToString(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  static dataURLtoFile(dataurl: string, filename: string): File {
    const arr: string[] = dataurl.split(',');
    const mime: string = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  static fileContentsToThumbnailString(file: File): Promise<string> {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file, // is the file of the new image that can now be uploaded...
        450, // is the maxWidth of the new image
        450, // is the maxHeight of the new image
        'JPEG', // is the compressFormat of the new image
        75, // is the quality of the new image NOTE: can't compress since PNG
        0, // is the rotatoion of the new image
        (data) => {
          resolve(data);
        },  // is the callBack function of the new image URI
        'base64'  // is the output type of the new image
      );
    });
  }

  static async stringFromFile(input: Blob): Promise<string> {
    const readFileAsync = (inputFile: any) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(inputFile);
      });
    };

    const returnString = await readFileAsync(input);
    return returnString as string;
  }
}

export default StringUtil;
