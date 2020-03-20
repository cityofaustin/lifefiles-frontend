class AuthService {
  private static ACCESS_TOKEN: string = 'accessToken';

  static isLoggedIn(): boolean {
    return (!!localStorage.getItem(this.ACCESS_TOKEN) && localStorage.getItem(this.ACCESS_TOKEN) !== 'undefined');
  }

  static getAccessToken(): string {
    return localStorage.getItem(this.ACCESS_TOKEN)!;
  }

  static isNonAuthPath(path: string) {
    const nonAuthPaths = ['/document-types'];
    nonAuthPaths.some(nonAuthPath => path.indexOf(nonAuthPath) > -1);
  }

  static logIn(accessToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN, accessToken);
  }

  static logOut() {
    localStorage.removeItem(this.ACCESS_TOKEN);
  }
}

export default AuthService;
