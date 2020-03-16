interface LoginRequest {
  account: LoginAccount;
}

interface LoginAccount {
  email: string;
  password: string;
}

export default LoginRequest;
