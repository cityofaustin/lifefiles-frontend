import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import AccountService from '../../../services/AccountService';
import AccountImpl from '../../../models/AccountImpl';
import { roleDisplayMap } from '../../../models/Role';
import Checkbox from '../../common/Checkbox';
import Select from 'react-select/base';
import { addMonths, format } from 'date-fns';
import Account from '../../../models/Account';
import ShareRequest from '../../../models/ShareRequest';
import './ShareDocWithContainer.scss';
import Carousel from 'react-multi-carousel';
import Document from '../../../models/document/Document';
import Badge from '../../common/Badge';
import { ShareRequestPermissions } from '../../../services/ShareRequestService';
import Toggle, { ToggleSizeEnum } from '../../common/Toggle';
import ShareRequestPermissionSvg from '../../svg/ShareRequestPermissionSvg';

interface ShareDocWithContainerProps {
  shareRequests: ShareRequest[];
  selectedContact?: Account;
  getDocumentSharedWithContact: (
    selectedContact: Account
  ) => ShareRequest | undefined;
  handleShareDocCheck: (srp: ShareRequestPermissions) => Promise<void>;
  // handleShareDocCheck: () => Promise<void>;
  accounts: Account[];
  handleSelectContact: (contact: Account) => void;
  document?: Document;
  dataURL?: string;
}

interface ShareDocWithContainerState {
  canView: boolean;
  canReplace: boolean;
  canDownload: boolean;
}

class ShareDocWithContainer extends Component<
  ShareDocWithContainerProps,
  ShareDocWithContainerState
