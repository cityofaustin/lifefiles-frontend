import ApiService from './APIService';

export interface HelperContactRequest {
  helperAccountId: string;
  isSocialAttestationEnabled: boolean;
  canAddNewDocuments: boolean;
}

export default class HelperContactService extends ApiService {
  static path: string = '/helper-contacts';
  static async getHelperContacts() {
    return await super.get(this.path);
  }

  static async addHelperContact(helperContactReq: HelperContactRequest) {
    return await super.post(this.path, helperContactReq);
  }
}
