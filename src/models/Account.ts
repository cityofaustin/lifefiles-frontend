import ShareRequest from './ShareRequest';
import Document from './document/Document';
import Role from './Role';
// import AccountType from './admin/AccountType';

interface Account {
  username: string;
  _id?: string;
  id: string;
  email: string;
  role: Role;
  didAddress: string;
  didPublicEncryptionKey?: string;
  token: string;
  documents: Document[];
  shareRequests: ShareRequest[];
  profileImageUrl?: string;
  phoneNumber?: string;
  organization?: string;
  firstName?: string;
  lastName?: string;
  adminInfo?: any;
  action?: any;
  accountType?: string;
  canAddOtherAccounts?: boolean;
}

export default Account;
