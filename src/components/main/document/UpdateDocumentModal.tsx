import React, { ChangeEvent, Component } from 'react';
import {
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import classNames from 'classnames';
import Document from '../../../models/document/Document';
import './UpdateDocumentModal.scss';
import DocumentService from '../../../services/DocumentService';
import { ReactComponent as DeleteSvg } from '../../../img/delete.svg';
import { ReactComponent as EditDocSvg } from '../../../img/edit-doc.svg';
import { ReactComponent as EditDocSmSvg } from '../../../img/edit-doc-sm.svg';
import { ReactComponent as CrossSvg } from '../../../img/cross2.svg';
import { ReactComponent as CrossSmSvg } from '../../../img/cross2-sm.svg';
import FileUploader from '../../common/FileUploader';
import { ReactComponent as DownloadBtnSvg } from '../../../img/download-btn.svg';
// import {ReactComponent as FlipDocBtnSvg} from '../../../img/flip-doc-btn.svg';
import { ReactComponent as PrintBtnSvg } from '../../../img/print-btn.svg';
import { ReactComponent as ZoomBtnSvg } from '../../../img/zoom-btn.svg';
import { ReactComponent as ZoomBtnSmSvg } from '../../../img/zoom-btn-sm.svg';
import Lightbox from 'react-image-lightbox';
import Account from '../../../models/Account';
import AccountImpl from '../../../models/AccountImpl';
import { format } from 'date-fns';
import ShareRequest from '../../../models/ShareRequest';
import ShareRequestService from '../../../services/ShareRequestService';
import UpdateDocumentRequest from '../../../models/document/UpdateDocumentRequest';
import ShareDocWithContainer from './ShareDocWithContainer';
import StringUtil from '../../../util/StringUtil';
import EthCrypto, { Encrypted } from 'eth-crypto';
import ZipUtil from '../../../util/ZipUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';

interface UpdateDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  document?: Document;
  handleDeleteDocument: (document: Document) => Promise<void>;
  shareRequests: ShareRequest[];
  accounts: Account[];
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  myAccount: Account;
  handleUpdateDocument: (request: UpdateDocumentRequest) => void;
  privateEncryptionKey?: string;
}

interface UpdateDocumentModalState {
  activeTab: string;
  showConfirmDeleteSection: boolean;
  hasConfirmedDelete: boolean;
  deleteConfirmInput: string;
  isZoomed: boolean;
  selectedContact?: Account;
  showConfirmShare: boolean;
  newFile?: File;
  newThumbnailFile?: File;
  base64Image?: string;
}

