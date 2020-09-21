
interface ShareRequest {
  _id?: string;
  shareWithAccountId: string;
  documentType: string;
  approved: boolean;
  canView: boolean;
  canReplace: boolean;
  canDownload: boolean;
  documentUrl: string;
  documentThumbnailUrl: string;
  documentId: string;
}

export default ShareRequest;
