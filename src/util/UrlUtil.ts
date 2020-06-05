
export default class UrlUtil {
  static getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for(const varItem of vars) {
      const pair = varItem.split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
    console.log('Query variable %s not found', variable);
}
}
