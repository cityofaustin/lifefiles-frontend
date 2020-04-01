import React, {Component, Fragment} from 'react';
import {Modal, ModalBody, ModalHeader} from 'reactstrap';
import {ReactComponent as ContactSvg} from '../../../img/contact.svg';
import {ReactComponent as CrossSvg} from '../../../img/cross2.svg';
import AccountImpl from '../../../models/AccountImpl';
import Account from '../../../models/Account';
// import classNames from 'classnames';
import AccountService from '../../../services/AccountService';
import {roleDisplayMap} from '../../../models/Role';
import './AccountShareModal.scss';

interface AccountShareModalProps {
  showModal: boolean;
  toggleModal: () => void;
  account: Account;
}

class AccountShareModal extends Component<AccountShareModalProps> {
  render() {
    const {toggleModal, showModal, account} = {...this.props};
    const closeBtn = (<div className="modal-close" onClick={toggleModal}><CrossSvg/></div>);

    return (
      <Modal
        isOpen={showModal}
        toggle={toggleModal}
        backdrop={'static'}
        size={'xl'}
        className="account-share-modal"
      >
        <ModalHeader toggle={toggleModal} close={closeBtn}>
          <ContactSvg style={{marginLeft: '10.6px', marginRight: '30.9px'}}/>
          {AccountImpl.getFullName(account.firstName, account.lastName)}
        </ModalHeader>
        <ModalBody className="account-share-container">
          <div className="account-share">
            <div className="left-pane">
              <img className="contact-detail-image"
                   src={AccountService.getProfileURL(account.profileImageUrl!)}
                   alt="img"/>
              <div className="contact-detail-info">
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
                <div className="info-item">
                  <div className="item-attr">E-mail</div>
                  <div className="item-value">{account.email}</div>
                </div>
              </div>
              <div className="contact-detail-share-doc">
                {/*<div className="prompt">*/}
                {/*  Share Social Security Card?*/}
                {/*</div>*/}
                {/*<Checkbox isChecked={!!this.getDocumentSharedWithContact()} onClick={this.handleShareDocCheck}/>*/}
                {/*<div className="share-status">*/}
                {/*  This file is NOT currently shared with {selectedContact.username}*/}
                {/*</div>*/}
              </div>
            </div>
            <div className="right-pane">
              <div className="share-title">Shared Documents</div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default AccountShareModal;
