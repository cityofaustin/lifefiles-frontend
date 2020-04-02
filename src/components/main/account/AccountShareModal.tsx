import React, {Component, Fragment} from 'react';
import {Modal, ModalBody, ModalHeader, TabPane} from 'reactstrap';
import {ReactComponent as ContactSvg} from '../../../img/contact.svg';
import {ReactComponent as CrossSvg} from '../../../img/cross2.svg';
import AccountImpl from '../../../models/AccountImpl';
import Account from '../../../models/Account';
import AccountService from '../../../services/AccountService';
import {roleDisplayMap} from '../../../models/Role';
import './AccountShareModal.scss';
import DeleteContactBtn from './DeleteContactBtn';
import Toggle from '../../common/Toggle';
import {ReactComponent as DownloadSvg} from '../../../img/download.svg';
import {ReactComponent as PrintSvg} from '../../../img/print.svg';
import {ReactComponent as UploadSvg} from '../../../img/upload.svg';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
import Checkbox from '../../common/Checkbox';
import ShareRequestService from '../../../services/ShareRequestService';

interface AccountShareModalProps {
  showModal: boolean;
  toggleModal: () => void;
  account: Account;
  searchedDocuments: Document[];
}

// NOTE: temporarily until get share api hooked up.
interface AccountShareModalState {
  docShare: DocShare;
}

interface DocShare {
  [key: string]: boolean;
}

class AccountShareModal extends Component<AccountShareModalProps, AccountShareModalState> {

  constructor(props: Readonly<AccountShareModalProps>) {
    super(props);
    this.state = {
      docShare: {}
    };
  }

  handleShareDocWithContact = async () => {
    // TODO
    // const {document, addShareRequest, myAccount} = {...this.props};
    // const {selectedContact} = {...this.state};
    // then add share and approve it api call
    // const newShareRequest = await ShareRequestService.addShareRequest(document?.type!, myAccount.id, selectedContact?.id!);
    // Note: you don't need to approve anymore since your the owner
    // addShareRequest(newShareRequest);
    // this.setState({selectedContact, showConfirmShare: false});
  };

  getDocumentSharedWithContact = (document: Document) => {
    // TODO
    const {account} = {...this.props};
    // const shareRequestMatch = shareRequests.find(shareRequest => selectedContact?.id === shareRequest.shareWithAccountId);
    // if(shareRequestMatch) {
    //   return shareRequestMatch;
    // }
    return undefined;
  };

  toggleDocShare = (documentType: string) => {
    const {docShare} = {...this.state};
    docShare[documentType] = !docShare[documentType];
    this.setState({docShare});
  };

  render() {
    const {toggleModal, showModal, account, searchedDocuments} = {...this.props};
    const {docShare} = {...this.state};
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
              <div className="delete-contact-container">
                <DeleteContactBtn/>
              </div>
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
              <div className="permissions">
                <div className="permissions-title">Permissions</div>
                <div className="permissions-prompt">This person can do the following with my documents...</div>
                <div className="permission">
                  <div className="permission-item">
                    <div className="permission-icon">
                      <PrintSvg/>
                    </div>
                    <div>Print</div>
                  </div>
                  <Toggle/>
                </div>
                <div className="permission">
                  <div className="permission-item">
                    <div className="permission-icon">
                      <UploadSvg/>
                    </div>
                    <div>Upload</div>
                  </div>
                  <Toggle/>
                </div>
                <div className="permission">
                  <div className="permission-item">
                    <div className="permission-icon">
                      <DownloadSvg/>
                    </div>
                    <div>Download</div>
                  </div>
                  <Toggle/>
                </div>
              </div>
            </div>
            <div className="right-pane">
              <div className="share-title">Shared Documents</div>
              <div className="document-grid">
                {searchedDocuments.map(searchedDocument => (
                  <div key={searchedDocument._id} className="document-item">
                    <div className="doc-info">
                      <img src={DocumentService.getDocumentURL(searchedDocument.url)} alt={''} />
                      <div className="doc-type">{searchedDocument.type}</div>
                    </div>
                    <div className="doc-share">
                      <div className="share-subtitle">shared</div>
                      <Checkbox onClick={() => this.toggleDocShare(searchedDocument.type)} isChecked={docShare[searchedDocument.type]} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default AccountShareModal;
