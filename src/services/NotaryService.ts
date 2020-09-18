import AgentService from './APIService';

class NotaryService extends AgentService {
  static generateNewDid() {
    return super.get('/generate-new-did');
  }

  static getAdminPublicKey() {
    return super.get('/admin-crypto-public-key');
  }

  static async getCoinPrice(coin) {
    let responseJson;
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=USD'
      );

      responseJson = await response.json();
    } catch (error) {
      console.error('Error getting coin prices');
      return 0;
    }
    return responseJson[coin].usd;
  }

  static async getEthGasPrice() {
    let responseJson;
    try {
      const response = await fetch(
        'https://ethgasstation.info/api/ethgasAPI.json'
      );

      responseJson = await response.json();
    } catch (error) {
      console.error('Error getting coin prices');
      return 0;
    }

    return responseJson.safeLow;
  }

  static updateDocumentVC(
    accountForId: string,
    documentType: string,
    vcJwt: string,
    helperFile: File,
    ownerFile: File,
    network: string
  ) {
    return super.postDocVC(
      `/account/${accountForId}/documents/${documentType}`,
      vcJwt,
      helperFile,
      ownerFile,
      network
    );
  }

  static updateDocumentVP(
    accountForId: string,
    documentType: string,
    vpJwt: string
  ) {
    return super.put(`/account/${accountForId}/documents/${documentType}/vp`, {
      vpJwt,
    });
  }

  static anchorVpToBlockchain(vpJwt: string, network: string) {
    let json = { vpJwt: vpJwt, network: network };
    return super.post('/anchor-vp-to-blockchain', json);
  }
}

export default NotaryService;
