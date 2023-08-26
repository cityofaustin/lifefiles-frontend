import React, { Component, Fragment } from "react";
import Account from "../../../models/Account";
import "./AccountSummary.scss";
import AccountImpl from "../../../models/AccountImpl";
import { roleDisplayMap } from "../../../models/Role";
import AccountService from "../../../services/AccountService";
import ImageWithStatus, { ImageViewTypes } from "../../common/ImageWithStatus";
import DocShared from "../document/DocShared";
import ShareRequest from "../../../models/ShareRequest";
import AccountShareModal from "./AccountShareModal";
import Document from "../../../models/document/Document";
import { Navigate } from "react-router-dom";
import ProfileImage, { ProfileImageSizeEnum } from "../../common/ProfileImage";
import HelperContact from "../../../models/HelperContact";

interface AccountSummaryProps {
  account: Account;
  shareRequests: ShareRequest[];
  searchedDocuments: Document[];
  myAccount: Account;
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  privateEncryptionKey: string;
  isNotary?: boolean;
  handleClientSelected: (clientSelected: Account) => void;
  removeHelperContact: (account: Account) => void;
  unshareAllWithHelperContact: (account: Account) => void;
  helperContact?: HelperContact;
  updateHelperContactPermissions?: (hc: HelperContact) => void;
}

interface AccountSummaryState {
  showAccountShareModal: boolean;
  goToClientDocuments: boolean;
}

class AccountSummary extends Component<
  AccountSummaryProps,
  AccountSummaryState
> {
  static defaultProps = {
    handleClientSelected: () => {},
  };

  constructor(props: Readonly<AccountSummaryProps>) {
    super(props);

    this.state = {
      showAccountShareModal: false,
      // showAccountShareModal: true,
      goToClientDocuments: false,
    };
  }

  handleAccountSummaryClick = () => {
    const { isNotary, handleClientSelected, account } = { ...this.props };
    if (isNotary) {
      handleClientSelected(account);
      this.setState({ goToClientDocuments: true });
    } else {
      this.setState({ showAccountShareModal: true });
    }
  };

  render() {
    const {
      account,
      shareRequests,
      searchedDocuments,
      myAccount,
      addShareRequest,
      removeShareRequest,
      privateEncryptionKey,
      isNotary,
      removeHelperContact,
      unshareAllWithHelperContact,
      helperContact,
      updateHelperContactPermissions,
    } = { ...this.props };
    const { showAccountShareModal, goToClientDocuments } = { ...this.state };
    const numberOfShares = shareRequests
      ? shareRequests.filter((sr) => sr.approved).length
      : 0;
    return (
      <div className="network-item" onClick={this.handleAccountSummaryClick}>
        {goToClientDocuments && (
          <Navigate replace to={`${account.id}/documents`} />
        )}
        {/* Helper does not see this and helper contact is not defined */}
        {helperContact && (
          <AccountShareModal
            updateHelperContactPermissions={updateHelperContactPermissions!}
            helperContact={helperContact!}
            unshareAllWithHelperContact={unshareAllWithHelperContact}
            removeHelperContact={removeHelperContact}
            showModal={showAccountShareModal}
            toggleModal={() =>
              this.setState({ showAccountShareModal: !showAccountShareModal })
            }
            account={account}
            documents={searchedDocuments}
            myAccount={myAccount}
            shareRequests={shareRequests}
            addShareRequest={addShareRequest}
            removeShareRequest={removeShareRequest}
            privateEncryptionKey={privateEncryptionKey}
          />
        )}
        <div className="img-container">
          {account.profileImageUrl && (
            <ImageWithStatus
              imageViewType={ImageViewTypes.GRID_CIRCLE_LAYOUT}
              imageUrl={AccountService.getProfileURL(account.profileImageUrl!)}
            />
          )}
          {!account.profileImageUrl && (
            <ProfileImage account={account} size={ProfileImageSizeEnum.LARGE} />
          )}
          <div className="docs-shared-sm">
            <DocShared isNotary={isNotary} numberOfShares={numberOfShares} />
          </div>
        </div>
        <div className="title">
          {!AccountImpl.hasNameSet(account) && account.username}
          {AccountImpl.hasNameSet(account) &&
            AccountImpl.getFullName(account?.firstName, account?.lastName)}
        </div>
        <div className="contact-info">
          {!isNotary && (
            <Fragment>
              <div className="info-item">
                <div className="item-attr">Organization</div>
                <div className="item-value">{account?.organization || "-"}</div>
              </div>
              <div className="info-item">
                <div className="item-attr">Role</div>
                <div className="item-value">{roleDisplayMap[account.role]}</div>
              </div>
            </Fragment>
          )}
          <div className="info-item">
            <div className="item-attr">Phone</div>
            <div className="item-value">{account?.phoneNumber || "-"}</div>
          </div>
          <div className="info-item">
            <div className="item-attr">E-mail</div>
            <div className="item-value email">{account.email}</div>
          </div>
        </div>
        <div className="subtitle">SHARED</div>
        <div className="docs-shared">
          <DocShared isNotary={isNotary} numberOfShares={numberOfShares} />
        </div>
      </div>
    );
  }
}

export default AccountSummary;
