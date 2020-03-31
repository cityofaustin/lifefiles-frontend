import React, {Component, Fragment} from 'react';
import './DocumentSummary.scss';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
import StringUtil from '../../../util/StringUtil';
import ImageWithStatus from '../../common/ImageWithStatus';
import Account from '../../../models/Account';
import classNames from 'classnames';
import AccountService from '../../../services/AccountService';

interface DocumentSummaryProps {
  document?: Document;
  documentIdx: number;
  sharedAccounts: Account[];
}

class DocumentSummary extends Component<DocumentSummaryProps> {

  constructor(props: Readonly<DocumentSummaryProps>) {
    super(props);
  }

  renderFirstShare(sharedAccounts: Account[]) {
    const sharedAccount = sharedAccounts[0];
    return (
      <Fragment>
        { !sharedAccount.profileImageUrl && (
        <div className={classNames({'shared-with-other': true, 'shared-with-small': sharedAccounts.length > 1})}>
          {sharedAccount.firstName && StringUtil.getFirstUppercase(sharedAccount.firstName)}
          {sharedAccount.lastName && StringUtil.getFirstUppercase(sharedAccount.lastName)}
        </div>
        ) }
        { sharedAccount.profileImageUrl && (
          <img className={classNames({'shared-with-other': true, 'shared-with-small': sharedAccounts.length > 1})}
               src={AccountService.getProfileURL(sharedAccount.profileImageUrl)}
               alt="sharedWithItemFirst"
          />
        )}
        {sharedAccounts.length === 1 && <span className="padding-right-24"/>}
      </Fragment>
    );
  }

  renderOtherShare(sharedAccounts: Account[]) {
    if (sharedAccounts.length === 2) {
      const sharedAccount = sharedAccounts[1];
      return (
        <Fragment>
          { !sharedAccount.profileImageUrl && (
            <div className="shared-with-other">
              {sharedAccount.firstName && StringUtil.getFirstUppercase(sharedAccount.firstName)}
              {sharedAccount.lastName && StringUtil.getFirstUppercase(sharedAccount.lastName)}
            </div>
          ) }
          { sharedAccount.profileImageUrl && (
            <img className="shared-with-other"
                 src={AccountService.getProfileURL(sharedAccount.profileImageUrl)}
                 alt="sharedWithItemFirst"
            />
          )}
        </Fragment>

      );
    }
    if (sharedAccounts.length > 2) {
      return (
        <div className="shared-with-other">+{sharedAccounts.length - 1}</div>
      );
    }
    return (
      <Fragment/>
    );
  }

  render() {
    const {document, sharedAccounts} = {...this.props};
    return (
      <div className="document-item">
        {document &&
        <Fragment>
          <ImageWithStatus
               imageUrl={DocumentService.getDocumentURL(document.url)}
          />
          <div className="title padding-top-12">{document.type}</div>
          { sharedAccounts.length > 0 && (
            <Fragment>
              <div className="subtitle">SHARED WITH</div>
              <div className={classNames({'shared-with-container': true, 'padding-top-12': true, 'shared-multi': sharedAccounts.length > 1})}>
                {this.renderFirstShare(sharedAccounts)}
                {this.renderOtherShare(sharedAccounts)}
                {/*<div className="separator"/>*/}
                {/*<div className="document-idx">{documentIdx + 1}</div>*/}
              </div>
            </Fragment>
          )}

        </Fragment>
        }
      </div>
    );
  }
}

export default DocumentSummary;
