
interface ShareRequest {
  _id?: string;
  shareWithAccountId: string;
  documentType: string;
  approved: boolean;
  documentUrl: string;
  documentThumbnailUrl: string;
  documentId: string;
}

export default ShareRequest;
