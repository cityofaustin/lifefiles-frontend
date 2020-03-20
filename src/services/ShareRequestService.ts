// Request URL: http://34.212.27.73:5000/api/account/5e6a7f6bfe7395109dbf4890/share-requests
import AgentService from './APIService';
import Document from '../models/Document';

const PATH = '/share-requests';

class ShareRequestService extends AgentService {

  static async get(accountId: string): Promise<any> {
    return await super.get(`/account/${accountId}${PATH}`);
  }
}

export default ShareRequestService;
