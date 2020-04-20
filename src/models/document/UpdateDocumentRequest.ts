
interface UpdateDocumentRequest {
  id: string;
  img?: File;
  thumbnail?: File;
  validUntilDate?: Date;
}

export default UpdateDocumentRequest;
