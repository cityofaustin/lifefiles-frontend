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
    const result =
      super.getAPIEndpoint() +
      `${PATH}/${filename}/${AuthService.getAccessToken()}`;
    return result;
  }

  static async addDocument(
    newFile: File,
    newThumbnailFile: File,
    documentType: string,
    encryptionPubKey: string,
    validUntilDate?: Date
  ): Promise<any> {
    return await super.postDocument(
      newFile,
      newThumbnailFile,
      documentType,
      encryptionPubKey,
      validUntilDate
    );
  }

  static async uploadDocumentOnBehalfOfUser(
    newCaseworkerFile: File,
    newCaseworkerThumbnail: File,
    newOwnerFile: File,
    newOwnerThumbnail: File,
    documentType: string,
    ownerId: string,
    validUntilDate?: Date
  ) {
    return await super.uploadDocumentOnBehalfOfUser(
      newCaseworkerFile,
      newCaseworkerThumbnail,
      newOwnerFile,
      newOwnerThumbnail,
      documentType,
      ownerId,
      validUntilDate
    );
  }

  static async getByShareRequest(shareRequestId) {
    return await super.get(`/share-requests/${shareRequestId}${PATH}`);
  }

  static async updateDocument(
    request: UpdateDocumentRequest
  ): Promise<Document> {
    return (await super.updateDocument(request)).updatedDocument;
  }

  static async deleteDocument(filename: string) {
    return await super.delete(
      `${PATH}/${filename}/${AuthService.getAccessToken()}`
    );
  }
}

export default DocumentService;
