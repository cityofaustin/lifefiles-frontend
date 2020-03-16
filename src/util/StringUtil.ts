class StringUtil {
  static getFirstUppercase(input: string): string {
    let result = '';
    if(input.length > 0) {
      result = input.substr(0,1).toUpperCase();
    }
    return result;
  }
}

export default StringUtil;
