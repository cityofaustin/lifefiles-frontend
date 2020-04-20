import React, {Component, Fragment} from 'react';
import './DocumentSummary.scss';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
import ImageWithStatus, {ImageViewTypes} from '../../common/ImageWithStatus';
import Account from '../../../models/Account';
import SharedWith from './SharedWith';

interface DocumentSummaryProps {
  document?: Document;
  documentIdx: number;
  sharedAccounts: Account[];
  privateEncryptionKey?: string;
}

class DocumentSummary extends Component<DocumentSummaryProps> {
  constructor(props: Readonly<DocumentSummaryProps>) {
    super(props);
  }

  render() {
    const {document, sharedAccounts, privateEncryptionKey} = {
      ...this.props
    };
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

            <div className="title">{document.type}</div>
            {sharedAccounts.length > 0 && (
              <div>
                <div className="subtitle">SHARED WITH</div>
                <SharedWith sharedAccounts={sharedAccounts}/>
              </div>
            )}
            {sharedAccounts.length <= 0 && <div className="no-shares"/>}
          </Fragment>
        )}
      </div>
    );
  }
}

export default DocumentSummary;
