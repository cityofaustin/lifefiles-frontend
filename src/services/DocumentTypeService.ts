import AgentService from './APIService';
import Document from '../models/document/Document';

const PATH = '/document-types';

class DocumentTypeService extends AgentService {

  static async get(): Promise<any> {
    return await super.get(PATH);
  }

  static async getDocumentTypesAccountHas(accountId: string) {
    return await super.get(`/account/${accountId}`+PATH);
  }

  static findDocumentTypeMatchInDocuments(documentTypeName: string, documents: Document[]) {
    return documents.some(document => document.type === documentTypeName);
  }

}

export default DocumentTypeService;
