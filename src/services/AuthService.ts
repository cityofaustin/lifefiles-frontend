class AuthService {
  private static ACCESS_TOKEN: string = 'accessToken';
  private static REFRESH_TOKEN: string = 'refreshToken';

  static isLoggedIn(): boolean {
    return (
      !!localStorage.getItem(this.ACCESS_TOKEN) &&
      localStorage.getItem(this.ACCESS_TOKEN) !== 'undefined'
    );
  }

  static getAccessToken(): string {
    return localStorage.getItem(this.ACCESS_TOKEN)!;
  }

  static isNonAuthPath(path: string) {
    const nonAuthPaths = ['/document-types'];
    nonAuthPaths.some((nonAuthPath) => path.indexOf(nonAuthPath) > -1);
  }

  static logIn(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
  }

  static logOut() {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    // redirect to auth server
    window.location.replace(location.origin + location.pathname + location.hash);
    window.location.reload();
  }
}

export default AuthService;
