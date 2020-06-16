import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import LoginResponse from '../models/auth/LoginResponse';
import Account from '../models/Account';
import AuthService from './AuthService';

const PATH = '/accounts';
const MYPASS_API = process.env.MYPASS_API;
const AUTH_API = process.env.AUTH_API;
const CLIENT_ID = process.env.CLIENT_ID;
class AccountService extends AgentService {
  // static async login(request: LoginRequest) {
  //   const input = `${MYPASS_API!.substring(
  //     0,
  //     MYPASS_API!.length - 3
  //   )}oauth/authorize`;
  //   const headers = { 'Content-Type': 'application/json' };
  //   const init = {
  //     method: 'POST',
  //     headers,
  //     body: JSON.stringify({
  //       username: request.account.email,
  //       password: request.account.password,
  //       client_id: CLIENT_ID,
  //       state: 'abc',
  //       response_type: 'code',
  //     }),
  //   };
  //   try {
  //     const response = await fetch(input, init);
  //     //       redirected: true
  //     // status: 200
  //     // statusText: "OK"
  //     // type: "cors"
  //     // url: "http://localhost:3001/?code=124308510b8d9d63276e57d3fec6f77399fcea08&state=abc"
  //     if (response.redirected && response.url) {
  //       window.location.replace(response.url);
  //     }
  //     // const responseJson = await response.json();
  //     // this.handleErrorStatusCodes(response.status, responseJson);
  //     return {};
  //   } catch (err) {
  //     console.error(err.message);
  //   }
  //   // return await super.post(`${PATH}/login`, request);
  // }

  static async getToken(code) {
    const params = {
      code,
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      redirect_uri: `${location.origin}/index.html`,
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

    console.log('START OUTPUT');

    console.log(headers);
    console.log(params);
    console.log(body);
    console.log(input);
    try {
      const response = await fetch(input, init);
      console.log(response);

      const responseJson = await response.json();
      // this.handleErrorStatusCodes(response.status, responseJson);
      return responseJson;
    } catch (err) {
      console.log('POST TOKEN ERROR!:');
      console.log(err);
      console.error(err.message);
    }
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
