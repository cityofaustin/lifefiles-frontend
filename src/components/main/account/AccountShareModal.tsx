import React, { Component, Fragment } from 'react';
import { Button, Modal, ModalBody, ModalHeader, TabPane } from 'reactstrap';
import { ReactComponent as ContactSvg } from '../../../img/contact.svg';
import { ReactComponent as CrossSvg } from '../../../img/cross3.svg';
import AccountImpl from '../../../models/AccountImpl';
import Account from '../../../models/Account';
import AccountService from '../../../services/AccountService';
import { roleDisplayMap } from '../../../models/Role';
import './AccountShareModal.scss';
import DeleteContactBtn from './DeleteContactBtn';
import Toggle, { ToggleSizeEnum } from '../../common/Toggle';
// import {ReactComponent as DownloadSvg} from '../../../img/download.svg';
// import {ReactComponent as PrintSvg} from '../../../img/print.svg';
// import {ReactComponent as UploadSvg} from '../../../img/upload.svg';
import Document from '../../../models/document/Document';
import DocumentService from '../../../services/DocumentService';
// import Checkbox from '../../common/Checkbox';
import ShareRequestService, {
  ShareRequestPermissions,
} from '../../../services/ShareRequestService';
import ShareRequest from '../../../models/ShareRequest';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import StringUtil from '../../../util/StringUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import ZipUtil from '../../../util/ZipUtil';
import ShareRequestPermissionSvg from '../../svg/ShareRequestPermissionSvg';
import ProgressIndicator from '../../common/ProgressIndicator';
import DocShared from '../document/DocShared';

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
  removeHelperContact: (account: Account) => void;
}

// NOTE: temporarily until get share api hooked up.
interface AccountShareModalState {
  docShare: DocShare;
  isLoading: boolean;
  showDeleteContactModal: boolean;
}

interface DocShare {
  [key: string]: boolean;
}

class AccountShareModal extends Component<
  AccountShareModalProps,
  AccountShareModalState
