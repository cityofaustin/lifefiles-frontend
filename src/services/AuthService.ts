class AuthService {
  private static ACCESS_TOKEN: string = 'accessToken';
  private static REFRESH_TOKEN: string = 'refreshToken';

  static isLoggedIn(): boolean {
    return (
      !!sessionStorage.getItem(this.ACCESS_TOKEN) &&
      sessionStorage.getItem(this.ACCESS_TOKEN) !== 'undefined'
    );
  }

  static getAccessToken(): string {
    return sessionStorage.getItem(this.ACCESS_TOKEN)!;
  }

  static isNonAuthPath(path: string) {
    const nonAuthPaths = ['/document-types'];
    nonAuthPaths.some((nonAuthPath) => path.indexOf(nonAuthPath) > -1);
  }

  static logIn(accessToken: string, refreshToken: string) {
    sessionStorage.setItem(this.ACCESS_TOKEN, accessToken);
    sessionStorage.setItem(this.REFRESH_TOKEN, refreshToken);
  }

  static logOut() {
    sessionStorage.removeItem(this.ACCESS_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
    // redirect to auth server
    window.location.replace(location.origin + location.pathname + location.hash);
    window.location.reload();
  }
}

export default AuthService;
