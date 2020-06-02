import Account from '../Account';

interface Document {
  _id?: string;
  id?: string;
  name?: string;
  url: string;
  thumbnailUrl: string;
  notarized?: boolean;
  did?: string;
  hash?: string;
  vcJwt?: string;
  vpJwt?: string;
  type: string;
  uploadedBy?: Account | string;
  belongsTo?: Account | string;
  sharedWithAccountIds: string[];
  validUntilDate?: Date;
  permanentOrgFileArchiveNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  claimed?: boolean;
}

export default Document;
