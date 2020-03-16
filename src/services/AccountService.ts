import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import LoginResponse from '../models/auth/LoginResponse';

const PATH = '/accounts';

class AccountService extends AgentService {

  static async login(request: LoginRequest): Promise<LoginResponse> {
    return await super.post(`${PATH}/login`, request);
  }

  static async getMyAccount(): Promise<LoginResponse> {
    return await super.get('/my-account');
  }

}

export default AccountService;
