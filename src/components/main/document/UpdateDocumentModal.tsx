import React, { ChangeEvent, Component, Fragment } from 'react';
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
import { ReactComponent as NotSharedDoc } from '../../../img/not-shared-doc.svg';
import Lightbox from 'react-image-lightbox';
import Account from '../../../models/Account';
import AccountImpl from '../../../models/AccountImpl';
import { format } from 'date-fns';
import MSelect from '../../common/MSelect';
import ShareRequest from '../../../models/ShareRequest';
import ShareRequestService from '../../../services/ShareRequestService';
import UpdateDocumentRequest from '../../../models/document/UpdateDocumentRequest';
import ShareDocWithContainer from './ShareDocWithContainer';
import StringUtil from '../../../util/StringUtil';
import ZipUtil from '../../../util/ZipUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import NotaryUtil from '../../../util/NotaryUtil';
import ImageWithStatus, { ImageViewTypes } from '../../common/ImageWithStatus';
import AccountService from '../../../services/AccountService';
import NotaryService from '../../../services/NotaryService';
import FileBase64 from 'react-file-base64';
import DatePicker from 'react-datepicker';
import { OptionTypeBase } from 'react-select';
import ImageUtil from '../../../util/ImageUtil';
import PdfPreview from '../../common/PdfPreview';
import ProgressIndicator from '../../common/ProgressIndicator';
import APIService from '../../../services/APIService';

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
  referencedAccount?: Account;
  handleClientSelected: (otherOwnerAccount: Account) => void; // to refresh the share request data
  activeTab: string;
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
  base64Thumbnail?: string;
  base64Pdf?: string;
  docType?: string;
  pendingAccess: boolean;
  notaryId: string;
  notarySealBase64: string;
  privatePem: string;
  publicPem: string;
  notarizationType: string;
  validUntilDate: Date;
  vc?: string;
  vp?: string;
  doc?: any;
  isLoading: boolean;
}

class UpdateDocumentModal extends Component<
  UpdateDocumentModalProps,
  UpdateDocumentModalState
