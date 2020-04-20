// Request URL: http://34.212.27.73:5000/api/account/5e6a7f6bfe7395109dbf4890/share-requests
import AgentService from './APIService';
// import Document from '../models/document/Document';
// import ShareRequest from '../models/ShareRequest';

const PATH = '/share-requests';

class ShareRequestService extends AgentService {

  static async get(accountId: string): Promise<any> {
    return await super.get(`/account/${accountId}${PATH}`);
  }

  static async approveShareRequest(id: string) {
    return await super.put(`/share-requests/${id}`, { approved: true });
  }

  static async deleteShareRequest(id: string) {
    return await super.delete(`/share-requests/${id}`);
  }

  static async addShareRequest(documentType: string, fromAccountId: string, toAccountId: string) {
    return await super.post('/share-requests', {shareRequest: {documentType, fromAccountId, toAccountId}});
  }

  static async addShareRequestFile(file: File, thumbnailFile: File, documentType: string, fromAccountId: string, toAccountId: string) {
    return await super.postShareRequestFile(file, thumbnailFile, documentType, fromAccountId, toAccountId);
  }
}

export default ShareRequestService;
