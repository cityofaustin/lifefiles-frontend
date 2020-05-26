import AgentService from "./APIService";

class NotaryService extends AgentService {
  static generateNewDid() {
    return super.get("/generate-new-did");
  }

  static updateDocumentVC(accountForId, documentType, vc) {
    console.log("route");
    console.log(`/account/${accountForId}/documents/${documentType}`);
    return super.post(`/account/${accountForId}/documents/${documentType}`, {
      vc: vc,
    });
  }

  static anchorVpToBlockchain(req) {
    return super.post("/anchor-vp-to-blockchain", req);
  }
}

export default NotaryService;