> {
  constructor(props: Readonly<AccountShareModalProps>) {
    super(props);
    this.state = {
      docShare: {},
      isLoading: false,
      showDeleteContactModal: false,
      // showDeleteContactModal: true,
    };
  }

  handleShareDocWithContact = async (
    document: Document,
    permissions: ShareRequestPermissions
  ): Promise<any> => {
    const {
      myAccount,
      account,
      removeShareRequest,
      addShareRequest,
      privateEncryptionKey,
    } = { ...this.props };
    try {
      const sr = this.getDocumentSharedWithContact(document);
      if (sr) {
        await ShareRequestService.deleteShareRequest(sr!._id!);
        removeShareRequest(this.getDocumentSharedWithContact(document)!);
      }
      // decrypt with owner's private key
      const encryptionPublicKey = account.didPublicEncryptionKey!;
      const encryptedString = await ZipUtil.unzip(
        DocumentService.getDocumentURL(document.url)
      );
      const encryptedStringThumbnail = await ZipUtil.unzip(
        DocumentService.getDocumentURL(document.thumbnailUrl)
      );
      // could be a image or a pdf
      const dataUrl = await CryptoUtil.getDecryptedString(
        privateEncryptionKey,
        encryptedString
      );
      const dataUrlThumbail = await CryptoUtil.getDecryptedString(
        privateEncryptionKey,
        encryptedStringThumbnail
      );
      // encrypt with selected helper's public key
      const encryptedString2 = await CryptoUtil.getEncryptedByPublicString(
        encryptionPublicKey!,
        dataUrl!
      );
      const encryptedThumbnail2 = await CryptoUtil.getEncryptedByPublicString(
        encryptionPublicKey!,
        dataUrlThumbail!
      );
      const zipped: Blob = await ZipUtil.zip(encryptedString2);
      const zippedThumbnail: Blob = await ZipUtil.zip(encryptedThumbnail2);
      const newZippedFile = new File([zipped], 'encrypted-image.zip', {
        type: 'application/zip',
        lastModified: Date.now(),
      });
      const newZippedThumbnailFile = new File(
        [zippedThumbnail],
        'encrypted-image-thumbnail.zip',
        {
          type: 'application/zip',
          lastModified: Date.now(),
        }
      );
      const newShareRequest = await ShareRequestService.addShareRequestFile(
        newZippedFile,
        newZippedThumbnailFile,
        document?.type!,
        myAccount.id,
        account?.id!,
        permissions
      );
      addShareRequest(newShareRequest);
      return newShareRequest;
    } catch (err) {
      console.error(err.message);
    }
  };

  getDocumentSharedWithContact = (document: Document) => {
    const { account, shareRequests } = { ...this.props };
    const shareRequestMatch = shareRequests.find(
      (shareRequest) =>
        account?.id === shareRequest.shareWithAccountId &&
        shareRequest.documentType === document.type
    );
    if (shareRequestMatch) {
      return shareRequestMatch;
    }
    return undefined;
  };

  toggleDocShare = (documentType: string) => {
    const { docShare } = { ...this.state };
    docShare[documentType] = !docShare[documentType];
    this.setState({ docShare });
  };

  handleShareDocCheck = async (
    sd: Document,
    permissions: ShareRequestPermissions
  ) => {
    const { removeShareRequest } = { ...this.props };
    this.setState({ isLoading: true });
    const sr = this.getDocumentSharedWithContact(sd);
    if (sr) {
      if (
        !permissions.canDownload &&
        !permissions.canReplace &&
        !permissions.canView
      ) {
        try {
          await ShareRequestService.deleteShareRequest(sr!._id!);
          removeShareRequest(sr!);
        } catch (err) {
          console.error(err.message);
        }
      } else {
        let sr2 = sr;
        if (sr.approved === false) {
          sr2 = await this.handleShareDocWithContact(sd, permissions);
        }
        // just updating permissions then
        sr2.canView = permissions.canView;
        sr2.canReplace = permissions.canReplace;
        sr2.canDownload = permissions.canDownload;
        await ShareRequestService.updateShareRequestPermissions(sr2);
      }
    } else {
      await this.handleShareDocWithContact(sd, permissions);
    }
    this.setState({ isLoading: false });
  };

  handleDeleteContact = () => {
    const {toggleModal, removeHelperContact, account} = {...this.props};
    this.setState({showDeleteContactModal: false});
    toggleModal();
    removeHelperContact(account);
  };

  renderPermissions(sd: Document, size: ToggleSizeEnum, sr?: ShareRequest) {
    let canView = sr ? sr.canView : false;
    let canReplace = sr ? sr.canReplace : false;
    let canDownload = sr ? sr.canDownload : false;
    return (
      <Fragment>
        <div className="sr-permissions" style={{ marginTop: '15.5px' }}>
          <div className="sr-permission" style={{ marginBottom: '15px' }}>
            <ShareRequestPermissionSvg permission="view" isOn={canView} />
            <div className={`sr-title ${canView && 'on'}`}>View</div>
            <Toggle
              size={size}
              value={canView}
              onToggle={() => {
                // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                if (canView && canDownload) {
                  canView = !canDownload;
                  canDownload = !canDownload;
                } else {
                  canView = !canView;
                }
                this.handleShareDocCheck(sd, {
                  canView,
                  canReplace,
                  canDownload,
                });
              }}
            />
          </div>
          <div className="sr-permission">
            <ShareRequestPermissionSvg permission="replace" isOn={canReplace} />
            <div className={`sr-title ${canReplace && 'on'}`}>Replace</div>
            <Toggle
              size={size}
              value={canReplace}
              onToggle={() => {
                canReplace = !canReplace;
                this.handleShareDocCheck(sd, {
                  canView,
                  canReplace,
                  canDownload,
                });
              }}
            />
          </div>
          <div className="sr-permission">
            <ShareRequestPermissionSvg
              permission="download"
              isOn={canDownload}
            />
            <div className={`sr-title ${canDownload && 'on'}`}>Download</div>
            <Toggle
              size={size}
              value={canDownload}
              onToggle={() => {
                // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                if (!canView && !canDownload) {
                  canView = !canDownload;
                  canDownload = !canDownload;
                } else {
                  canDownload = !canDownload;
                }
                this.handleShareDocCheck(sd, {
                  canView,
                  canReplace,
                  canDownload,
                });
              }}
            />
          </div>
        </div>
      </Fragment>
    );
  }

  renderDeleteContactModal() {
    const { showDeleteContactModal } = { ...this.state };
    const closeBtn = (
      <div
        className="modal-close"
        onClick={() => this.setState({ showDeleteContactModal: false })}
      >
        <CrossSvg />
      </div>
    );
    return (
      <Modal
        isOpen={showDeleteContactModal}
        toggle={() => this.setState({ showDeleteContactModal: false })}
        backdrop={'static'}
        size={'xl'}
        className="delete-contact-modal"
      >
        <ModalHeader
          toggle={() => this.setState({ showDeleteContactModal: false })}
          close={closeBtn}
        />
        <ModalBody className="delete-contact-body">
          <div className="delete-title">Are you sure?</div>
          <div className="excerpt">
            Doing so will&nbsp;
            <strong>
              delete this contact from your network and revoke access to all
              your documents.
            </strong>
          </div>
          <div className="excerpt">
            Alternatively, you can choose to unshare all shared documents with
            this contact
          </div>
          <div className="doc-shared-container">
            <DocShared numberOfShares={4} />
            <div className="doc-share">Documents Shared</div>
          </div>
          <Button className="unshare-btn" color="danger" outline disabled>
            Unshare
          </Button>
          <div className="excerpt">
            Or, if you're sure, tap the button below to permanently remove this
            contact.
          </div>
          <Button color="danger" onClick={this.handleDeleteContact}>Delete</Button>
        </ModalBody>
      </Modal>
    );
  }

  render() {
    const {
      toggleModal,
      showModal,
      account,
      searchedDocuments,
      privateEncryptionKey,
      shareRequests,
    } = { ...this.props };
    const { isLoading } = { ...this.state };
    // width="34.135" height="33.052"
    const closeBtn = (
      <div className="modal-close" onClick={toggleModal}>
        <CrossSvg />
      </div>
    );

    return (
      <Fragment>
        {isLoading && <ProgressIndicator isFullscreen />}
        <Modal
          isOpen={showModal}
          toggle={toggleModal}
          backdrop={'static'}
          size={'xl'}
          className="account-share-modal"
        >
          <ModalHeader toggle={toggleModal} close={closeBtn}>
            <ContactSvg />
            <span>
              {AccountImpl.getFullName(account.firstName, account.lastName)}
            </span>
          </ModalHeader>
          <ModalBody className="account-share-container">
            {this.renderDeleteContactModal()}
            <div className="account-share">
              <div className="left-pane">
                <img
                  className="contact-detail-image"
                  src={AccountService.getProfileURL(account.profileImageUrl!)}
                  alt="img"
                />
                <div
                  className="delete-contact-container"
                  onClick={() => this.setState({showDeleteContactModal: true})}
                >
                  <DeleteContactBtn />
                </div>
                <div className="contact-detail-info">
                  <div className="info-item">
                    <div className="item-attr">Organization</div>
                    <div className="item-value">
                      {account?.organization || '-'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="item-attr">Role</div>
                    <div className="item-value">
                      {roleDisplayMap[account.role]}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="item-attr">Phone</div>
                    <div className="item-value">
                      {account?.phoneNumber || '-'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="item-attr">E-mail</div>
                    <div className="item-value">{account.email}</div>
                  </div>
                </div>
                <div className="permissions">
                  <div className="permissions-title">Permissions</div>
                </div>
              </div>
              <div className="right-pane">
                <div className="share-title">Shared Documents</div>
                <div className="document-grid">
                  {searchedDocuments.map((searchedDocument, idx) => {
                    const shareRequest = shareRequests.find(
                      (sr) => sr.documentType === searchedDocument.type
                    );
                    return (
                      <div key={idx} className="document-item">
                        <div className="doc-info">
                          <ImageWithStatus
                            imageViewType={ImageViewTypes.GRID_LAYOUT}
                            imageUrl={DocumentService.getDocumentURL(
                              searchedDocument.thumbnailUrl
                            )}
                            encrypted
                            privateEncryptionKey={privateEncryptionKey}
                          />
                          {/* <img src={DocumentService.getDocumentURL(searchedDocument.url)} alt={''} /> */}
                          <div className="doc-type">
                            {searchedDocument.type}
                          </div>
                        </div>
                        <div className="doc-share">
                          {this.renderPermissions(
                            searchedDocument,
                            ToggleSizeEnum.SM,
                            shareRequest
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

export default AccountShareModal;
