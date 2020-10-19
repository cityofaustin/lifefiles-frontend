import React, { Component } from 'react';
import PdfUtil from '../util/PdfUtil';
import PdfPreview from './common/PdfPreview';
import mapCardImg from '../img/map-card.png';
import notarySealImg from '../img/notary-seal.png';
import ImageUtil, { ImageDetail } from '../util/ImageUtil';
import SSCImg from '../img/social-security-card.png';
import { Button } from 'reactstrap';

export default class NotaryPdfTestPage extends Component {
  state = {
    nonRecordableDoc: null,
    recordableDoc: null,
  };

  componentDidMount() {
    this.loadNonRecordableDoc();
    this.loadRecordableDoc();
  }

  loadNonRecordableDoc = async () => {
    const originalBlob = await (await fetch(mapCardImg)).blob();
    const originalBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev?.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(originalBlob);
    });
    const originalImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      originalBase64 as any
    );
    const notarySealBlob = await (await fetch(notarySealImg)).blob();
    const notarySealBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev?.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(notarySealBlob);
    });
    const notarySealImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      notarySealBase64 as any
    );
    const issuanceDate = new Date();
    const documentType = 'MAP Card';
    const ownerFullname = 'Sally Owner';
    const caseworkerFullname = 'Billy Caseworker';
    const documentDID = 'did:ethr:0x68d608b4D1b32575c63150defB305f91C027C7E9';
    const { doc } = await PdfUtil.stitchTogetherPdf(
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
    this.setState({ nonRecordableDoc: doc });
  };

  loadRecordableDoc = async () => {
    const originalBlob = await (await fetch(SSCImg)).blob();
    const originalBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev?.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(originalBlob);
    });
    const originalImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      originalBase64 as any
    );
    const notarySealBlob = await (await fetch(notarySealImg)).blob();
    const notarySealBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev?.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(notarySealBlob);
    });
    const notarySealImageDetail: ImageDetail = await ImageUtil.processImageBase64(
      notarySealBase64 as any
    );
    const issuanceDate = new Date();
    // issuanceDate.setDate(issuanceDate.getDate()-5);
    const documentType = 'MAP Card';
    const ownerFullname = 'Sally Owner';
    const caseworkerFullname = 'Billy Caseworker';
    const documentDID = 'did:ethr:0x68d608b4D1b32575c63150defB305f91C027C7E9';
    const { doc } = await PdfUtil.stitchTogetherRecordablePdf(
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
    this.setState({ recordableDoc: doc });
  };

  render() {
    const { nonRecordableDoc, recordableDoc } = { ...this.state };
    return (
      <section className="notarized-section">
        <h1>recordable</h1>
        <div className="pdf-display">
          {recordableDoc && (
            <div style={{ border: '1px solid black' }}>
              <PdfPreview
                fileURL={(recordableDoc as any).output('datauristring')}
              />
            <Button
              className="margin-wide"
              color="primary"
              onClick={() => (recordableDoc as any).save('generated.pdf')}
            >
              Save Pdf
            </Button>
            </div>
          )}
        </div>
        <h1>non-recordable</h1>
        <div className="pdf-display">
          {nonRecordableDoc && (
            <div style={{ border: '1px solid black' }}>
              <PdfPreview
                fileURL={(nonRecordableDoc as any).output('datauristring')}
              />
            </div>
          )}
        </div>
      </section>
    );
  }
}
