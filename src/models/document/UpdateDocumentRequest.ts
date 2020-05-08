
interface UpdateDocumentRequest {
  id: string;
  img?: File;
  thumbnail?: File;
  validUntilDate?: Date;
  claimed?: boolean;
}

export default UpdateDocumentRequest;
