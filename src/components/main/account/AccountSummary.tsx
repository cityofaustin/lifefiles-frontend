import React, {Component} from 'react';
import Account from '../../../models/Account';
import './AccountSummary.scss';
import AccountImpl from '../../../models/AccountImpl';
import {roleDisplayMap} from '../../../models/Role';
import AccountService from '../../../services/AccountService';
import ImageWithStatus, {ImageViewTypes} from '../../common/ImageWithStatus';
import DocShared from '../document/DocShared';
import ShareRequest from '../../../models/ShareRequest';
import AccountShareModal from './AccountShareModal';
import Document from '../../../models/document/Document';

interface AccountSummaryProps {
  account: Account;
  shareRequests: ShareRequest[];
  searchedDocuments: Document[];
  myAccount: Account;
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
}

interface AccountSummaryState {
  showAccountShareModal: boolean;
}

class AccountSummary extends Component<AccountSummaryProps, AccountSummaryState> {
  constructor(props: Readonly<AccountSummaryProps>) {
    super(props);

    this.state = {
      showAccountShareModal: false
    };
  }

  render() {
    const {account, shareRequests, searchedDocuments, myAccount, addShareRequest,
      removeShareRequest} = {...this.props};
    const {showAccountShareModal} = {...this.state};
    const numberOfShares = (shareRequests) ? shareRequests.length : 0;
    return (
      <div className="network-item" onClick={() => this.setState({showAccountShareModal: true})}>
        <AccountShareModal
          showModal={showAccountShareModal}
          toggleModal={() => this.setState({showAccountShareModal: !showAccountShareModal})}
          account={account}
          searchedDocuments={searchedDocuments}
          myAccount={myAccount}
          shareRequests={shareRequests}
          addShareRequest={addShareRequest}
          removeShareRequest={removeShareRequest}
        />
        <div className="img-container">
          <ImageWithStatus
            imageViewType={ImageViewTypes.GRID_CIRCLE_LAYOUT}
            imageUrl={AccountService.getProfileURL(account.profileImageUrl!)}
          />
        </div>
        <div className="title">{AccountImpl.getFullName(account?.firstName, account?.lastName)}</div>
        <div className="contact-info">
          <div className="info-item">
            <div className="item-attr">Organization</div>
            <div className="item-value">{account?.organization || '-'}</div>
          </div>
          <div className="info-item">
            <div className="item-attr">Role</div>
            <div className="item-value">{roleDisplayMap[account.role]}</div>
          </div>
          <div className="info-item">
            <div className="item-attr">Phone</div>
            <div className="item-value">{account?.phoneNumber || '-'}</div>
          </div>
          {/*TODO do screen overflow here*/}
          <div className="info-item">
            <div className="item-attr">E-mail</div>
            <div className="item-value">{account.email}</div>
          </div>
        </div>
        <div className="subtitle">SHARED</div>
        <div className="docs-shared"><DocShared numberOfShares={numberOfShares} /></div>
      </div>
    );
  }
}

export default AccountSummary;
