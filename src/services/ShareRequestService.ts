import ShareRequest from '../models/ShareRequest';
// Request URL: http://34.212.27.73:5000/api/account/5e6a7f6bfe7395109dbf4890/share-requests
import AgentService from './APIService';
// import Document from '../models/document/Document';
// import ShareRequest from '../models/ShareRequest';

const PATH = '/share-requests';

export interface ShareRequestPermissions {
  canView: boolean;
  canReplace: boolean;
  canDownload: boolean;
}

class ShareRequestService extends AgentService {
  static async get(accountId: string): Promise<any> {
    return await super.get(`/account/${accountId}${PATH}`);
  }

  static async updateShareRequestPermissions(sr: ShareRequest) {
    return await super.put(`${PATH}/${sr._id}/permissions`, sr);
  }

  static async approveShareRequestFile(
    file: File,
    thumbnailFile: File,
    id: string,
    permissions: ShareRequestPermissions
  ) {
    return await super.putShareRequestFile(
      `/share-requests/${id}`,
      file,
      thumbnailFile
    );
  }

  static async deleteShareRequest(id: string) {
    return await super.delete(`/share-requests/${id}`);
  }

  static async addShareRequestFile(
    file: File | undefined,
    thumbnailFile: File | undefined,
    documentType: string,
    fromAccountId: string,
    toAccountId: string,
    permissions: ShareRequestPermissions
  ): Promise<ShareRequest> {
    return await super.postShareRequestFile(
      file,
      thumbnailFile,
      documentType,
      fromAccountId,
      toAccountId,
      permissions
    );
  }
}

export default ShareRequestService;
