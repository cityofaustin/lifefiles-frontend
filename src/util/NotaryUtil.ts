import md5 from "md5";
import jsPDF from "jspdf";
import EthrDID from "ethr-did";
import NotaryService from "../services/NotaryService";
import NodeRSA from "node-rsa";
const createVerifiableCredential = require("did-jwt-vc")
  .createVerifiableCredential;
const createPresentation = require("did-jwt-vc").createPresentation;

class NotaryUtil {
  // To be called by the notary
  static async createNotarizedDocument(
    notaryType,
    expirationDateString,
    notaryId,
    notaryEthAddress,
    notaryEthPrivateKey,
    notaryPublicKey,
    notaryPrivateKey,
    ownerEthAddress,
    scannedImage,
    notaryDigitalSeal
  ) {
    const didRes = await NotaryService.generateNewDid();
    const didAddress = didRes.didAddress;
    const documentDID = "did:ethr:" + didAddress;

    const now = Date.now() as any;
    const issueTime = Math.floor(now / 1000);
    const issuanceDate = now;
    const expirationDate = new Date(expirationDateString) as any;

    const { pdfArrayBuffer, doc } = await this.stitchTogetherPdf(
      scannedImage,
      notaryDigitalSeal,
      documentDID
    );

    const documentHash = md5(this.toBuffer(pdfArrayBuffer));
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

    return { vc: vc, doc: doc };
  }

  static async stitchTogetherPdf(scannedImage, notaryDigitalSeal, documentDID) {
    let doc = new jsPDF();

    doc.addImage(scannedImage, "PNG", 10, 10, 50, 50);
    doc.addImage(notaryDigitalSeal, "PNG", 10, 70, 50, 50);
    doc.text(documentDID, 10, 140);

    const pdfArrayBuffer = doc.output("arraybuffer");
    return { pdfArrayBuffer, doc };
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

    const ownerDID = "did:ethr:" + ownerAddress;
    const issuerDID = "did:ethr:" + issuerAddress;

    const vcPayload = {
      sub: ownerDID,
      nbf: issueTime,
      vc: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1",
        ],
        id: documentDID,
        type: ["VerifiableCredential", "TexasNotaryCredential"],

        issuer: {
          id: issuerDID,
          ensDomain: "mypass.eth",
          notaryId: notaryId,
          notaryPublicKey: notaryPublicKey,
        },

        issuanceDate: issuanceDate,
        expirationDate: expirationDate,

        credentialSubject: {
          id: ownerDID,
          ensDomain: "mypass.eth",
          TexasDigitalNotary: {
            type: notaryType,
            signedDocumentHash: encryptedHash, //  The hash is encrypted with the notary priv key.
            hashType: "MD5",
          },
        },
      },
    };

    const vcJwt = await createVerifiableCredential(vcPayload, issuerEthrDid);
    return vcJwt;
  }

  static async createVP(address, privateKey, vcJwt) {
    const did = new EthrDID({
      address: address,
      privateKey: privateKey,
    });

    const vpPayload = {
      vp: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiablePresentation"],
        verifiableCredential: [vcJwt],
      },
    };

    const vpJwt = await createPresentation(vpPayload, did);
    return vpJwt;
  }

  // To be called by the owner
  static anchorVpToBlockchain(vpJwt) {
    let req = {
      vpJwt: vpJwt,
    };

    NotaryService.anchorVpToBlockchain(req);
  }

  static encryptX509(privateKey, data) {
    const key = new NodeRSA(privateKey);
    const encrypted = key.encrypt(data, "base64");
    return encrypted;
  }

  static getPublicKeyFromPrivateKey(privateKey) {
    const key = new NodeRSA();
    key.importKey(privateKey, "pkcs1");
    const publicPem = key.exportKey("pkcs1-public-pem");
    return publicPem;
  }

  static toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }
}

export default NotaryUtil;
