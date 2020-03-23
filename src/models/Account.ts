import ShareRequest from './ShareRequest';
import Document from './Document';
import Role from './Role';

interface Account {
  username: string;
  id: string;
  email: string;
  role: Role;
  didAddress: string;
  didPrivateKey?: string;
  hash?: string;
  salt?: string;
  token: string;
  documents: Document[];
  shareRequests: ShareRequest[];
  profileImageUrl?: string;
}

export default Account;
