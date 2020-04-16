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
    const result = super.getAPIEndpoint() +
      `${PATH}/${filename}/${AuthService.getAccessToken()}`;
    return result;
  }

  static async addDocument(newFile: File, documentType: string, encryptionPubKey: string): Promise<any> {
    // const encryptionPubKey: string = '2fd1e5b5170eee3809b4175176f0412b098791b5d987a63981f61782e632d71743df19e293f57e524d76293c2deaaef1d64eda665eb3ab1a37d1bcc88fbec638';
    return await super.postDocument(newFile, documentType, encryptionPubKey);
  }

  static async updateDocument(request: UpdateDocumentRequest): Promise<Document> {
    return (await super.updateDocument(request)).updatedDocument;
  }

  static async deleteDocument(filename: string) {
    return await super.delete(`${PATH}/${filename}/${AuthService.getAccessToken()}`);
  }

}

export default DocumentService;
