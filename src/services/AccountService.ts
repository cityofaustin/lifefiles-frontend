import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import LoginResponse from '../models/auth/LoginResponse';
import OauthUrlResponse from '../models/auth/OauthUrlResponse';
import Account from '../models/Account';
import AuthService from './AuthService';

const PATH = '/accounts';

let AUTH_API = undefined;

class AccountService extends AgentService {
  static async getOauthEndpoint(): Promise<OauthUrlResponse> {
    const url = await super.get('/oauth-url');
    return url;
  }

  static setAuthApi(authApi) {
    AUTH_API = authApi;
  }

  static getAuthApi() {
    return AUTH_API;
  }

  static async getToken(code) {
    const params = {
      code,
      client_id: process.env.CLIENT_ID,
      grant_type: 'authorization_code',
      redirect_uri: `${location.origin}${location.pathname}`,
      // redirect_uri: location.origin,
    };
    const body = Object.keys(params)
      .map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      })
      .join('&');

    const input = `${AUTH_API}/token`;
    // const input = `http://localhost:5001/token`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    };

    const init = {
      method: 'POST',
      headers,
      body,
    };

    try {
      const response = await fetch(input, init);

      const responseJson = await response.json();
      // this.handleErrorStatusCodes(response.status, responseJson);
      return responseJson;
    } catch (err) {
      console.log('Post token error:');
      console.log(err);
      console.error(err.message);
    }
  }

  static async loginHelperAccount(request: LoginRequest) {
    return await super.post(`${PATH}/login`, request);
  }

  static async loginAdminAccount(request: LoginRequest) {
    return await super.post(`${PATH}/admin-login`, request);
  }

  static async getMyAccount(): Promise<LoginResponse> {
    return await super.get('/my-account');
  }

  static async getAccounts(): Promise<Account[]> {
    return await super.get(PATH);
  }

  static getProfileURL(filename: string) {
    return (
      super.getAPIEndpoint() +
      `/profile-image/${filename}/${AuthService.getAccessToken()}`
    );
  }

  static getEncryptionKey() {
    return super.get('/get-encryption-key');
  }
}

export default AccountService;
