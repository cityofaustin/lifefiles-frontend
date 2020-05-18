import AgentService from './APIService';
import LoginRequest from '../models/auth/LoginRequest';
import LoginResponse from '../models/auth/LoginResponse';
import Account from '../models/Account';
import AuthService from './AuthService';

const PATH = '/accounts';

class AccountService extends AgentService {
  static async getAdminInfo() {
    return await super.get('/my-admin-account');
  }

  static async deleteDocumentType(docTypeId) {
    return await super.delete('/admin-document-types/' + docTypeId);
  }

  static async addNewDocumentType(docTypeReq) {
    return await super.post('/admin-document-types/', docTypeReq);
  }
}

export default AccountService;
