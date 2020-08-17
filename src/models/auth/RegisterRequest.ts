interface RegisterRequest {
  account: RegisterAccount;
}

interface RegisterAccount {
  email: string;
  password: string;
  username: string;
}

export default RegisterRequest;