> {
  state = {
    canView: false,
    canReplace: false,
    canDownload: false,
  };
  componentDidUpdate(prevProps: Readonly<ShareDocWithContainerProps>) {
    if (
      this.props.selectedContact &&
      this.props.selectedContact !== prevProps.selectedContact
    ) {
      const sr = this.props.getDocumentSharedWithContact(
        this.props.selectedContact!
      );
      this.setState({
        canView: !!(sr && sr.canView),
        canReplace: !!(sr && sr.canReplace),
        canDownload: !!(sr && sr.canDownload),
      });
    }
  }

  getShareStatus(shareRequest: ShareRequest | undefined) {
    if (shareRequest) {
      if (shareRequest.approved) {
        return 'shared';
      } else {
        return 'pending';
      }
    } else {
      return 'not shared';
    }
  }

  // containsBadge(account, shareRequests) {
  //   return true;
  // }

  renderPermissions(size: ToggleSizeEnum) {
    const { handleShareDocCheck, dataURL } = { ...this.props };
    return (
      <Fragment>
        {!dataURL && (
          <div style={{ marginLeft: '12px' }}>Loading Document...</div>
        )}
        {dataURL && (
          <div className="sr-permissions">
            <div className="sr-permission">
              <div className="sr-attr">
                <ShareRequestPermissionSvg
                  permission="view"
                  isOn={this.state.canView}
                />
                <div className={`sr-title ${this.state.canView && 'on'}`}>
                  View
                </div>
              </div>
              <Toggle
                size={size}
                value={this.state.canView}
                onToggle={() => {
                  let { canView, canDownload } = { ...this.state };
                  const { canReplace } = { ...this.state };
                  // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                  if (canView && canDownload) {
                    canView = !canDownload;
                    canDownload = !canDownload;
                  } else {
                    canView = !canView;
                  }
                  this.setState({ canView, canReplace, canDownload });
                  handleShareDocCheck({
                    canView,
                    canReplace,
                    canDownload,
                  });
                }}
              />
            </div>
            <div className="sr-permission">
              <div className="sr-attr">
                <ShareRequestPermissionSvg
                  permission="replace"
                  isOn={this.state.canReplace}
                />
                <div className={`sr-title ${this.state.canReplace && 'on'}`}>
                  Replace
                </div>
              </div>
              <Toggle
                size={size}
                value={this.state.canReplace}
                onToggle={() => {
                  let { canReplace } = { ...this.state };
                  const { canView, canDownload } = { ...this.state };
                  canReplace = !canReplace;
                  this.setState({ canView, canReplace, canDownload });
                  handleShareDocCheck({
                    canView,
                    canReplace,
                    canDownload,
                  });
                }}
              />
            </div>
            <div className="sr-permission">
              <div className="sr-attr">
                <ShareRequestPermissionSvg
                  permission="download"
                  isOn={this.state.canDownload}
                />
                <div className={`sr-title ${this.state.canDownload && 'on'}`}>
                  Download
                </div>
              </div>
              <Toggle
                size={size}
                value={this.state.canDownload}
                onToggle={() => {
                  let { canView, canDownload } = { ...this.state };
                  const { canReplace } = { ...this.state };
                  // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                  if (!canView && !canDownload) {
                    canView = !canDownload;
                    canDownload = !canDownload;
                  } else {
                    canDownload = !canDownload;
                  }
                  this.setState({ canView, canReplace, canDownload });
                  handleShareDocCheck({
                    canView,
                    canReplace,
                    canDownload,
                  });
                }}
              />
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  render() {
    const {
      selectedContact,
      getDocumentSharedWithContact,
      accounts,
      handleSelectContact,
      document,
    } = { ...this.props };
    const shareRequest = getDocumentSharedWithContact(selectedContact!);
    return (
      <div className="share-container">
        <div
          className={classNames({
            'contact-details': true,
            active: selectedContact,
          })}
        >
          {selectedContact && (
            <div>
              <div className="contact-top">
                <img
                  className="contact-detail-image"
                  src={AccountService.getProfileURL(
                    selectedContact.profileImageUrl!
                  )}
                  alt="Profile"
                />
                <div className="contact-detail-share-doc-sm">
                  <div className="prompt">Share {document!.type}?</div>
                  {this.renderPermissions(ToggleSizeEnum.XS)}
                </div>
              </div>
              <div className="contact-detail-info">
                <div className="info-item">
                  <div className="item-attr">Name</div>
                  <div className="item-value">
                    {AccountImpl.getFullName(
                      selectedContact?.firstName,
                      selectedContact?.lastName
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Organization</div>
                  <div className="item-value">
                    {selectedContact?.organization || '-'}
                  </div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Role</div>
                  <div className="item-value">
                    {roleDisplayMap[selectedContact.role]}
                  </div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Phone</div>
                  <div className="item-value">
                    {selectedContact?.phoneNumber || '-'}
                  </div>
                </div>
                <div className="info-item">
                  <div className="item-attr">E-mail</div>
                  <div className="item-value">{selectedContact.email}</div>
                </div>
              </div>
              <div className="contact-detail-share-doc">
                <div className="prompt">
                  {shareRequest === undefined && `Share ${document!.type}?`}
                  {shareRequest &&
                    shareRequest.approved &&
                    `Share ${document!.type}?`}
                  {shareRequest &&
                    !shareRequest.approved &&
                    `Share ${document!.type}?`}
                </div>
                {this.renderPermissions(ToggleSizeEnum.SM)}
              </div>
            </div>
          )}
        </div>
        <div className="right-panel">
          <div className="contact-list">
            <div className="title">contacts</div>
            <div className="subtitle">
              Select a contact to share this document with
            </div>
            <div className="contact-grid">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={classNames({
                    contact: true,
                    active:
                      selectedContact && selectedContact.id === account.id,
                  })}
                  onClick={() => handleSelectContact(account)}
                >
                  {this.getShareStatus(
                    getDocumentSharedWithContact(account)
                  ) === 'pending' && (
                    <div className="badge-container">
                      <Badge />
                    </div>
                  )}
                  <img
                    className="contact-image"
                    src={AccountService.getProfileURL(account.profileImageUrl!)}
                    alt="Profile"
                  />
                  <div className="contact-name">
                    {AccountImpl.getFullName(
                      account.firstName,
                      account.lastName
                    )}
                  </div>
                  <div className="share-status">
                    {this.getShareStatus(getDocumentSharedWithContact(account))}
                  </div>
                </div>
              ))}
            </div>
            <div className="contact-grid-sm">
              <Carousel
                responsive={{
                  mobile: {
                    breakpoint: { max: 768, min: 0 },
                    items: 2,
                  },
                }}
                infinite={false}
                // showDots={true}
              >
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={classNames({
                      contact: true,
                      active:
                        selectedContact && selectedContact.id === account.id,
                    })}
                    onClick={() => handleSelectContact(account)}
                  >
                    {this.getShareStatus(
                      getDocumentSharedWithContact(account)
                    ) === 'pending' && (
                      <div className="badge-container">
                        <Badge />
                      </div>
                    )}
                    <img
                      className="contact-image"
                      src={AccountService.getProfileURL(
                        account.profileImageUrl!
                      )}
                      alt="Profile"
                    />
                    <div className="contact-name">
                      {AccountImpl.getFullName(
                        account.firstName,
                        account.lastName
                      )}
                    </div>
                    <div className="share-status">
                      {this.getShareStatus(
                        getDocumentSharedWithContact(account)
                      )}
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
          <div className="share-time-limit">
            <div className="share-time-disabled-overlay" />
            <div className="title">time limit</div>
            <div className="subtitle">
              Specify how long this document will be shared
            </div>
            <div className="share-for-container">
              <div className="share-for-form-group">
                <label>Share for...</label>
                <div className="duration">
                  <Select />
                </div>
              </div>
              <div className="date-container">
                <div className="date-indicator">From</div>
                <div className="date-value">
                  {format(new Date(), 'MMMM d, y')}
                </div>
                {/* <div className="date-value">September 25, 2020</div> */}
              </div>
              <div className="date-container">
                <div className="date-indicator">To</div>
                <div className="date-value">
                  {format(addMonths(new Date(), 1), 'MMMM d, y')}
                </div>
                {/* <div className="date-value">September 25, 2020</div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ShareDocWithContainer;
