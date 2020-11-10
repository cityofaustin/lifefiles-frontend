import AccountService from './AccountService';

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

  static logOut(isSecure = false) {
    sessionStorage.removeItem(this.ACCESS_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
    // redirect to auth server
    if(isSecure) {
      const l = location.origin + location.pathname + '#/secure-login';
      window.location.replace(l);
    } else {
      window.location.replace(location.origin + location.pathname + location.hash);
      window.location.reload();
    }
  }

  static deleteOwnerAccount() {
    // redirect to unregister page with all of the query string params
    const scope = '';
    const state = '';
    const jwt = this.getAccessToken();
    sessionStorage.removeItem(this.ACCESS_TOKEN);
    sessionStorage.removeItem(this.REFRESH_TOKEN);
    window.location.replace(
      AccountService.getAuthApi() +
        `/unregister?access_token=${jwt}&client_id=${process.env.CLIENT_ID}&response_type=code&redirect_url=${location.origin}${location.pathname}&scope=${scope}&state=${state}`
    );
  }
}

export default AuthService;
