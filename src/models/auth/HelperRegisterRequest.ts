import Role from '../Role';

export default interface HelperRegisterRequest {
  account: HelperAccountRequest;
  file: File;
}

export interface HelperAccountRequest {
  email: string;
  password: string;
  username: string;
  firstname: string;
  lastname: string;
  publicEncryptionKey?: string;
  notaryId?: string;
  notaryState?: string;
  role: Role;
}
