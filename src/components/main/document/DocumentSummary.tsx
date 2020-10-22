import React, { Component, Fragment } from 'react';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import Account from '../../../models/Account';
import SharedWith from './SharedWith';
import ShareRequest, {
  ShareRequestPermission,
} from '../../../models/ShareRequest';
import Badge from '../../common/Badge';
import './DocumentSummary.scss';
import { ReactComponent as StampSvg } from '../../../img/stamp.svg';
import Role from '../../../models/Role';
import { ReactComponent as NotSharedDoc } from '../../../img/not-shared-doc.svg';

interface DocumentSummaryProps {
  myAccount: Account;
  document?: Document;
  documentIdx: number;
  sharedAccounts: Account[];
  privateEncryptionKey?: string;
  shareRequests: ShareRequest[];
  handleSelectDocument: (document: Document, goToClaim?: boolean) => void;
}

class DocumentSummary extends Component<DocumentSummaryProps> {
  constructor(props: Readonly<DocumentSummaryProps>) {
    super(props);
  }

  containsBadge() {
    const { shareRequests, sharedAccounts, document } = { ...this.props };
    let result = false;
    const pendingShareRequest = shareRequests.find(
      (shareRequest) => shareRequest.approved === false
    );
    const pendingClaim =
      document &&
      document.claimed !== undefined &&
      document.claimed === false &&
      sharedAccounts.length > 0;
    if (pendingShareRequest || pendingClaim) {
      result = true;
    }
    return result;
  }

  isAllowedShareRequestPermission = (srp: ShareRequestPermission) => {
    const {
      myAccount,
      // viewFeature, // NOTE: should handle admin view feature too.
      shareRequests,
      document,
    } = { ...this.props };
    let isAllowed = true;
    if (myAccount.role === Role.helper) {
      try {
        const shareRequest = shareRequests.find(
          (sr) => sr.documentType === document?.type
        );
        isAllowed = shareRequest ? shareRequest[srp] : true;
      } catch (err) {
        console.error('Unabled to get share request');
      }
    }
    return isAllowed;
  };

  render() {
    const {
      document,
      sharedAccounts,
      privateEncryptionKey,
      handleSelectDocument,
    } = { ...this.props };

    // console.log(sharedAccounts);
    return (
      <div className="document-item">
        {document && (
          <Fragment>
            <div>
              {document.vcJwt && document.vpDocumentDidAddress && (
                <div className="notarized">
                  <StampSvg />
                  <div className="notary-label">NOTARIZED</div>
                </div>
              )}
              {this.isAllowedShareRequestPermission(
                ShareRequestPermission.CAN_VIEW
              ) && (
                <ImageWithStatus
                  imageViewType={ImageViewTypes.GRID_LAYOUT}
                  imageUrl={DocumentService.getDocumentURL(
                    document.thumbnailUrl
                  )}
                  encrypted
                  privateEncryptionKey={privateEncryptionKey}
                />
              )}
              {!this.isAllowedShareRequestPermission(
                ShareRequestPermission.CAN_VIEW
              ) && (
                <div style={{width: '160px', height: '203px', marginBottom: '40px'}}>
                  <NotSharedDoc />
                </div>
              )}
            </div>
            {this.containsBadge() && (
              <div className="badge-container">
                <Badge />
              </div>
            )}
            <div className="title">{document.type}</div>
            {document.thumbnailUrl.length > 0 &&
              document.sharedWithAccountIds.length > 0 && (
                <div>
                  <div className="subtitle">SHARED</div>
                </div>
              )}
            {document.claimed && sharedAccounts.length > 0 && (
              <div>
                <div className="subtitle">SHARED WITH</div>
                <SharedWith sharedAccounts={sharedAccounts} />
              </div>
            )}
            {document.claimed !== undefined &&
              document.claimed === false &&
              sharedAccounts.length > 0 && (
                <Fragment>
                  <div className="subtitle">NOT CLAIMED</div>
                  <div className="claim-action">
                    <button
                      className="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDocument(document, true);
                      }}
                    >
                      Claim
                    </button>
                  </div>
                </Fragment>
              )}
            {sharedAccounts.length <= 0 && <div className="no-shares" />}
          </Fragment>
        )}
      </div>
    );
  }
}

export default DocumentSummary;
