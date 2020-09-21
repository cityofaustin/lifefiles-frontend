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
import Toggle from '../../common/Toggle';
import ShareRequestPermissionSvg from '../../svg/ShareRequestPermissionSvg';

interface ShareDocWithContainerProps {
  shareRequests: ShareRequest[];
  selectedContact?: Account;
  getDocumentSharedWithContact: (
    selectedContact: Account
  ) => ShareRequest | undefined;
  handleShareDocCheck: (srp: ShareRequestPermissions) => Promise<void>;
  accounts: Account[];
  handleSelectContact: (contact: Account) => void;
  document?: Document;
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

  render() {
    const {
      selectedContact,
      getDocumentSharedWithContact,
      handleShareDocCheck,
      accounts,
      handleSelectContact,
      document,
      shareRequests,
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
                  {/* TODO: make these 3 toggles */}
                  <div>
                    <Toggle />
                  </div>
                  {/* <Checkbox
                    isLarge
                    isChecked={shareRequest && shareRequest.approved}
                    onClick={handleShareDocCheck}
                  /> */}
                  {/* <div className="share-status">
                    This file is{' '}
                    {shareRequest && shareRequest.approved ? '' : 'NOT '}
                    currently shared with
                    {' ' + selectedContact.username}
                  </div> */}
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
                  {
                    shareRequest &&
                      !shareRequest.approved &&
                      `Share ${document!.type}?`
                    // `${selectedContact.firstName} has Requested Access to your Document`
                  }
                </div>
                <div className="sr-permissions">
                  <div className="sr-permission">
                    <ShareRequestPermissionSvg
                      permission="view"
                      isOn={this.state.canView}
                    />
                    <div className={`sr-title ${this.state.canView && 'on'}`}>View</div>
                    <Toggle
                      value={this.state.canView}
                      onToggle={() => {
                        let { canView } = { ...this.state };
                        const { canReplace, canDownload } = { ...this.state };
                        canView = !canView;
                        this.setState({ canView, canReplace, canDownload });
                        // handleShareDocCheck({ canView, canReplace, canDownload });
                      }}
                    />
                  </div>
                  <div className="sr-permission">
                    <ShareRequestPermissionSvg
                      permission="replace"
                      isOn={this.state.canReplace}
                    />
                    <div className={`sr-title ${this.state.canReplace && 'on'}`}>Replace</div>
                    <Toggle
                      value={this.state.canReplace}
                      onToggle={() => {
                        let { canReplace } = { ...this.state };
                        const { canView, canDownload } = { ...this.state };
                        canReplace = !canReplace;
                        this.setState({ canView, canReplace, canDownload });
                        // handleShareDocCheck({ canView, canReplace, canDownload });
                      }}
                    />
                  </div>
                  <div className="sr-permission">
                    <ShareRequestPermissionSvg
                      permission="download"
                      isOn={this.state.canDownload}
                    />
                    <div className={`sr-title ${this.state.canDownload && 'on'}`}>Download</div>
                    <Toggle
                      value={this.state.canDownload}
                      onToggle={() => {
                        let { canView, canDownload } = { ...this.state };
                        const { canReplace } = { ...this.state };
                        if (!canView && !canDownload) {
                          canView = !canDownload;
                          canDownload = !canDownload;
                        } else {
                          canDownload = !canDownload;
                        }
                        this.setState({ canView, canReplace, canDownload });
                        // handleShareDocCheck({ canView, canReplace, canDownload });
                      }}
                    />
                  </div>
                </div>
                {/* <Checkbox
                  isChecked={shareRequest && shareRequest.approved}
                  onClick={handleShareDocCheck}
                /> */}
                {/* <div className="share-status">
                  This file is{' '}
                  {shareRequest && shareRequest.approved ? '' : 'NOT '}currently
                  shared with
                  {' ' + selectedContact.username}
                </div> */}
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
                  <img
                    className="contact-image"
                    src={AccountService.getProfileURL(account.profileImageUrl!)}
                    alt="Profile"
                  />
                  {/* {this.containsBadge(account, shareRequests) && (
                    <div className="badge-container">
                      <Badge />
                    </div>
                  )} */}
                  <div className="contact-name">{account.username}</div>
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
                    <img
                      className="contact-image"
                      src={AccountService.getProfileURL(
                        account.profileImageUrl!
                      )}
                      alt="Profile"
                    />
                    <div className="contact-name">{account.username}</div>
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
