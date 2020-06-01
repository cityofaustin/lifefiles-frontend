import md5 from 'md5';
import jsPDF from 'jspdf';
import EthrDID from 'ethr-did';
import NotaryService from '../services/NotaryService';
import NodeRSA from 'node-rsa';
import DidJWTVC from 'did-jwt-vc';
import PDFUtil from './PdfUtil';
import ImageUtil, { ImageType, ImageDetail } from './ImageUtil';

const createVerifiableCredential = DidJWTVC.createVerifiableCredential;
const createPresentation = DidJWTVC.createPresentation;

class NotaryUtil {
  // To be called by the notary
  static async createNotarizedDocument(
    notaryType: string,
    expirationDate: Date,
    notaryId: number,
    notaryEthAddress: string,
    notaryEthPrivateKey: string,
    notaryPublicKey: string,
    notaryPrivateKey: string,
    ownerEthAddress: string,
    imageBase64: string,
    notaryDigitalSealBase64: string,
    documentType: string,
    ownerFullname: string,
    caseworkerFullname: string
  ) {
    const didRes = await NotaryService.generateNewDid();
    const didAddress = didRes.didAddress;
    const documentDID = 'did:ethr:' + didAddress;

    const now = Date.now() as any;
    const issueTime = Math.floor(now / 1000);
    const issuanceDate = now;
    // const expirationDate = new Date(expirationDateString) as any;

    const originalImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      imageBase64
    );
    const notarySealImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      notaryDigitalSealBase64
    );
    const { pdfArrayBuffer, doc } = await PDFUtil.stitchTogetherPdf(
      originalImageDetail,
      'Texas',
      'Travis',
      issuanceDate,
      documentType,
      ownerFullname,
      notarySealImageDetail,
      caseworkerFullname,
      documentDID
    );

    const documentHash = md5(this.arrayBuffertoBuffer(pdfArrayBuffer));
    const encryptedHash = this.encryptX509(notaryPrivateKey, documentHash);

    const vc = await this.createVC(
      notaryEthAddress,
      notaryEthPrivateKey,
      ownerEthAddress,
      documentDID,
      notaryType,
      issuanceDate,
      issueTime,
      expirationDate,
      notaryId,
      notaryPublicKey,
      encryptedHash
    );

    return { vc, doc };
  }

  static async createVC(
    issuerAddress,
    issuerPrivateKey,
    ownerAddress,
    documentDID,
    notaryType,
    issuanceDate,
    issueTime,
    expirationDate,
    notaryId,
    notaryPublicKey,
    encryptedHash
  ) {
    const issuerEthrDid = new EthrDID({
      address: issuerAddress,
      privateKey: issuerPrivateKey,
    });

    const ownerDID = 'did:ethr:' + ownerAddress;
    const issuerDID = 'did:ethr:' + issuerAddress;

    const vcPayload = {
      sub: ownerDID,
      nbf: issueTime,
      vc: {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1',
        ],
        id: documentDID,
        type: ['VerifiableCredential', 'TexasNotaryCredential'],

        issuer: {
          id: issuerDID,
          ensDomain: 'mypass.eth',
          notaryId,
          notaryPublicKey,
        },

        issuanceDate,
        expirationDate,

        credentialSubject: {
          id: ownerDID,
          ensDomain: 'mypass.eth',
          TexasDigitalNotary: {
            type: notaryType,
            signedDocumentHash: encryptedHash, //  The hash is encrypted with the notary priv key.
            hashType: 'MD5',
          },
        },
      },
    };

    const vcJwt = await createVerifiableCredential(vcPayload, issuerEthrDid);
    return vcJwt;
  }

  static encryptX509(privateKey: string, data: string) {
    const key = new NodeRSA(privateKey);
    const encrypted = key.encryptPrivate(data, 'base64');
    return encrypted;
  }

  static getPublicKeyFromPrivateKey(privateKey: string) {
    const key = new NodeRSA();
    key.importKey(privateKey, 'pkcs1');
    const publicPem = key.exportKey('pkcs1-public-pem');
    return publicPem;
  }

  static arrayBuffertoBuffer(ab: ArrayBuffer): Buffer {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }

  static async createVP(address: string, privateKey: string, vcJwt: string) {
    const did = new EthrDID({
      address,
      privateKey,
    });

    const vpPayload = {
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: [vcJwt],
      },
    };

    const vpJwt = await createPresentation(vpPayload, did);
    return vpJwt;
  }

  // To be called by the owner
  static anchorVpToBlockchain(vpJwt: string) {
    NotaryService.anchorVpToBlockchain(vpJwt);
  }
}

export default NotaryUtil;
