import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import LoginResponse from '../models/auth/LoginResponse';
import Account from '../models/Account';
import AuthService from './AuthService';

const PATH = '/accounts';

class AccountService extends AgentService {

  static async login(request: LoginRequest): Promise<LoginResponse> {
    return await super.post(`${PATH}/login`, request);
  }

  static async getMyAccount(): Promise<LoginResponse> {
    return await super.get('/my-account');
  }

  static async getAccounts(): Promise<Account[]> {
    return await super.get(PATH);
  }

  static getProfileURL(filename: string) {
    return super.getAPIEndpoint() +
      `/profile-image/${filename}/${AuthService.getAccessToken()}`;
  }

  static getEncryptionKey() {
    return super.get('/get-encryption-key');
  }

}

export default AccountService;