> {
  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      activeTab: props.activeTab,
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      showConfirmShare: false,
      base64Image: undefined,
      base64Thumbnail: undefined,
      base64Pdf: undefined,
      docType: undefined,
      pendingAccess: false,
      notaryId: '',
      notarySealBase64: '',
      privatePem: '',
      publicPem: '',
      notarizationType: '',
      validUntilDate: new Date(),
      vc: undefined,
      vp: undefined,
      doc: undefined,
      isLoading: false,
    };
  }

  async componentDidUpdate(prevProps: Readonly<UpdateDocumentModalProps>) {
    if (prevProps.activeTab !== this.props.activeTab) {
      this.setState({ activeTab: this.props.activeTab });
    }
    if (
      prevProps.document !== this.props.document &&
      this.props.document &&
      this.props.privateEncryptionKey
    ) {

      let base64Pdf: string | undefined;
      let base64Image: string | undefined;
      let base64Thumbnail: string | undefined;
      let docType: string | undefined;
      if (this.props.document.url.length > 0) {
        try {
          const encryptedThumbnail = await ZipUtil.unzip(
            DocumentService.getDocumentURL(this.props.document.thumbnailUrl)
          );
          base64Thumbnail = await CryptoUtil.getDecryptedString(
            this.props.privateEncryptionKey,
            encryptedThumbnail
          );
          this.setState({base64Thumbnail}); // do this since it's much quicker than the pdf.
          docType = this.props.document.type;
          const encryptedString = await ZipUtil.unzip(
            DocumentService.getDocumentURL(this.props.document.url)
          );
          const base64 = await CryptoUtil.getDecryptedString(
            this.props.privateEncryptionKey,
            encryptedString
          );
          if(base64.startsWith('data:application/pdf')) {
            base64Pdf = base64;
          } else {
            base64Image = base64;
          }
        } catch (err) {
          console.error(err);
        }
      }
      this.setState({ base64Image, docType, base64Pdf, base64Thumbnail });
    }

    // console.log(this.props.referencedAccount?.didAddress);
    // console.log(this.props.document);
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
      base64Image: undefined,
      base64Pdf: undefined,
      pendingAccess: false,
    });
    toggleModal();
  };

  handleUpdateDocument = () => {
    const { newFile, newThumbnailFile } = { ...this.state };
    const { handleUpdateDocument, document } = { ...this.props };
    handleUpdateDocument({
      id: '5ed6aa532f74186d6238bf47',
      // id: document!._id!,
      img: newFile,
      thumbnail: newThumbnailFile,
      validUntilDate: undefined, // FIXME: add expired at form somewhere
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
      base64Image: undefined,
    });
  };

  handleClaim = async () => {
    const { handleUpdateDocument, document } = { ...this.props };

    if(document?.vcJwt) {
      // TODO: I'm pretty sure you have to set this in parent
      this.handleOwnerAcceptNotarization();
    }

    handleUpdateDocument({
      id: document!._id!,
      img: undefined,
      thumbnail: undefined,
      validUntilDate: undefined, // FIXME: add expired at form somewhere
      claimed: true,
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
      base64Image: undefined,
    });
  };

  handleNotarizationTypeChange = (documentTypeOption: OptionTypeBase) => {
    const notarizationType = documentTypeOption.value;
    this.setState({ notarizationType });
  };

  handleNotaryIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.setState({ notaryId: value });
  };

  handleNotaryUploadNewSeal = (file: any) => {
    const notarySealBase64 = file.base64;
    ImageUtil.processImageBase64(notarySealBase64);
    this.setState({ notarySealBase64 });
  };

  handleNotaryUploadPem = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      let privatePem = '' as any;
      privatePem = ev?.target?.result;
      const publicPem = NotaryUtil.getPublicKeyFromPrivateKey(privatePem);
      this.setState({ privatePem });
      this.setState({ publicPem });
    };
    if (e.target.files !== null) {
      reader.readAsText(e.target.files[0]);
    }
  };

  handleOwnerAcceptNotarization = async () => {
    const vpJwt = await NotaryUtil.createVP(
      this.props.myAccount.didAddress,
      this.props.privateEncryptionKey!,
      this.props.document?.vcJwt!
    );

    const document = { ...this.props.document! };
    document.vpJwt = vpJwt;
    NotaryService.updateDocumentVP(
      (document.belongsTo as unknown) as string,
      document.type,
      document.vpJwt
    );
    NotaryService.anchorVpToBlockchain(vpJwt);
    this.setState({ vp: vpJwt });
  };

  handleNotarizeDocument = async () => {
    const {document, referencedAccount, myAccount} = {...this.props};

    const notarizedDoc = await NotaryUtil.createNotarizedDocument(
      'certifiedCopy',
      // this.state.notarizationType,
      this.state.validUntilDate,
      parseInt(this.state.notaryId, 10),
      this.props.myAccount.didAddress,
      this.props.privateEncryptionKey === undefined
        ? ''
        : this.props.privateEncryptionKey,
      this.state.publicPem,
      this.state.privatePem,
      this.props.referencedAccount?.didAddress === undefined
        ? ''
        : this.props.referencedAccount?.didAddress,
      this.state.base64Image === undefined ? '' : this.state.base64Image,
      this.state.notarySealBase64,
      document?.type!,
      AccountImpl.getFullName(referencedAccount?.firstName, referencedAccount?.lastName),
      AccountImpl.getFullName(myAccount.firstName, myAccount.lastName)
    );

    // await NotaryService.updateDocumentVC(
    //   this.props.referencedAccount?.id!,
    //   this.state.docType!,
    //   notarizedDoc!.vc
    // );

    this.setState({ vc: notarizedDoc!.vc });
    this.setState({ doc: notarizedDoc!.doc });
  };

  handleShareDocWithContact = async () => {
    const { document, addShareRequest, myAccount, removeShareRequest } = {
      ...this.props,
    };
    const { selectedContact, base64Image } = { ...this.state };
    this.setState({ isLoading: true });
    // then add share and approve it api call
    try {
      if (selectedContact && base64Image) {
        const encryptionPublicKey = selectedContact.didPublicEncryptionKey!;
        const file: File = StringUtil.dataURLtoFile(base64Image, 'original');
        const base64Thumbnail = await StringUtil.fileContentsToThumbnailString(
          file
        );
        const encryptedString = await CryptoUtil.getEncryptedByPublicString(
          encryptionPublicKey!,
          base64Image
        );
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
        if (
          this.getDocumentSharedWithContact(selectedContact) &&
          this.getDocumentSharedWithContact(selectedContact)?.approved === false
        ) {
          const approvedShareRequest = await ShareRequestService.approveShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            this.getDocumentSharedWithContact(selectedContact)!._id!
          );
          // update the existing shareRequest with this approved one.
          removeShareRequest(
            this.getDocumentSharedWithContact(selectedContact)!
          );
          addShareRequest(approvedShareRequest);
        } else {
          const newShareRequest = await ShareRequestService.addShareRequestFile(
            newZippedFile,
            newZippedThumbnailFile,
            document?.type!,
            myAccount.id,
            selectedContact?.id!
          );
          addShareRequest(newShareRequest);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
    // Note: you don't need to approve anymore since your the owner
    // newShareRequest = await ShareRequestService.approveShareRequest(newShareRequest._id);
    this.setState({
      selectedContact,
      showConfirmShare: false,
      isLoading: false,
    });
  };

  handleShareDocCheck = async () => {
    const { removeShareRequest } = { ...this.props };
    const { selectedContact } = { ...this.state };
    let showConfirmShare = false;
    if (
      this.getDocumentSharedWithContact(selectedContact!) &&
      this.getDocumentSharedWithContact(selectedContact!)?.approved
    ) {
      try {
        await ShareRequestService.deleteShareRequest(
          this.getDocumentSharedWithContact(selectedContact!)!._id!
        );
        removeShareRequest(
          this.getDocumentSharedWithContact(selectedContact!)!
        );
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
      this.setState({
        activeTab: tab,
        showConfirmDeleteSection: false,
        pendingAccess: false,
      });
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
        base64Image: undefined,
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

  getDocumentSharedWithContact = (selectedContact: Account) => {
    // const { selectedContact } = { ...this.state };
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

  handleRequestAccess = async () => {
    const { myAccount, referencedAccount, document, handleClientSelected } = {
      ...this.props,
    };
    await ShareRequestService.addShareRequestFile(
      undefined,
      undefined,
      document!.type,
      referencedAccount!.id,
      myAccount.id
    );
    // set this in main container
    handleClientSelected(referencedAccount!);
    this.setState({ pendingAccess: true });
  };

  renderNotarizeTab = (base64Thumbnail) => {
    const options: OptionTypeBase[] = [];
    options.push({
      value: 'certifiedCopy',
      label: 'Certified Copy',
      isDisabled: false,
    });

    if (this.props.myAccount.role === 'owner') {
      return (
        <div>
          <h4>Verifiable Credential</h4>
          <pre className="vc-display">{this.props.document?.vcJwt}</pre>
          <Button
            className="margin-wide"
            color="primary"
            onClick={this.handleOwnerAcceptNotarization}
          >
            Accept Notarization
          </Button>
        </div>
      );
    } else {
      return (
        <div className="update-doc-tab-spacing">
          <div className="row">
            <div className="col-6">
              <div className="img-container">
                <ImageWithStatus
                  imageUrl={base64Thumbnail}
                  imageViewType={ImageViewTypes.PREVIEW}
                />
              </div>
            </div>

            <div className="col-6">
              <h4>Notarization Type:</h4>

              <div className="select-md">
                <MSelect
                  options={options}
                  onChange={this.handleNotarizationTypeChange}
                  isSearchable={false}
                  placeholder={'-Select document-'}
                />
              </div>

              <h4>Notary Information:</h4>
              <FormGroup>
                <Label for="documentTypeSelected" className="other-prompt">
                  Please enter your notary id
                </Label>
                <Input
                  type="text"
                  name="documentTypeSelected"
                  id="documentTypeSelected"
                  value={this.state.notaryId}
                  onChange={this.handleNotaryIdChange}
                  placeholder="Notary Id #..."
                />

                <Label
                  style={{ paddingRight: '30px' }}
                  for="notarySeal"
                  className="other-prompt"
                >
                  Notary Seal:
                </Label>

                <FileBase64
                  multiple={false}
                  onDone={this.handleNotaryUploadNewSeal}
                />

                <Label
                  style={{ paddingRight: '30px' }}
                  for="notaryPem"
                  className="other-prompt"
                >
                  Notary Pem File:
                </Label>

                <input
                  type="file"
                  onChange={(e) => this.handleNotaryUploadPem(e)}
                />

                <DatePicker
                  selected={this.state.validUntilDate}
                  onChange={(date) => {
                    this.setState({ validUntilDate: date });
                  }}
                  dateFormatCalendar={'MMM yyyy'}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <hr></hr>
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={this.handleNotarizeDocument}
                >
                  Notarize
                </Button>
              </FormGroup>
            </div>
          </div>
        </div>
      );
    }
  };

  renderNotarizationComplete = () => {
    const { doc } = { ...this.state };
    // debugger;
    // if(doc) {
    //   console.log(doc.output('datauristring'));
    // }
    return (
      <div>
        <h3>Verifiable Credential</h3>
        <pre className="vc-display">{this.state.vc}</pre>
        {doc && (
          <div className="pdf-display">
            <PdfPreview fileURL={doc.output('datauristring')} />
            {/* <object data={doc.output('datauristring')} type="application/pdf">
                <embed src={doc.output('datauristring')} type="application/pdf" />
            </object>
            <iframe src={doc.output('datauristring')} height="297.5" width="421"></iframe> */}
            <Button
              className="margin-wide"
              color="primary"
              onClick={() => doc.save()}
            >
              Save Pdf
            </Button>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { showModal, document, accounts, myAccount, referencedAccount } = {
      ...this.props,
    };
    const {
      activeTab,
      showConfirmDeleteSection,
      hasConfirmedDelete,
      deleteConfirmInput,
      isZoomed,
      selectedContact,
      showConfirmShare,
      newFile,
      base64Image,
      base64Thumbnail,
      base64Pdf,
      pendingAccess,
      isLoading
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
      <Fragment>
        {isLoading && <ProgressIndicator isFullscreen />}
        <Modal
          isOpen={showModal}
          toggle={this.toggleModal}
          backdrop={'static'}
          size={'xl'}
          className="update-doc-modal"
        >
          <ModalHeader toggle={this.toggleModal} close={closeBtn}>
            {referencedAccount && (
              <Fragment>
                <img
                  src={AccountService.getProfileURL(
                    referencedAccount.profileImageUrl!
                  )}
                  alt=""
                />
                <span>
                  {AccountImpl.getFullName(
                    referencedAccount.firstName,
                    referencedAccount.lastName
                  )}{' '}
                  - {document?.type}
                </span>
              </Fragment>
            )}
            {!referencedAccount && (
              <Fragment>
                <EditDocSvg className="lg" />
                <EditDocSmSvg className="sm" />
                <span>{document?.type}</span>
              </Fragment>
            )}
          </ModalHeader>
          <ModalBody className="update-doc-container">
            {document && document.url.length <= 0 && (
              <div className="share-request">
                <div className="file-container">
                  <NotSharedDoc />
                  <div className="file-info">
                    <div className="attr">File</div>
                    <div className="value">{document.type}</div>
                    <div className="attr">Upload Date</div>
                    <div className="value">{document.updatedAt || '-'}</div>
                    <div className="attr">Upload By</div>
                    <div className="value">{document.uploadedBy || '-'}</div>
                    <div className="attr">Valid Until</div>
                    <div className="value">
                      {document.validUntilDate || '-'}
                    </div>
                  </div>
                </div>
                <div className="request-access">
                  <button
                    className="button"
                    onClick={this.handleRequestAccess}
                    disabled={
                      pendingAccess || document.sharedWithAccountIds.length > 0
                    }
                  >
                    {pendingAccess || document.sharedWithAccountIds.length > 0
                      ? 'Access Pending'
                      : 'Request Access'}
                  </button>
                </div>
              </div>
            )}
            {document && document.url.length > 0 && (
              <Fragment>
                {!referencedAccount && (
                  <div
                    className={classNames({
                      'upload-doc-delete-container': true,
                      active: showConfirmDeleteSection,
                    })}
                  >
                    <DeleteSvg
                      className="delete-svg"
                      onClick={() => this.confirmDelete()}
                    />
                  </div>
                )}
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

                  {!referencedAccount && (
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
                  )}

                  {/* <NavItem>
                    <NavLink
                      className={classNames({ active: activeTab === '4' })}
                      onClick={() => {
                        this.toggleTab('4');
                      }}
                    >
                      Notarize
                    </NavLink>
                  </NavItem> */}
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
                              {!base64Image && !base64Pdf && (
                                <div>Loading...</div>
                              )}
                              {base64Pdf && (
                                <div className="pdf-display">
                                  <PdfPreview fileURL={base64Pdf} height={400} />
                                </div>
                              )}
                              {base64Image && (
                                <ImageWithStatus
                                  imageUrl={base64Image}
                                  imageViewType={ImageViewTypes.PREVIEW}
                                />
                              )}
                              {/* <img
                          className="doc-image"
                          // src={DocumentService.getDocumentURL(document!.url)}
                          src={base64Image}
                          alt="doc missing"
                        /> */}
                              <ZoomBtnSmSvg
                                onClick={() =>
                                  this.setState({ isZoomed: true })
                                }
                              />
                            </div>
                            <div className="img-access-sm">
                              <button
                                onClick={() => {
                                  // Not allowed to navigate top frame to data URL
                                  // window.location.href = base64Image!;
                                  const iframe =
                                    '<iframe width="100%" height="100%" src="' +
                                    base64Image! +
                                    '"></iframe>';
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
                              <a href={base64Image} download target="_blank">
                                <DownloadBtnSvg />
                              </a>
                              <PrintBtnSvg
                                onClick={() => this.printImg(base64Image!)}
                              />
                              <ZoomBtnSvg
                                onClick={() =>
                                  this.setState({ isZoomed: true })
                                }
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
                                {document?.updatedAt &&
                                  format(
                                    new Date(document?.updatedAt),
                                    'MM/dd/yyyy'
                                  )}
                                {!document?.updatedAt && '-'}
                              </div>
                            </div>
                            <div className="preview-info-item">
                              <div className="attr">Uploaded by</div>
                              <div className="attr-value">{uploadedBy}</div>
                            </div>
                            <div className="preview-info-item">
                              <div className="attr">Valid Until</div>
                              <div className="attr-value">
                                {document?.validUntilDate &&
                                  format(
                                    new Date(document?.validUntilDate),
                                    'MM/dd/yyyy'
                                  )}
                                {!document?.validUntilDate && '-'}
                              </div>
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>
                    {!referencedAccount && (
                      <div className="delete-sm">
                        <button
                          onClick={() =>
                            this.setState({ showConfirmDeleteSection: true })
                          }
                        >
                          {showConfirmDeleteSection && (
                            <strong>Delete File</strong>
                          )}
                          {!showConfirmDeleteSection && 'Delete File'}
                        </button>
                        {showConfirmDeleteSection && (
                          <div className="confirm-delete-sm">
                            <p>
                              Deleting this file will{' '}
                              <strong>permanently</strong> revoke access to all
                              users you have shared this document with.
                            </p>
                            <p>Are you sure?</p>
                            <FormGroup>
                              <Label for="documentDelete">
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
                              <span className="delete-info">
                                Please enter the text exactly as displayed to
                                confirm
                              </span>
                            </FormGroup>
                            <div className="delete-final">
                              <Button
                                color="danger"
                                onClick={() =>
                                  this.handleDeleteDocument(document!)
                                }
                                disabled={!hasConfirmedDelete}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabPane>
                  <TabPane tabId="2">
                    <div className="update-doc-tab-spacing">
                      <FileUploader
                        setFile={this.setFile}
                        privateEncryptionKey={this.props.privateEncryptionKey}
                      />
                    </div>
                  </TabPane>
                  <TabPane tabId="3">
                    <div>
                      {document.claimed && (
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
                      )}
                      {document.claimed !== undefined &&
                        document.claimed === false && (
                          <div className="claim-container">
                            <div className="info">
                              You must claim this document before you can share
                              it
                            </div>
                            <div className="doc">
                              <ImageWithStatus
                                imageUrl={base64Thumbnail}
                                imageViewType={ImageViewTypes.PREVIEW}
                              />
                              <div className="doc-info">
                                <div className="info-attr">File Name</div>
                                <div className="info-val">{document.name}</div>
                                <div className="info-attr">Document Name</div>
                                <div className="info-val">{document.type}</div>
                                {/* TODO: expiration date */}
                              </div>
                            </div>
                            <div className="buttons">
                              <button
                                className="button"
                                onClick={this.handleClaim}
                              >
                                Claim
                              </button>
                              <button
                                className="danger-outline button"
                                onClick={() => this.confirmDelete()}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  </TabPane>
                  <TabPane tabId="4">
                    {this.state.vc === undefined
                      ? this.renderNotarizeTab(base64Thumbnail)
                      : this.renderNotarizationComplete()}
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
                            src={base64Thumbnail}
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
                            Please enter the text exactly as displayed to
                            confirm
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
              </Fragment>
            )}
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
      </Fragment>
    );
  }
}
export default UpdateDocumentModal;
