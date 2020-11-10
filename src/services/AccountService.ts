import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import RegisterRequest from '../models/auth/RegisterRequest';
import LoginResponse from '../models/auth/LoginResponse';
import OauthUrlResponse from '../models/auth/OauthUrlResponse';
import HelperRegisterRequest from '../models/auth/HelperRegisterRequest';
import Account from '../models/Account';
import AuthService from './AuthService';

const PATH = '/accounts';

let AUTH_API;

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

  static async registerSecureAccount(request: HelperRegisterRequest) {
    // return await super.post(`/helper-accounts`, request);
    return await super.registerSecure(request);
  }

  static async secureLoginHelperAccount(request) {
    return await super.post(`${PATH}/secure-login`, request);
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

  static async deleteMyAccount() {
    return await super.delete('/my-account');
  }

  static async updateMyAccount(account: Account) {
    return await super.updateMyAccount(account);
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

  static getImageURL(filename: string) {
    return super.getAPIEndpoint() + `/image/${filename}`;
  }

  static async getEncryptionKey(isSecure = false) {
    if (isSecure) {
      return super.get('/get-encryption-key');
    } else {
      return super.getWithEndpoint(AUTH_API, '/get-encryption-key');
    }
  }

  static async getHelperEncryptionKey() {
    return super.get('/get-encryption-key');
  }
}

export default AccountService;
