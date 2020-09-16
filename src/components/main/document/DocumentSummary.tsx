import React, { Component, Fragment } from 'react';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import Account from '../../../models/Account';
import SharedWith from './SharedWith';
import ShareRequest from '../../../models/ShareRequest';
import Badge from '../../common/Badge';
import './DocumentSummary.scss';

interface DocumentSummaryProps {
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
              <ImageWithStatus
                imageViewType={ImageViewTypes.GRID_LAYOUT}
                imageUrl={DocumentService.getDocumentURL(document.thumbnailUrl)}
                encrypted
                privateEncryptionKey={privateEncryptionKey}
              />
            </div>
            {this.containsBadge() && (
              <div className="badge-container">
                <Badge />
              </div>
            )}
            <div className="title">{document.type}</div>
            {/* TODO: claimed needs to show up here for notaries. */}
            {document.thumbnailUrl.length > 0 &&
              // && document.claimed === true
              document.sharedWithAccountIds.length > 0 && (
                <div>
                  <div className="subtitle">SHARED</div>
                </div>
              )}
            {/* {document.claimed !== undefined && document.claimed === false && (
            <div>
              <div className="subtitle">NOT CLAIMED</div>
            </div>
            )} */}
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
