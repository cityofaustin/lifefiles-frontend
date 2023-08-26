import md5 from 'md5';
// import jsPDF from 'jspdf';
import { EthrDID } from 'ethr-did';
import NotaryService from '../services/NotaryService';
import NodeRSA from 'node-rsa';
import * as DidJWTVC from 'did-jwt-vc';
import PDFUtil from './PdfUtil';
import ImageUtil, { ImageDetail } from './ImageUtil';

const createVerifiableCredential = DidJWTVC.createVerifiableCredentialJwt;
const createPresentation = DidJWTVC.createVerifiablePresentationJwt;

class NotaryUtil {
  // To be called by the notary
  static async createNotarizedDocument(
    notaryType: string,
    expirationDate: Date | null,
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
    caseworkerFullname: string,
    county: string,
    isRecordable: boolean
  ) {
    try {
      const didRes = await NotaryService.generateNewDid();
      const didAddress = didRes.didAddress;
      const documentDID = 'did:ethr:' + didAddress;

      const vpDidRes = await NotaryService.generateNewDid();
      const vpDidAddress = vpDidRes.didAddress;
      const vpDocumentDid = 'did:ethr:' + vpDidAddress;

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
      const { pdfArrayBuffer, doc } = isRecordable
        ? await PDFUtil.stitchTogetherRecordablePdf(
            originalImageDetail,
            'Texas',
            county,
            issuanceDate,
            documentType,
            ownerFullname,
            notarySealImageDetail,
            caseworkerFullname,
            documentDID
          )
        : await PDFUtil.stitchTogetherPdf(
            originalImageDetail,
            'Texas',
            county,
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
        vpDocumentDid,
        notaryType,
        issuanceDate,
        issueTime,
        expirationDate,
        notaryId,
        notaryPublicKey,
        encryptedHash
      );
      return { vc, doc };
    } catch (err) {
      console.error('Failure in create notarized document');
      console.error(err);
    }
  }

  static async createVC(
    issuerAddress,
    issuerPrivateKey,
    ownerAddress,
    documentDID,
    vpDocumentDid,
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
    } as any);

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

        verifiablePresentationReference: {
          id: vpDocumentDid,
        },

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

    const vcJwt = await createVerifiableCredential(vcPayload, issuerEthrDid as any);
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

  static async createVP(
    address: string,
    privateKey: string,
    vcJwt: string,
    vpDocumentDidAddress: string
  ) {
    const did = new EthrDID({
      address,
      privateKey,
    } as any);

    const vpPayload = {
      vp: {
        id: 'did:ethr:' + vpDocumentDidAddress,
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: [vcJwt],
      },
    };

    const vpJwt = await createPresentation(vpPayload, did as any);
    return vpJwt;
  }

  // To be called by the owner
  static anchorVpToBlockchain(vpJwt: string, network: string) {
    NotaryService.anchorVpToBlockchain(vpJwt, network);
  }
}

export default NotaryUtil;
