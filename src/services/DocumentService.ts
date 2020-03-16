import AgentService from './APIService';
import AuthService from './AuthService';

const PATH = '/documents';

class DocumentService extends AgentService {

  static async get(): Promise<any> {
    return await super.get(PATH);
  }

  static getDocumentURL(filename: string) {
    return super.getAPIEndpoint() +
      `${PATH}/${filename}/${AuthService.getAccessToken()}`;
  }

  static async addDocument(newFile: File): Promise<any> {
    return await super.postDocument(newFile);
  }

  static async deleteDocument(filename: string) {
    return await super.delete(`${PATH}/${filename}/${AuthService.getAccessToken()}`);
  }

}

export default DocumentService;
