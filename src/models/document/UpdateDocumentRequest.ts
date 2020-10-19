interface UpdateDocumentRequest {
  id: string;
  img?: File;
  thumbnail?: File;
  validUntilDate?: Date;
  claimed?: boolean;
  base64Image?: string;
}

export default UpdateDocumentRequest;
