import AgentService from './APIService';

class NotaryService extends AgentService {
  static generateNewDid() {
    return super.get('/generate-new-did');
  }

  static updateDocumentVC(accountForId: string, documentType: string, vcJwt: string, helperFile: File, ownerFile: File) {
    return super.postDocVC(`/account/${accountForId}/documents/${documentType}`,
      vcJwt,
      helperFile,
      ownerFile
    );
  }

  static updateDocumentVP(accountForId: string, documentType: string, vpJwt: string) {
    return super.put(`/account/${accountForId}/documents/${documentType}/vp`, {
      vpJwt
    });
  }

  static anchorVpToBlockchain(vpJwt: string) {
    return super.post('/anchor-vp-to-blockchain', {vpJwt});
  }
}

export default NotaryService;
