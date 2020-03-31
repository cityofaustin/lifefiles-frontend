import AgentService from './APIService';
import AuthService from './AuthService';
import UpdateDocumentRequest from '../models/document/UpdateDocumentRequest';
import Document from '../models/document/Document';

const PATH = '/documents';

class DocumentService extends AgentService {

  static async get(): Promise<any> {
    return await super.get(PATH);
  }

  static getDocumentURL(filename: string) {
    return super.getAPIEndpoint() +
      `${PATH}/${filename}/${AuthService.getAccessToken()}`;
  }

  static async addDocument(newFile: File, documentType: string): Promise<any> {
    return await super.postDocument(newFile, documentType);
  }

  static async updateDocument(request: UpdateDocumentRequest): Promise<Document> {
    return (await super.updateDocument(request)).updatedDocument;
  }

  static async deleteDocument(filename: string) {
    return await super.delete(`${PATH}/${filename}/${AuthService.getAccessToken()}`);
  }

}

export default DocumentService;
