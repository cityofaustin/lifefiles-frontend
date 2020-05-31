import AgentService from './APIService';
import AccountType from '../models/admin/AccountType';

class AdminService extends AgentService {
  static async getAdminInfo() {
    return await super.get('/my-admin-account');
  }

  static async deleteDocumentType(docTypeId) {
    return await super.delete('/admin-document-types/' + docTypeId);
  }

  static async addNewDocumentType(docTypeReq) {
    return await super.post('/admin-document-types/', docTypeReq);
  }

  static async updatedDocumentType(documentType) {
    return await super.put(
      '/admin-document-types/' + documentType._id,
      documentType
    );
  }

  static async addAccountType(accountType: AccountType) {
    return await super.post('/admin-account-types/', accountType);
  }

  static async updateAccountType(accountType: AccountType) {
    return await super.put(
      '/admin-account-types/' + accountType._id,
      accountType
    );
  }

  static async deleteAccountType(accountTypeId) {
    return await super.delete('/admin-account-types/' + accountTypeId);
  }

  static async addAccount(accountReq) {
    return await super.post('/admin-accounts/', accountReq);
  }

  static async updateAccount(account) {
    return await super.put('/admin-accounts/' + account.id, account);
  }

  static async deleteAccount(accountId) {
    return await super.delete('/admin-accounts/' + accountId);
  }
}

export default AdminService;
