import ShareRequest from './ShareRequest';
import Document from './Document';

interface Account {
  username: string;
  id: string;
  email: string;
  role: string;
  didAddress: string;
  didPrivateKey?: string;
  hash?: string;
  salt?: string;
  token: string;
  documents: Document[];
  shareRequests: ShareRequest[];
}

export default Account;
