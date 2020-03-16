
interface ShareRequest {
  shareWithAccountId: string;
  documentType: string;
  approved: boolean;
  documentUrl: string;
  documentId: string;
}

export default ShareRequest;
