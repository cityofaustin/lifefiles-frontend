import React, {Component, Fragment} from 'react';
import './DocumentSummary.scss';
import Document from '../../models/Document';
import DocumentService from '../../services/DocumentService';
import deleteSvg from '../../img/delete.svg';
import StringUtil from '../../util/StringUtil';

interface DocumentSummaryProps {
  document?: Document;
  documentIdx: number;
}

class DocumentSummary extends Component<DocumentSummaryProps> {

  constructor(props: Readonly<DocumentSummaryProps>) {
    super(props);
  }

  renderFirstShare(sharedWithList: string | any[]) {
    if (sharedWithList.length > 0) {
      const sharedWithItem = sharedWithList[0];
      return (
        <Fragment>
          <div className="shared-with-other">{StringUtil.getFirstUppercase(sharedWithItem)}</div>
          {/*<img className="shared-with-image"*/}
          {/*     src={sharedWithItem.profileimgUrl}*/}
          {/*     alt="sharedWithItemFirst"*/}
          {/*/>*/}
          {sharedWithList.length === 1 && <span className="padding-right-24"/>}
        </Fragment>

      );
    }
    return (
      <div className="shared-with-other">-</div>
    );
  }

  renderOtherShare(sharedWithList: string[]) {
    if (sharedWithList.length === 2) {
      const sharedWithItem = sharedWithList[1];
      return (
        <Fragment>
          <div className="shared-with-other">{StringUtil.getFirstUppercase(sharedWithItem)}</div>
          {/*<img className="shared-with-other"*/}
          {/*     src={sharedWithItem.profileimgUrl}*/}
          {/*     alt="sharedWithItemFirst"*/}
          {/*/>*/}
        </Fragment>

      );
    }
    if (sharedWithList.length > 2) {
      return (
        <div className="shared-with-other">+{sharedWithList.length - 1}</div>
      );
    }
    return (
      <Fragment/>
    );
  }

  render() {
    const {document, documentIdx} = {...this.props};
    return (
      <div>
        {document &&
        <Fragment>
          <img className="document-summary-image"
               src={DocumentService.getDocumentURL(document.url)}
               alt="doc missing"
          />
          <div className="title padding-top-12">{document.type}</div>
          <div className="subtitle">SHARED WITH</div>
          <div className="shared-with-container padding-top-12">
            {this.renderFirstShare(document.sharedWithAccountIds)}
            {this.renderOtherShare(document.sharedWithAccountIds)}
            <div className="separator"/>
            <div className="document-idx">{documentIdx + 1}</div>
          </div>
        </Fragment>
        }
      </div>
    );
  }
}

export default DocumentSummary;
