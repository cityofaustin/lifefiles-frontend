import ShareRequest from './ShareRequest';
import Document from './document/Document';
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
  phoneNumber?: string;
  organization?: string;
  firstName?: string;
  lastName?: string;
  randomValue?: string;
}

export default Account;
