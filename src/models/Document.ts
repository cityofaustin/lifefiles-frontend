import Account from './Account';

interface Document {
  _id?: string;
  name?: string;
  url: string;
  notarized?: boolean;
  did?: string;
  hash: string;
  vcJwt?: string;
  vpJwt?: string;
  type: string;
  uploadedBy?: Account;
  belongsTo?: Account;
  sharedWithAccountIds: string[];
}

export default Document;
