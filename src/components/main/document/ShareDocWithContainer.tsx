import React, {Component, Fragment} from 'react';
import classNames from 'classnames';
import AccountService from '../../../services/AccountService';
import AccountImpl from '../../../models/AccountImpl';
import {roleDisplayMap} from '../../../models/Role';
import Checkbox from '../../common/Checkbox';
import Select from 'react-select/base';
import {addMonths, format} from 'date-fns';
import Account from '../../../models/Account';
import ShareRequest from '../../../models/ShareRequest';
import './ShareDocWithContainer.scss';
import Carousel from 'react-multi-carousel';
import Document from '../../../models/document/Document';

interface ShareDocWithContainerProps {
  selectedContact?: Account;
  getDocumentSharedWithContact: () => ShareRequest | undefined;
  handleShareDocCheck: () => Promise<void>;
  accounts: Account[];
  handleSelectContact: (contact: Account) => void;
  document?: Document;
}

class ShareDocWithContainer extends Component<ShareDocWithContainerProps> {
  render() {
    const {
      selectedContact, getDocumentSharedWithContact, handleShareDocCheck, accounts,
      handleSelectContact, document
    } = {...this.props};
    return (
      <div className="share-container">
        <div className={classNames({'contact-details': true, active: selectedContact})}>
          {selectedContact && (
            <div>
              <div className="contact-top">
                <img className="contact-detail-image"
                     src={AccountService.getProfileURL(selectedContact.profileImageUrl!)}
                     alt="Profile"/>
                <div className="contact-detail-share-doc-sm">
                  <div className="prompt">
                    Share {document!.type}?
                  </div>
                  <Checkbox isLarge isChecked={!!getDocumentSharedWithContact()} onClick={handleShareDocCheck}/>
                  <div className="share-status">
                    This file is {!!getDocumentSharedWithContact() ? '' : 'NOT '}currently shared with
                    {' ' + selectedContact.username}
                  </div>
                </div>
              </div>
              <div className="contact-detail-info">
                <div className="info-item">
                  <div className="item-attr">Name</div>
                  <div className="item-value">
                    {AccountImpl.getFullName(selectedContact?.firstName, selectedContact?.lastName)}
                  </div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Organization</div>
                  <div className="item-value">{selectedContact?.organization || '-'}</div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Role</div>
                  <div className="item-value">{roleDisplayMap[selectedContact.role]}</div>
                </div>
                <div className="info-item">
                  <div className="item-attr">Phone</div>
                  <div className="item-value">{selectedContact?.phoneNumber || '-'}</div>
                </div>
                <div className="info-item">
                  <div className="item-attr">E-mail</div>
                  <div className="item-value">{selectedContact.email}</div>
                </div>
              </div>
              <div className="contact-detail-share-doc">
                <div className="prompt">
                  Share {document!.type}?
                </div>
                <Checkbox isLarge isChecked={!!getDocumentSharedWithContact()} onClick={handleShareDocCheck}/>
                <div className="share-status">
                  This file is {!!getDocumentSharedWithContact() ? '' : 'NOT '}currently shared with
                  {' ' + selectedContact.username}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="contact-list">
            <div className="title">contacts</div>
            <div className="subtitle">Select a contact to share this document with</div>
            <div className="contact-grid">
              {accounts.map(account => (
                <div key={account.id}
                     className={classNames({
                         contact: true,
                         active: (selectedContact && selectedContact.id === account.id)
                       }
                     )}
                     onClick={() => handleSelectContact(account)}>
                  <img className="contact-image"
                       src={AccountService.getProfileURL(account.profileImageUrl!)}
                       alt="Profile"/>
                  <div className="contact-name">{account.username}</div>
                </div>
              ))}
            </div>
            <div className="contact-grid-sm">
              <Carousel
                responsive={{
                  mobile: {
                    breakpoint: {max: 768, min: 0},
                    items: 2
                  }
                }}
                infinite={false}
                // showDots={true}
              >
                {accounts.map(account => (
                  <div key={account.id}
                       className={classNames({
                           contact: true,
                           active: (selectedContact && selectedContact.id === account.id)
                         }
                       )}
                       onClick={() => handleSelectContact(account)}>
                    <img className="contact-image"
                         src={AccountService.getProfileURL(account.profileImageUrl!)}
                         alt="Profile"/>
                    <div className="contact-name">{account.username}</div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
          <div className="share-time-limit">
            <div className="share-time-disabled-overlay"/>
            <div className="title">time limit</div>
            <div className="subtitle">Specify how long this document will be shared</div>
            <div className="share-for-container">
              <div className="share-for-form-group">
                <label>Share for...</label>
                <div className="duration">
                  <Select/>
                </div>
              </div>
              <div className="date-container">
                <div className="date-indicator">From</div>
                <div className="date-value">{format(new Date(), 'MMMM d, y')}</div>
                {/* <div className="date-value">September 25, 2020</div> */}
              </div>
              <div className="date-container">
                <div className="date-indicator">To</div>
                <div className="date-value">{format(addMonths(new Date(), 1), 'MMMM d, y')}</div>
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
