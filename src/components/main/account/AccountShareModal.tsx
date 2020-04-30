import React, {Component, Fragment} from 'react';
import {Modal, ModalBody, ModalHeader, TabPane} from 'reactstrap';
import {ReactComponent as ContactSvg} from '../../../img/contact.svg';
import {ReactComponent as CrossSvg} from '../../../img/cross3.svg';
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
import ShareRequest from '../../../models/ShareRequest';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import StringUtil from '../../../util/StringUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import ZipUtil from '../../../util/ZipUtil';

interface AccountShareModalProps {
  showModal: boolean;
  toggleModal: () => void;
  account: Account;
  searchedDocuments: Document[];
  myAccount: Account;
  shareRequests: ShareRequest[];
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  privateEncryptionKey: string;
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

  handleShareDocWithContact = async (document: Document): Promise<void> => {
    const {myAccount, account, removeShareRequest, addShareRequest, privateEncryptionKey} = {...this.props};
    try {
      if(this.getDocumentSharedWithContact(document)) {
        await ShareRequestService.deleteShareRequest(this.getDocumentSharedWithContact(document)!._id!);
        removeShareRequest(this.getDocumentSharedWithContact(document)!);
      } else {
        const encryptionPublicKey = account.didPublicEncryptionKey!;
        const encryptedString = await ZipUtil.unzip(DocumentService.getDocumentURL(document.url));
        const base64Image = await CryptoUtil.getDecryptedString(privateEncryptionKey, encryptedString);
        const file: File = StringUtil.dataURLtoFile(base64Image, 'original');
        const base64Thumbnail = await StringUtil.fileContentsToThumbnailString(file);
        const encryptedThumbnail = await CryptoUtil.getEncryptedPublicString(encryptionPublicKey!, base64Thumbnail);
        const zipped: Blob = await ZipUtil.zip(encryptedString);
        const zippedThumbnail: Blob = await ZipUtil.zip(encryptedThumbnail);
        const newZippedFile = new File([zipped], 'encrypted-image.zip', {
          type: 'application/zip',
          lastModified: Date.now()
        });
        const newZippedThumbnailFile = new File([zippedThumbnail], 'encrypted-image-thumbnail.zip', {
          type: 'application/zip',
          lastModified: Date.now()
        });
        const newShareRequest = await ShareRequestService.addShareRequestFile(
          newZippedFile,
          newZippedThumbnailFile,
          document?.type!,
          myAccount.id,
          account?.id!
        );
        addShareRequest(newShareRequest);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  getDocumentSharedWithContact = (document: Document) => {
    const {account, shareRequests} = {...this.props};
    const shareRequestMatch = shareRequests
      .find(shareRequest => (account?.id === shareRequest.shareWithAccountId && shareRequest.documentType === document.type));
    if(shareRequestMatch) {
      return shareRequestMatch;
    }
    return undefined;
  };

  toggleDocShare = (documentType: string) => {
    const {docShare} = {...this.state};
    docShare[documentType] = !docShare[documentType];
    this.setState({docShare});
  };

  render() {
    const {toggleModal, showModal, account, searchedDocuments, privateEncryptionKey} = {...this.props};
    const {docShare} = {...this.state};
    // width="34.135" height="33.052"
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
          <ContactSvg />
          <span>{AccountImpl.getFullName(account.firstName, account.lastName)}</span>
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
                {searchedDocuments.map((searchedDocument, idx) => (
                  <div key={idx} className="document-item">
                    <div className="doc-info">
                      <ImageWithStatus
                        imageViewType={ImageViewTypes.GRID_LAYOUT}
                        imageUrl={DocumentService.getDocumentURL(searchedDocument.thumbnailUrl)}
                        encrypted
                        privateEncryptionKey={privateEncryptionKey}
                      />
                      {/* <img src={DocumentService.getDocumentURL(searchedDocument.url)} alt={''} /> */}
                      <div className="doc-type">{searchedDocument.type}</div>
                    </div>
                    <div className="doc-share">
                      <div className="share-subtitle">shared</div>
                      <Checkbox onClick={() => this.handleShareDocWithContact(searchedDocument)} isChecked={!!this.getDocumentSharedWithContact(searchedDocument)} />
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
