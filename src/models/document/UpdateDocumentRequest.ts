import Account from '../Account';

interface UpdateDocumentRequest {
  id: string;
  img?: File;
  thumbnail?: File;
  validUntilDate?: Date;
  claimed?: boolean;
  base64Image?: string;
  shareRequestId?: string;
  referencedAccount?: Account;
}

export default UpdateDocumentRequest;
