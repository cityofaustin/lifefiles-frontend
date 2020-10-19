import Account from '../Account';

interface LoginResponse {
  account: Account;
  coreFeatures: string[];
  viewFeatures: string[];
}

export default LoginResponse;