class UpdateDocumentModal extends Component<UpdateDocumentModalProps,
  UpdateDocumentModalState> {
  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      showConfirmShare: false,
      base64Image: undefined
    };
  }

  async componentDidUpdate(prevProps: Readonly<UpdateDocumentModalProps>) {
    if (prevProps.document !== this.props.document
      && this.props.document && this.props.privateEncryptionKey) {
      let base64Image: string | undefined;
      try {
        const encryptedString = await ZipUtil.unzip(DocumentService.getDocumentURL(this.props.document.url));
        base64Image = await CryptoUtil.getDecryptedString(this.props.privateEncryptionKey, encryptedString);
      } catch (err) {
        console.error(err);
      }
      this.setState({ base64Image });
    }
  }

  toggleModal = () => {
    // clear state
    const { toggleModal } = { ...this.props };
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false,
      base64Image: undefined
    });
    toggleModal();
  };

  handleUpdateDocument = () => {
    const { newFile, newThumbnailFile } = { ...this.state };
    const { handleUpdateDocument, document } = { ...this.props };
    handleUpdateDocument({
      id: document!._id!,
      img: newFile,
      thumbnail: newThumbnailFile,
      validUntilDate: undefined // FIXME: add expired at form somewhere
    });
    // clear state
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false,
      base64Image: undefined
    });
  };

  handleShareDocWithContact = async () => {
    const { document, addShareRequest, myAccount } = { ...this.props };
    const { selectedContact, base64Image } = { ...this.state };
    // then add share and approve it api call
    try {
      if (selectedContact && base64Image) {
        const encryptionPublicKey = selectedContact.didPublicEncryptionKey!;
        const file: File = StringUtil.dataURLtoFile(base64Image, 'original');
        const base64Thumbnail = await StringUtil.fileContentsToThumbnailString(file);
        const encryptedString = await CryptoUtil.getEncryptedPublicString(encryptionPublicKey!, base64Image);
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
          selectedContact?.id!
        );
        addShareRequest(newShareRequest);
      }
    } catch (err) {
      console.error(err.message);
    }
    // Note: you don't need to approve anymore since your the owner
    // newShareRequest = await ShareRequestService.approveShareRequest(newShareRequest._id);
    this.setState({ selectedContact, showConfirmShare: false });
  };

  handleShareDocCheck = async () => {
    const { removeShareRequest } = { ...this.props };
    const { selectedContact } = { ...this.state };
    let showConfirmShare = false;
    if (this.getDocumentSharedWithContact()) {
      try {
        await ShareRequestService.deleteShareRequest(
          this.getDocumentSharedWithContact()!._id!
        );
        removeShareRequest(this.getDocumentSharedWithContact()!);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      // show prompt
      showConfirmShare = true;
    }
    this.setState({ selectedContact, showConfirmShare });
  };

  toggleConfirmShare = () => {
    const { showConfirmShare } = { ...this.state };
    this.setState({ showConfirmShare: !showConfirmShare });
  };

  toggleTab = (tab: string) => {
    const { activeTab } = { ...this.state };
    if (activeTab !== tab)
      this.setState({ activeTab: tab, showConfirmDeleteSection: false });
  };

  handleDeleteDocument = async (document: Document) => {
    const { handleDeleteDocument } = { ...this.props };
    try {
      await handleDeleteDocument(document);
      this.setState({
        activeTab: '1',
        showConfirmDeleteSection: false,
        hasConfirmedDelete: false,
        deleteConfirmInput: '',
        isZoomed: false,
        selectedContact: undefined,
        showConfirmShare: false,
        base64Image: undefined
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  handleDeleteConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let hasConfirmedDelete = false;
    if (value === 'DELETE') {
      hasConfirmedDelete = true;
    }
    this.setState({ deleteConfirmInput: value, hasConfirmedDelete });
  };

  confirmDelete = () => {
    this.setState({ activeTab: '0', showConfirmDeleteSection: true });
  };

  setFile = (newFile: File, newThumbnailFile: File) => {
    this.setState({ newFile, newThumbnailFile });
  };

  printImg(url: string) {
    const win = window.open('');
    win?.document.write(
      '<img src="' + url + '" onload="window.print();window.close()" />'
    );
    win?.focus();
  }

  getDocumentSharedWithContact = () => {
    const { selectedContact } = { ...this.state };
    const { shareRequests } = { ...this.props };
    const shareRequestMatch = shareRequests.find(
      (shareRequest) => selectedContact?.id === shareRequest.shareWithAccountId
    );
    if (shareRequestMatch) {
      return shareRequestMatch;
    }
    return undefined;
  };

  handleSelectContact = (selectedContact: Account) => {
    this.setState({ selectedContact });
  };

  render() {
    const { showModal, document, accounts, myAccount } = { ...this.props };
    const {
      activeTab,
      showConfirmDeleteSection,
      hasConfirmedDelete,
      deleteConfirmInput,
      isZoomed,
      selectedContact,
      showConfirmShare,
      newFile,
      base64Image
    } = { ...this.state };
    const closeBtn = (
      <div className="modal-close" onClick={this.toggleModal}>
        <CrossSvg className="lg" />
        <CrossSmSvg className="sm" />
      </div>
    );
    let uploadedBy = 'N/A';
    if (document) {
      const uploadedByAccount = AccountImpl.getAccountByIdAndList(
        [...accounts, myAccount],
        document!.uploadedBy
      );
      uploadedBy = AccountImpl.getFullName(
        uploadedByAccount?.firstName,
        uploadedByAccount?.lastName
      );
    }
    return (
      <Modal
        isOpen={showModal}
        toggle={this.toggleModal}
        backdrop={'static'}
        size={'xl'}
        className="update-doc-modal"
      >
        <ModalHeader toggle={this.toggleModal} close={closeBtn}>
          <EditDocSvg className="lg" />
          <EditDocSmSvg className="sm" />
          <span>{document?.type}</span>
        </ModalHeader>
        <ModalBody className="update-doc-container">
          <div
            className={classNames({
              'upload-doc-delete-container': true,
              active: showConfirmDeleteSection
            })}
          >
            <DeleteSvg
              className="delete-svg"
              onClick={() => this.confirmDelete()}
            />
          </div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classNames({ active: activeTab === '1' })}
                onClick={() => {
                  this.toggleTab('1');
                }}
              >
                Preview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classNames({ active: activeTab === '2' })}
                onClick={() => {
                  this.toggleTab('2');
                }}
              >
                Replace
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classNames({ active: activeTab === '3' })}
                onClick={() => {
                  this.toggleTab('3');
                }}
              >
                Share
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Row>
                {document && (
                  <Col sm="12" className="preview-container">
                    <div className="preview-img-container">
                      <div className="img-tools">
                        {/* NOTE: leaving out for now until we have functionality server side */}
                        {/*<FlipDocBtnSvg className="pointer"/>*/}
                      </div>
                      <div className="img-container">
                        <ImageWithStatus imageUrl={base64Image} imageViewType={ImageViewTypes.PREVIEW} />
                        {/* <img
                          className="doc-image"
                          // src={DocumentService.getDocumentURL(document!.url)}
                          src={base64Image}
                          alt="doc missing"
                        /> */}
                        <ZoomBtnSmSvg
                          onClick={() => this.setState({ isZoomed: true })}
                        />
                      </div>
                      <div className="img-access-sm">
                        <button
                          onClick={() => {
                            // Not allowed to navigate top frame to data URL
                            // window.location.href = base64Image!;
                            const iframe = '<iframe width="100%" height="100%" src="' + base64Image! + '"></iframe>';
                            const x = window.open()!;
                            x.document.open();
                            x.document.write(iframe);
                            x.document.close();
                          }}
                          className="download-btn"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => this.printImg(base64Image!)}
                          className="print-btn"
                        >
                          Print
                        </button>
                      </div>
                      <div className="img-access">
                        <a
                          href={base64Image}
                          download
                          target="_blank"
                        >
                          <DownloadBtnSvg />
                        </a>
                        <PrintBtnSvg
                          onClick={() => this.printImg(base64Image!)}
                        />
                        <ZoomBtnSvg
                          onClick={() => this.setState({ isZoomed: true })}
                        />
                      </div>
                    </div>
                    <div className="preview-info">
                      <div className="preview-info-item">
                        <div className="attr">File</div>
                        <div className="attr-value">{document!.type}</div>
                      </div>
                      <div className="preview-info-item">
                        <div className="attr">Update date</div>
                        <div className="attr-value">
                          {format(new Date(document?.updatedAt!), 'MM/dd/yyyy')}
                        </div>
                      </div>
                      <div className="preview-info-item">
                        <div className="attr">Uploaded by</div>
                        <div className="attr-value">{uploadedBy}</div>
                      </div>
                      <div className="preview-info-item">
                        <div className="attr">Valid Until</div>
                        <div className="attr-value">N/A</div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
              <div className="delete-sm">
                <button
                  onClick={() =>
                    this.setState({ showConfirmDeleteSection: true })
                  }
                >
                  {showConfirmDeleteSection && <strong>Delete File</strong>}
                  {!showConfirmDeleteSection && 'Delete File'}
                </button>
                {showConfirmDeleteSection && (
                  <div className="confirm-delete-sm">
                    <p>
                      Deleting this file will <strong>permanently</strong>{' '}
                      revoke access to all users you have shared this document
                      with.
                    </p>
                    <p>Are you sure?</p>
                    <FormGroup>
                      <Label for="documentDelete">Type DELETE to confirm</Label>
                      <Input
                        type="text"
                        name="documentDelete"
                        value={deleteConfirmInput}
                        onChange={this.handleDeleteConfirmChange}
                        placeholder=""
                        autoComplete="off"
                      />
                      <span className="delete-info">
                        Please enter the text exactly as displayed to confirm
                      </span>
                    </FormGroup>
                    <div className="delete-final">
                      <Button
                        color="danger"
                        onClick={() => this.handleDeleteDocument(document!)}
                        disabled={!hasConfirmedDelete}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabPane>
            <TabPane tabId="2">
              <div className="update-doc-tab-spacing">
                <FileUploader
                  setFile={this.setFile}
                  privateEncryptionKey={this.props.privateEncryptionKey} />
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div>
                <ShareDocWithContainer
                  accounts={accounts}
                  getDocumentSharedWithContact={
                    this.getDocumentSharedWithContact
                  }
                  handleShareDocCheck={this.handleShareDocCheck}
                  selectedContact={selectedContact}
                  handleSelectContact={this.handleSelectContact}
                  document={document}
                />
              </div>
            </TabPane>
          </TabContent>
          {showConfirmDeleteSection && (
            <div className="confirm-delete-container">
              <div className="delete-prompt">
                Are you sure you want to permanently delete this file?
              </div>
              <div className="delete-section">
                <div className="delete-image-container">
                  {document && (
                    <img
                      className="delete-image"
                      src={base64Image}
                      alt="doc missing"
                    />
                  )}
                </div>
                <div className="delete-info">
                  <div className="delete-info-prompt">
                    <p>
                      Deleting this file will{' '}
                      <span className="delete-info-danger">
                        permanently revoke access to all users.
                      </span>
                    </p>
                    <p>Are you sure?</p>
                  </div>
                  <FormGroup>
                    <Label for="documentDelete" className="other-prompt">
                      Type DELETE to confirm
                    </Label>
                    <Input
                      type="text"
                      name="documentDelete"
                      value={deleteConfirmInput}
                      onChange={this.handleDeleteConfirmChange}
                      placeholder=""
                      autoComplete="off"
                    />
                    <span>
                      Please enter the text exactly as displayed to confirm
                    </span>
                  </FormGroup>
                </div>
              </div>
              <div className="delete-buttons">
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={this.toggleModal}
                >
                  Cancel
                </Button>{' '}
                <Button
                  className="margin-wide"
                  color="danger"
                  onClick={() => this.handleDeleteDocument(document!)}
                  disabled={!hasConfirmedDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          {isZoomed && (
            <Lightbox
              // reactModalStyle={{zIndex: '1060'}}
              mainSrc={base64Image!}
              onCloseRequest={() => this.setState({ isZoomed: false })}
            />
          )}
          <Modal
            toggle={this.toggleConfirmShare}
            size={'lg'}
            isOpen={showConfirmShare}
          >
            {/*<ModalHeader>Nested Modal title</ModalHeader>*/}
            <ModalBody>
              {document && (
                <div className="confirm-share">
                  <div className="confirm-share-prompt">
                    You're about to share
                    <br />
                    {document?.type?.toUpperCase()} with{' '}
                    {AccountImpl.getFullName(
                      selectedContact?.firstName,
                      selectedContact?.lastName
                    ).toUpperCase()}
                    .
                  </div>
                  <img
                    className="share-doc-img"
                    src={base64Image}
                    alt="doc missing"
                  />
                  <div className="confirm-prompt">
                    Are you sure you want to continue?
                  </div>
                  <div className="confirm-buttons">
                    <Button
                      outline
                      color="secondary"
                      onClick={this.toggleConfirmShare}
                    >
                      No, take me back
                    </Button>
                    <Button
                      color="primary"
                      onClick={this.handleShareDocWithContact}
                    >
                      Yes, share access
                    </Button>
                  </div>
                </div>
              )}
            </ModalBody>
          </Modal>
        </ModalBody>
        {activeTab === '2' && (
          <ModalFooter className="modal-footer-center">
            <Button
              color="primary"
              onClick={this.handleUpdateDocument}
              disabled={!newFile}
            >
              Save
            </Button>
          </ModalFooter>
        )}
      </Modal>
    );
  }
}

export default UpdateDocumentModal;
