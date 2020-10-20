import React, { Component, Fragment } from 'react';
import { Modal, ModalBody, ModalHeader, TabPane } from 'reactstrap';
import { ReactComponent as ContactSvg } from '../../../img/contact.svg';
import { ReactComponent as CrossSvg } from '../../../img/cross3.svg';
import AccountImpl from '../../../models/AccountImpl';
import Account from '../../../models/Account';
import AccountService from '../../../services/AccountService';
import { roleDisplayMap } from '../../../models/Role';
import './AccountShareModal.scss';
import DeleteContactBtn from './DeleteContactBtn';
import Toggle from '../../common/Toggle';
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

class AccountShareModal extends Component<
  AccountShareModalProps,
  AccountShareModalState
> {
  constructor(props: Readonly<AccountShareModalProps>) {
    super(props);
    this.state = {
      docShare: {},
    };
  }

  handleShareDocWithContact = async (
    document: Document,
    permissions: ShareRequestPermissions
  ): Promise<void> => {
    const {
      myAccount,
      account,
      removeShareRequest,
      addShareRequest,
      privateEncryptionKey,
    } = { ...this.props };
    try {
      if (this.getDocumentSharedWithContact(document)) {
        await ShareRequestService.deleteShareRequest(
          this.getDocumentSharedWithContact(document)!._id!
        );
        removeShareRequest(this.getDocumentSharedWithContact(document)!);
      } else {
        const encryptionPublicKey = account.didPublicEncryptionKey!;
        const encryptedString = await ZipUtil.unzip(
          DocumentService.getDocumentURL(document.url)
        );
        const base64Image = await CryptoUtil.getDecryptedString(
          privateEncryptionKey,
          encryptedString
        );
        const file: File = StringUtil.dataURLtoFile(base64Image, 'original');
        const base64Thumbnail = await StringUtil.fileContentsToThumbnail(file);
        const encryptedThumbnail = await CryptoUtil.getEncryptedByPublicString(
          encryptionPublicKey!,
          base64Thumbnail
        );
        const zipped: Blob = await ZipUtil.zip(encryptedString);
        const zippedThumbnail: Blob = await ZipUtil.zip(encryptedThumbnail);
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
      }
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

  renderPermissions(sr?: ShareRequest) {
    // const { handleShareDocCheck } = { ...this.props };
    let canView = sr ? sr.canView : false;
    let canReplace = sr ? sr.canReplace : false;
    let canDownload = sr ? sr.canDownload : false;
    // TODO: bring it in from props like for updatedocumentmodal
    const handleShareDocCheck = (a) => {};
    return (
      <Fragment>
        <div className="sr-permissions">
          <div className="sr-permission">
            <ShareRequestPermissionSvg permission="view" isOn={canView} />
            <div className={`sr-title ${canView && 'on'}`}>View</div>
            <Toggle
              value={canView}
              onToggle={() => {
                // const { canReplace } = { ...this.state };
                // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                if (canView && canDownload) {
                  canView = !canDownload;
                  canDownload = !canDownload;
                } else {
                  canView = !canView;
                }
                // this.setState({ canView, canReplace, canDownload });
                handleShareDocCheck({
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
              value={canReplace}
              onToggle={() => {
                // let { canReplace } = { ...this.state };
                // const { canView, canDownload } = { ...this.state };
                canReplace = !canReplace;
                // this.setState({ canView, canReplace, canDownload });
                handleShareDocCheck({
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
              value={canDownload}
              onToggle={() => {
                // let { canView, canDownload } = { ...this.state };
                // const { canReplace } = { ...this.state };
                // NOTE: download true should inherently toggle view true, no need to limit viewing permissions if they can download a file.
                if (!canView && !canDownload) {
                  canView = !canDownload;
                  canDownload = !canDownload;
                } else {
                  canDownload = !canDownload;
                }
                // this.setState({ canView, canReplace, canDownload });
                handleShareDocCheck({
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

  render() {
    const {
      toggleModal,
      showModal,
      account,
      searchedDocuments,
      privateEncryptionKey,
      shareRequests,
    } = { ...this.props };
    const { docShare } = { ...this.state };
    // width="34.135" height="33.052"
    const closeBtn = (
      <div className="modal-close" onClick={toggleModal}>
        <CrossSvg />
      </div>
    );

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
          <span>
            {AccountImpl.getFullName(account.firstName, account.lastName)}
          </span>
        </ModalHeader>
        <ModalBody className="account-share-container">
          <div className="account-share">
            <div className="left-pane">
              <img
                className="contact-detail-image"
                src={AccountService.getProfileURL(account.profileImageUrl!)}
                alt="img"
              />
              <div className="delete-contact-container">
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
                        <div className="doc-type">{searchedDocument.type}</div>
                      </div>
                      <div className="doc-share">
                        {/* TODO: do those toggles */}
                        {this.renderPermissions(shareRequest)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

export default AccountShareModal;
