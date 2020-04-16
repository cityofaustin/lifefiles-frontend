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
